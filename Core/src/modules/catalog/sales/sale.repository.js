import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from '../inventory/inventory-kardex.service.js';
import { consumeLotsFefo, LotConsumptionError } from '../inventory/inventory-lot.service.js';

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

const sales = () => AppDataSource.getRepository('Sale');
const details = () => AppDataSource.getRepository('SaleDetail');
const receipts = () => AppDataSource.getRepository('SaleReceipt');

const toDto = item => ({
  id: item.id,
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  employeeId: item.employeeId,
  employeeName: item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : null,
  saleDate: item.saleDate,
  subtotal: Number(item.subtotal ?? 0),
  tax: Number(item.tax ?? 0),
  total: Number(item.total ?? 0),
  paymentMethod: item.paymentMethod,
  cashSessionId: item.cashSessionId ?? null,
  felStatus: item.felStatus ?? 'PENDING',
  status: item.status,
  itemsCount: Number(item.itemsCount ?? 0)
});

const toDetailDto = item => ({
  id: item.id,
  saleId: item.saleId,
  medicineId: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  quantity: Number(item.quantity ?? 0),
  unitPrice: Number(item.unitPrice ?? 0),
  total: Number(item.total ?? 0)
});

const toPaymentDto = item => ({
  id: item.id,
  saleId: item.saleId,
  method: item.method,
  amount: Number(item.amount ?? 0),
  receivedAmount: item.receivedAmount == null ? null : Number(item.receivedAmount),
  changeAmount: item.changeAmount == null ? null : Number(item.changeAmount),
  authorizationCode: item.authorizationCode ?? null
});

const toReceiptDto = item => item ? ({
  id: item.id,
  saleId: item.saleId,
  receiptNumber: item.receiptNumber,
  documentType: item.documentType,
  customerTaxId: item.customerTaxId ?? null,
  customerName: item.customerName ?? null,
  subtotal: Number(item.subtotal ?? 0),
  tax: Number(item.tax ?? 0),
  total: Number(item.total ?? 0),
  paidTotal: Number(item.paidTotal ?? 0),
  changeAmount: Number(item.changeAmount ?? 0),
  issuedAt: item.issuedAt,
  status: item.status
}) : null;

const queryBase = () => sales().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName'])
  .addSelect(q => q.select('COUNT(detail.id)', 'itemsCount').from('SaleDetail', 'detail').where('detail.saleId = item.id'), 'itemsCount');

export const findSaleById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const listSaleDetails = async saleId => (await details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .where('item.saleId = :saleId', { saleId }).orderBy('item.id', 'ASC').getMany()).map(toDetailDto);

export const listSalePayments = async saleId => (await AppDataSource.getRepository('SalePayment').find({ where: { saleId, status: 'E' }, order: { id: 'ASC' } })).map(toPaymentDto);

export const findSaleReceipt = async saleId => toReceiptDto(await receipts().findOneBy({ saleId, status: 'E' }));

export const paginateSales = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase().orderBy('item.saleDate', 'DESC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const listSales = async () => (await queryBase().where('item.status = :status', { status: 'E' }).orderBy('item.saleDate', 'DESC').getMany()).map(toDto);

export const createSaleWithDetails = async (header, rawDetails, userId = null) => AppDataSource.transaction(async manager => {
  const medicineRepo = manager.getRepository('Medicine');
  const inventoryRepo = manager.getRepository('Inventory');
  const normalized = [];
  const cashSession = await manager.getRepository('CashSession').findOneBy({ id: header.cashSessionId, status: 'A' });
  if (!cashSession) throw new BusinessRuleError('La caja seleccionada no esta abierta.');
  if (Number(cashSession.branchId) !== Number(header.branchId)) throw new BusinessRuleError('La caja seleccionada no pertenece a la sucursal de la venta.');

  for (const detail of rawDetails) {
    const medicine = await medicineRepo.findOneBy({ id: detail.medicineId, status: 'E' });
    if (!medicine) throw new BusinessRuleError(`El medicamento ${detail.medicineId} no existe o esta inactivo.`);
    const unitPrice = detail.unitPrice == null ? Number(medicine.priceSell ?? 0) : Number(detail.unitPrice);
    const quantity = Number(detail.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new BusinessRuleError(`Cantidad invalida para el medicamento ${medicine.name}.`);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new BusinessRuleError(`Precio invalido para el medicamento ${medicine.name}.`);
    const stock = await inventoryRepo.findOneBy({ branchId: header.branchId, medicineId: detail.medicineId });
    const available = Number(stock?.stockAvailable ?? 0) - Number(stock?.reserve ?? 0);
    if (!stock || available < quantity) throw new BusinessRuleError(`Stock insuficiente para el medicamento ${medicine.name}.`);
    let consumedLots = [];
    try {
      consumedLots = await consumeLotsFefo(manager, { branchId: header.branchId, medicineId: detail.medicineId, quantity, referenceType: 'SALE', userId });
    } catch (error) {
      if (error instanceof LotConsumptionError) throw new BusinessRuleError(error.message);
      throw error;
    }
    stock.stockAvailable = Number(stock.stockAvailable ?? 0) - quantity;
    await inventoryRepo.save(stock);
    normalized.push({ medicineId: detail.medicineId, quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100, consumedLots });
    normalized[normalized.length - 1].balanceAfter = Number(stock.stockAvailable ?? 0);
  }

  const subtotal = Math.round(normalized.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const tax = header.tax == null ? Math.round(subtotal * (Number(header.taxRate ?? 0) / 100) * 100) / 100 : Number(header.tax);
  const total = Math.round((subtotal + tax) * 100) / 100;
  const rawPayments = (header.payments?.length ? header.payments : [{ method: header.paymentMethod, amount: total }])
    .map(payment => {
      const method = String(payment.method).toUpperCase();
      const amount = Number(payment.amount ?? 0);
      return { ...payment, method, amount, receivedAmount: method === 'CASH' && payment.receivedAmount == null ? amount : payment.receivedAmount };
    });
  const paymentTotal = Math.round(rawPayments.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100;
  if (paymentTotal + 0.01 < total) throw new BusinessRuleError('La suma de pagos debe cubrir el total de la venta.');
  let overpaid = Math.round((paymentTotal - total) * 100) / 100;
  if (overpaid > 0.01 && !rawPayments.some(payment => payment.method === 'CASH')) throw new BusinessRuleError('El excedente de pago solo puede devolverse como cambio en efectivo.');
  for (const payment of rawPayments) {
    if (overpaid <= 0.01 || payment.method !== 'CASH') continue;
    const discount = Math.min(payment.amount, overpaid);
    payment.amount = Math.round((payment.amount - discount) * 100) / 100;
    overpaid = Math.round((overpaid - discount) * 100) / 100;
  }
  if (overpaid > 0.01 || rawPayments.some(payment => payment.amount <= 0)) throw new BusinessRuleError('Los montos de pago no son validos para el total de la venta.');

  const sale = await manager.getRepository('Sale').save(manager.getRepository('Sale').create({
    branchId: header.branchId,
    employeeId: header.employeeId,
    cashSessionId: header.cashSessionId,
    saleDate: header.saleDate,
    subtotal,
    tax,
    total,
    paymentMethod: rawPayments.length > 1 ? 'MIXED' : rawPayments[0].method,
    felStatus: 'PENDING',
    status: 'E',
    createdBy: userId
  }));

  const savedPayments = await manager.getRepository('SalePayment').save(rawPayments.map(payment => {
    const method = String(payment.method).toUpperCase();
    const receivedAmount = payment.receivedAmount == null ? null : Number(payment.receivedAmount);
    const amount = Number(payment.amount);
    if (method === 'CASH' && receivedAmount != null && receivedAmount < amount) throw new BusinessRuleError('El efectivo recibido no puede ser menor al monto cobrado.');
    return manager.getRepository('SalePayment').create({
      saleId: sale.id,
      branchId: header.branchId,
      method,
      amount,
      receivedAmount,
      changeAmount: method === 'CASH' && receivedAmount != null ? Math.round((receivedAmount - amount) * 100) / 100 : null,
      cardBrand: payment.cardBrand || null,
      cardLast4: payment.cardLast4 || null,
      authorizationCode: payment.authorizationCode || null,
      status: 'E',
      createdBy: userId
    });
  }));

  const paidTotal = Math.round(savedPayments.reduce((sum, payment) => sum + Number(payment.receivedAmount ?? payment.amount ?? 0), 0) * 100) / 100;
  const changeAmount = Math.round(savedPayments.reduce((sum, payment) => sum + Number(payment.changeAmount ?? 0), 0) * 100) / 100;
  await manager.getRepository('SaleReceipt').save(manager.getRepository('SaleReceipt').create({
    saleId: sale.id,
    branchId: header.branchId,
    receiptNumber: `REC-${String(sale.id).padStart(8, '0')}`,
    documentType: header.documentType ?? 'RECEIPT',
    customerTaxId: header.taxId ?? 'CF',
    customerName: header.customerName ?? 'Consumidor final',
    subtotal,
    tax,
    total,
    paidTotal,
    changeAmount,
    issuedAt: header.saleDate,
    status: 'E',
    createdBy: userId
  }));

  const savedDetails = await manager.getRepository('SaleDetail').save(normalized.map(item => manager.getRepository('SaleDetail').create({ medicineId: item.medicineId, quantity: item.quantity, unitPrice: item.unitPrice, total: item.total, saleId: sale.id, status: 'E', createdBy: userId })));

  const saleLotDetails = [];
  savedDetails.forEach((detail, index) => {
    for (const lot of normalized[index].consumedLots) {
      saleLotDetails.push(manager.getRepository('SaleLotDetail').create({
        saleDetailId: detail.id,
        branchId: header.branchId,
        inventoryLotId: lot.lotId,
        lotNumber: lot.lotNumber,
        expirationDate: lot.expirationDate,
        quantity: lot.quantity,
        createdBy: userId
      }));
    }
  });
  if (saleLotDetails.length) await manager.getRepository('SaleLotDetail').save(saleLotDetails);

  for (const item of normalized) {
    for (const lot of item.consumedLots) {
      await registerKardex(manager, { branchId: header.branchId, medicineId: item.medicineId, inventoryLotId: lot.lotId, movementType: 'SALE', quantityOut: lot.quantity, previousBalance: lot.previousBalance, balanceAfter: lot.newBalance, unitCost: item.unitPrice, referenceType: 'SALE', referenceId: sale.id, userId });
    }
  }

  const movementType = await manager.getRepository('CashMovementType').findOneBy({ code: 'SALE', status: 'E' });
  if (!movementType) throw new BusinessRuleError('No existe el tipo de movimiento de caja SALE.');
  const cashAmount = Math.round(rawPayments.filter(payment => String(payment.method).toUpperCase() === 'CASH').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) * 100) / 100;
  if (cashAmount > 0) await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({
    cashSessionId: header.cashSessionId,
    branchId: header.branchId,
    movementTypeId: movementType.id,
    amount: cashAmount,
    description: `Venta presencial #${sale.id}`,
    referenceId: sale.id,
    referenceType: 'SALE',
    movementDate: header.saleDate,
    status: 'E',
    createdBy: userId
  }));

  return sale.id;
});

export const toSaleDto = toDto;
