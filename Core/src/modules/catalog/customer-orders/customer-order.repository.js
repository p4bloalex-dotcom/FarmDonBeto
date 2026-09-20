import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from '../inventory/inventory-kardex.service.js';
import { consumeLotsFefo, LotConsumptionError } from '../inventory/inventory-lot.service.js';

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
  paymentMethod: item.paymentMethod,
  estimatedDeliveryMinutes: item.estimatedDeliveryMinutes,
  subtotal: Number(item.subtotal ?? 0),
  deliveryFee: Number(item.deliveryFee ?? 0),
  total: Number(item.total ?? 0),
  itemsCount: Number(item.itemsCount ?? 0),
  notes: item.notes,
  status: item.status
});

const queryBase = () => orders().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name'])
  .addSelect(subQuery => subQuery.select('COUNT(detail.id)', 'itemsCount').from('CustomerOrderDetail', 'detail').where('detail.orderId = item.id'), 'itemsCount');

export const paginateOrders = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase().orderBy('item.orderDate', 'DESC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findOrderById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const listOrderDetails = async orderId => (await details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .where('item.orderId = :orderId', { orderId })
  .orderBy('item.id', 'ASC')
  .getMany()).map(detailDto);

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

export const getAvailability = async data => {
  const items = Array.isArray(data) ? data : data.items;
  const deliveryLatitude = Array.isArray(data) ? null : data.deliveryLatitude;
  const deliveryLongitude = Array.isArray(data) ? null : data.deliveryLongitude;
  const branches = await AppDataSource.getRepository('Branch').findBy({ status: 'E' });
  const result = [];
  for (const branch of branches) {
    const availability = [];
    let canFulfill = true;
    const distance = distanceKm(branch.latitude, branch.longitude, deliveryLatitude, deliveryLongitude);
    const coverageRadiusKm = Number(branch.coverageRadiusKm ?? 8);
    const insideCoverage = distance === null || coverageRadiusKm <= 0 || distance <= coverageRadiusKm;
    for (const item of items) {
      const inventory = await AppDataSource.getRepository('Inventory').findOne({ where: { branchId: branch.id, medicineId: item.medicineId }, relations: { medicine: true } });
      const available = inventory ? availableQty(inventory) : 0;
      if (available < Number(item.quantity)) canFulfill = false;
      availability.push({ medicineId: item.medicineId, medicineName: inventory?.medicine?.name ?? null, requested: Number(item.quantity), available });
    }
    canFulfill = canFulfill && insideCoverage;
    result.push({
      branchId: branch.id,
      branchName: branch.name,
      canFulfill,
      distanceKm: distance === null ? null : Math.round(distance * 100) / 100,
      coverageRadiusKm,
      insideCoverage,
      estimatedDeliveryMinutes: canFulfill ? estimateDeliveryMinutes(branch, distance) : null,
      availability
    });
  }
  return result.sort((a, b) => Number(b.canFulfill) - Number(a.canFulfill) || Number(a.distanceKm ?? 999999) - Number(b.distanceKm ?? 999999) || a.branchName.localeCompare(b.branchName));
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

export const updateOrderStatus = async (order, status, userId = null) => AppDataSource.transaction(async manager => {
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
  }
  await manager.getRepository('CustomerOrder').update(order.id, { status, updatedBy: userId });
});

export const toOrderDto = toDto;
