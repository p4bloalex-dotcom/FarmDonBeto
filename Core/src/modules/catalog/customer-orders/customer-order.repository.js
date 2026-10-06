import { AppDataSource } from '../../../config/data-source.js';
import { calculateDrivingRoute } from '../../../services/geolocation.service.js';
import { registerKardex } from '../inventory/inventory-kardex.service.js';
import { consumeLotsFefo, LotConsumptionError } from '../inventory/inventory-lot.service.js';
import { Like } from 'typeorm';

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.business = true;
  }
}

const orders = () => AppDataSource.getRepository('CustomerOrder');
const details = () => AppDataSource.getRepository('CustomerOrderDetail');

const detailDto = item => ({
  id: item.id,
  orderId: item.orderId,
  medicineId: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  quantity: Number(item.quantity ?? 0),
  unitPrice: Number(item.unitPrice ?? 0),
  subtotal: Number(item.subtotal ?? 0)
});

const toDto = item => ({
  id: item.id,
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  orderDate: item.orderDate,
  customerName: item.customerName,
  customerPhone: item.customerPhone,
  deliveryAddress: item.deliveryAddress,
  deliveryReference: item.deliveryReference,
  deliveryLatitude: item.deliveryLatitude == null ? null : Number(item.deliveryLatitude),
  deliveryLongitude: item.deliveryLongitude == null ? null : Number(item.deliveryLongitude),
  paymentMethod: item.paymentMethod,
  paymentStatus: item.paymentStatus,
  saleId: item.saleId,
  estimatedDeliveryMinutes: item.estimatedDeliveryMinutes,
  subtotal: Number(item.subtotal ?? 0),
  deliveryFee: Number(item.deliveryFee ?? 0),
  total: Number(item.total ?? 0),
  itemsCount: Number(item.itemsCount ?? 0),
  notes: item.notes,
  status: item.status,
  canShip: item.status === 'P',
  canDeliver: item.status === 'S',
  canCancel: ['P', 'S'].includes(item.status)
});

const queryBase = () => orders().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name'])
  .addSelect(subQuery => subQuery.select('COUNT(detail.id)', 'itemsCount').from('CustomerOrderDetail', 'detail').where('detail.orderId = item.id'), 'itemsCount');

export const paginateOrders = async ({ offset, pageSize }, filters = {}) => {
  const query = queryBase();
  if (filters.customerPhone) query.andWhere('item.customerPhone = :customerPhone', { customerPhone: filters.customerPhone });
  if (filters.paymentStatus) query.andWhere('item.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
  if (filters.status) query.andWhere('item.status = :status', { status: filters.status });
  if (filters.branchId) query.andWhere('item.branchId = :branchId', { branchId: Number(filters.branchId) });
  const [rows, total] = await query.orderBy('item.orderDate', 'DESC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findOrderById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const listOrderDetails = async orderId => (await details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .where('item.orderId = :orderId', { orderId })
  .orderBy('item.id', 'ASC')
  .getMany()).map(detailDto);

export const listOrdersByPhone = async customerPhone => (await queryBase()
  .where('item.customerPhone = :customerPhone', { customerPhone })
  .orderBy('item.orderDate', 'DESC')
  .take(20)
  .getMany()).map(toDto);

const availableQty = item => Number(item.stockAvailable ?? 0) - Number(item.reserve ?? 0);

const toRadians = value => Number(value) * Math.PI / 180;

const distanceKm = (fromLat, fromLng, toLat, toLng) => {
  if ([fromLat, fromLng, toLat, toLng].some(value => value === null || value === undefined || Number.isNaN(Number(value)))) return null;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(Number(toLat) - Number(fromLat));
  const deltaLng = toRadians(Number(toLng) - Number(fromLng));
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const estimateDeliveryMinutes = (branch, distance) => {
  const base = Number(branch.averageDeliveryMinutes ?? 25);
  if (distance === null) return base;
  return Math.max(10, base + Math.ceil((distance / 25) * 60));
};

const routeEstimate = async (branch, deliveryLatitude, deliveryLongitude, fallbackDistance) => {
  const fallback = {
    distanceKm: fallbackDistance === null ? null : Math.round(fallbackDistance * 100) / 100,
    estimatedDeliveryMinutes: estimateDeliveryMinutes(branch, fallbackDistance),
    etaSource: fallbackDistance === null ? 'BRANCH_AVERAGE' : 'DISTANCE_ESTIMATE'
  };
  if ([branch.latitude, branch.longitude, deliveryLatitude, deliveryLongitude].some(value => value === null || value === undefined)) return fallback;
  try {
    const route = await calculateDrivingRoute({ fromLatitude: branch.latitude, fromLongitude: branch.longitude, toLatitude: deliveryLatitude, toLongitude: deliveryLongitude });
    return { distanceKm: route.distanceKm, estimatedDeliveryMinutes: Math.max(Number(branch.averageDeliveryMinutes ?? 0), route.durationMinutes), etaSource: 'OPENROUTE' };
  } catch {
    return fallback;
  }
};

export const getAvailability = async data => {
  const items = Array.isArray(data) ? data : data.items;
  const deliveryLatitude = Array.isArray(data) ? null : data.deliveryLatitude;
  const deliveryLongitude = Array.isArray(data) ? null : data.deliveryLongitude;
  if (deliveryLatitude == null || deliveryLongitude == null) throw new BusinessRuleError('Debe indicar coordenadas de entrega validas. La geocodificacion automatica queda preparada para integrarse en el cliente o servicio externo.');
  const branches = await AppDataSource.getRepository('Branch').findBy({ status: 'E' });
  const medicineFilter = data.medicineSearch ? String(data.medicineSearch).trim() : null;
  const activeOrders = await AppDataSource.getRepository('CustomerOrder').createQueryBuilder('o')
    .select('o.branchId', 'branchId')
    .addSelect('COUNT(o.id)', 'activeOrders')
    .where("o.status IN ('P','S')")
    .groupBy('o.branchId')
    .getRawMany();
  const loadByBranch = new Map(activeOrders.map(row => [Number(row.branchId), Number(row.activeOrders ?? 0)]));
  const result = [];
  for (const branch of branches) {
    const availability = [];
    let canFulfill = true;
    const distance = distanceKm(branch.latitude, branch.longitude, deliveryLatitude, deliveryLongitude);
    const coverageRadiusKm = Number(branch.coverageRadiusKm ?? 8);
    const insideCoverage = distance === null || coverageRadiusKm <= 0 || distance <= coverageRadiusKm;
    for (const item of items) {
      const inventory = await AppDataSource.getRepository('Inventory').findOne({ where: { branchId: branch.id, medicineId: item.medicineId }, relations: { medicine: true } });
      if (medicineFilter && inventory?.medicine?.name && !inventory.medicine.name.toLowerCase().includes(medicineFilter.toLowerCase()) && !String(inventory.medicine.code ?? '').toLowerCase().includes(medicineFilter.toLowerCase())) continue;
      const available = inventory ? availableQty(inventory) : 0;
      if (available < Number(item.quantity)) canFulfill = false;
      availability.push({ medicineId: item.medicineId, medicineName: inventory?.medicine?.name ?? null, requested: Number(item.quantity), available });
    }
    canFulfill = canFulfill && insideCoverage;
    const activeLoad = loadByBranch.get(Number(branch.id)) ?? 0;
    const stockRatio = availability.length ? availability.reduce((sum, item) => sum + Math.min(item.available / Math.max(item.requested, 1), 2), 0) / availability.length : 0;
    const score = Math.round(((canFulfill ? 1000 : 0) + Math.min(stockRatio, 2) * 100 - Number(distance ?? 99) * 10 - activeLoad * 25 + (insideCoverage ? 100 : -300)) * 100) / 100;
    const route = await routeEstimate(branch, deliveryLatitude, deliveryLongitude, distance);
    result.push({
      branchId: branch.id,
      branchName: branch.name,
      canFulfill,
      score,
      suggested: false,
      activeOrders: activeLoad,
      distanceKm: route.distanceKm,
      coverageRadiusKm,
      insideCoverage,
      estimatedDeliveryMinutes: canFulfill ? route.estimatedDeliveryMinutes : null,
      etaSource: canFulfill ? route.etaSource : null,
      availability
    });
  }
  const ordered = result.sort((a, b) => b.score - a.score || Number(b.canFulfill) - Number(a.canFulfill) || Number(a.distanceKm ?? 999999) - Number(b.distanceKm ?? 999999) || a.branchName.localeCompare(b.branchName));
  if (ordered[0]) ordered[0].suggested = true;
  return ordered;
};

const reserveStock = async (manager, branchId, items) => {
  const inventoryRepo = manager.getRepository('Inventory');
  for (const item of items) {
    const stock = await inventoryRepo.findOneBy({ branchId, medicineId: item.medicineId });
    if (!stock || availableQty(stock) < Number(item.quantity)) throw new BusinessRuleError(`Stock insuficiente para el medicamento ${item.medicineId} en la sucursal seleccionada.`);
    stock.reserve = Number(stock.reserve ?? 0) + Number(item.quantity);
    await inventoryRepo.save(stock);
  }
};

const releaseReserve = async (manager, branchId, detailsRows) => {
  const inventoryRepo = manager.getRepository('Inventory');
  for (const item of detailsRows) {
    const stock = await inventoryRepo.findOneBy({ branchId, medicineId: item.medicineId });
    if (!stock) throw new BusinessRuleError('No se encontro inventario para liberar reserva.');
    stock.reserve = Math.max(Number(stock.reserve ?? 0) - Number(item.quantity ?? 0), 0);
    await inventoryRepo.save(stock);
  }
};

export const createOrder = async (data, userId = null) => AppDataSource.transaction(async manager => {
  if (data.deliveryLatitude == null || data.deliveryLongitude == null) throw new BusinessRuleError('Debe indicar coordenadas de entrega validas.');
  if (['CARD', 'TRANSFER'].includes(data.paymentMethod) && data.paymentStatus !== 'PAID') throw new BusinessRuleError('Las ordenes con tarjeta o transferencia deben registrarse con pago confirmado.');
  const availability = await getAvailability({ deliveryLatitude: data.deliveryLatitude, deliveryLongitude: data.deliveryLongitude, items: data.items });
  const selectedBranch = availability.find(item => Number(item.branchId) === Number(data.branchId));
  if (!selectedBranch) throw new BusinessRuleError('La sucursal seleccionada no esta disponible para el operador actual.');
  if (!selectedBranch.canFulfill) throw new BusinessRuleError(selectedBranch.insideCoverage ? 'La sucursal seleccionada no tiene stock suficiente.' : 'La sucursal seleccionada esta fuera de cobertura para la entrega.');
  const medicineRepo = manager.getRepository('Medicine');
  const normalizedItems = [];
  for (const item of data.items) {
    const medicine = await medicineRepo.findOneBy({ id: item.medicineId, status: 'E' });
    if (!medicine) throw new BusinessRuleError(`El medicamento ${item.medicineId} no existe o esta inactivo.`);
    const unitPrice = Number(medicine.priceSell ?? 0);
    normalizedItems.push({ medicineId: item.medicineId, quantity: Number(item.quantity), unitPrice, subtotal: unitPrice * Number(item.quantity) });
  }
  await reserveStock(manager, data.branchId, normalizedItems);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const order = await manager.getRepository('CustomerOrder').save(manager.getRepository('CustomerOrder').create({
    ...data,
    orderDate: new Date(),
    subtotal,
    total: subtotal + Number(data.deliveryFee ?? 0),
    status: 'P',
    createdBy: userId
  }));
  await manager.getRepository('CustomerOrderDetail').save(normalizedItems.map(item => manager.getRepository('CustomerOrderDetail').create({ ...item, orderId: order.id, status: 'E', createdBy: userId })));
  return order.id;
});

export const updateOrderStatus = async (order, status, userId = null, reason = null) => AppDataSource.transaction(async manager => {
  if (order.status === status) throw new BusinessRuleError('La orden ya tiene ese estado.');
  const rows = await manager.getRepository('CustomerOrderDetail').findBy({ orderId: order.id });
  if (status === 'S' && order.status !== 'P') throw new BusinessRuleError('Solo una orden pendiente puede marcarse en ruta.');
  if (status === 'D' && order.status !== 'S') throw new BusinessRuleError('Solo una orden en ruta puede marcarse entregada.');
  if (status === 'C' && !['P', 'S'].includes(order.status)) throw new BusinessRuleError('Solo se pueden cancelar ordenes pendientes o en ruta.');
  if (status === 'C') await releaseReserve(manager, order.branchId, rows);
  if (status === 'D') {
    const inventoryRepo = manager.getRepository('Inventory');
    for (const item of rows) {
      const stock = await inventoryRepo.findOneBy({ branchId: order.branchId, medicineId: item.medicineId });
      if (!stock || Number(stock.reserve ?? 0) < Number(item.quantity ?? 0)) throw new BusinessRuleError('La reserva de inventario no cubre la entrega.');
      try {
        await consumeLotsFefo(manager, { branchId: order.branchId, medicineId: item.medicineId, quantity: Number(item.quantity ?? 0), referenceType: 'CUSTOMER_ORDER', referenceId: order.id, userId });
      } catch (error) {
        if (error instanceof LotConsumptionError) throw new BusinessRuleError(error.message);
        throw error;
      }
      stock.reserve = Number(stock.reserve ?? 0) - Number(item.quantity ?? 0);
      stock.stockAvailable = Number(stock.stockAvailable ?? 0) - Number(item.quantity ?? 0);
      if (Number(stock.stockAvailable) < 0) throw new BusinessRuleError('Stock insuficiente para completar la entrega.');
      await inventoryRepo.save(stock);
      await registerKardex(manager, { branchId: order.branchId, medicineId: item.medicineId, movementType: 'CUSTOMER_ORDER_DELIVERY', quantityOut: Number(item.quantity ?? 0), balanceAfter: Number(stock.stockAvailable ?? 0), referenceType: 'CUSTOMER_ORDER', referenceId: order.id, userId });
    }
    if (order.paymentMethod !== 'COD' && order.paymentStatus !== 'PAID') throw new BusinessRuleError('No se puede entregar una orden sin pago confirmado.');
    const session = await manager.getRepository('CashSession').findOneBy({ branchId: order.branchId, status: 'A' });
    if (!session) throw new BusinessRuleError('No hay caja abierta para convertir la orden entregada a venta.');
    const employee = await manager.getRepository('Employee').findOneBy({ branchId: order.branchId, status: 'E' });
    if (!employee) throw new BusinessRuleError('No hay empleado activo asociado a la sucursal para registrar la venta.');
    const sale = await manager.getRepository('Sale').save(manager.getRepository('Sale').create({
      branchId: order.branchId,
      employeeId: employee.id,
      saleDate: new Date(),
      subtotal: Number(order.subtotal ?? 0),
      tax: 0,
      total: Number(order.total ?? 0),
      paymentMethod: order.paymentMethod,
      cashSessionId: session.id,
      felStatus: 'PENDING',
      originalOrderId: order.id,
      status: 'E',
      createdBy: userId
    }));
    await manager.getRepository('SaleDetail').save(rows.map(item => manager.getRepository('SaleDetail').create({ saleId: sale.id, medicineId: item.medicineId, quantity: Number(item.quantity ?? 0), unitPrice: Number(item.unitPrice ?? 0), total: Number(item.subtotal ?? 0), status: 'E', createdBy: userId })));
    await manager.getRepository('SalePayment').save(manager.getRepository('SalePayment').create({ saleId: sale.id, branchId: order.branchId, method: order.paymentMethod, amount: Number(order.total ?? 0), status: 'E', createdBy: userId }));
    const movementType = await manager.getRepository('CashMovementType').findOneBy({ code: 'SALE', status: 'E' });
    if (!movementType) throw new BusinessRuleError('No existe el tipo de movimiento de caja SALE.');
    await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({ cashSessionId: session.id, branchId: order.branchId, movementTypeId: movementType.id, amount: Number(order.total ?? 0), description: `Orden entregada #${order.id}`, referenceId: sale.id, referenceType: 'CUSTOMER_ORDER', movementDate: new Date(), status: 'E', createdBy: userId }));
    order.saleId = sale.id;
  }
  const statusUpdate = { status, saleId: order.saleId ?? null, paymentStatus: status === 'D' && order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus, updatedBy: userId };
  if (status === 'C') statusUpdate.notes = [order.notes, `Cancelada: ${reason}`].filter(Boolean).join(' | ').slice(0, 255);
  await manager.getRepository('CustomerOrder').update(order.id, statusUpdate);
});

export const searchMedicines = async term => (await AppDataSource.getRepository('Medicine').find({
  where: [
    { status: 'E', name: Like(`%${term}%`) },
    { status: 'E', code: Like(`%${term}%`) }
  ],
  take: 10,
  order: { name: 'ASC' }
})).map(item => ({ id: item.id, code: item.code, name: item.name, priceSell: Number(item.priceSell ?? 0) }));

export const toOrderDto = toDto;
