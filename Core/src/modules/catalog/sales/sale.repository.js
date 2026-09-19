import { AppDataSource } from '../../../config/data-source.js';

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

const sales = () => AppDataSource.getRepository('Sale');
const details = () => AppDataSource.getRepository('SaleDetail');

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

const queryBase = () => sales().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName'])
  .addSelect(q => q.select('COUNT(detail.id)', 'itemsCount').from('SaleDetail', 'detail').where('detail.saleId = item.id'), 'itemsCount');

export const findSaleById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const listSaleDetails = async saleId => (await details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .where('item.saleId = :saleId', { saleId }).orderBy('item.id', 'ASC').getMany()).map(toDetailDto);

export const paginateSales = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase().orderBy('item.saleDate', 'DESC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const listSales = async () => (await queryBase().where('item.status = :status', { status: 'E' }).orderBy('item.saleDate', 'DESC').getMany()).map(toDto);

export const createSaleWithDetails = async (header, rawDetails, userId = null) => AppDataSource.transaction(async manager => {
  const medicineRepo = manager.getRepository('Medicine');
  const inventoryRepo = manager.getRepository('Inventory');
  const normalized = [];

  for (const detail of rawDetails) {
    const medicine = await medicineRepo.findOneBy({ id: detail.medicineId, status: 'E' });
    if (!medicine) throw new BusinessRuleError(`El medicamento ${detail.medicineId} no existe o esta inactivo.`);
    const unitPrice = detail.unitPrice == null ? Number(medicine.priceSell ?? 0) : Number(detail.unitPrice);
    const quantity = Number(detail.quantity);
    const stock = await inventoryRepo.findOneBy({ branchId: header.branchId, medicineId: detail.medicineId });
    const available = Number(stock?.stockAvailable ?? 0) - Number(stock?.reserve ?? 0);
    if (!stock || available < quantity) throw new BusinessRuleError(`Stock insuficiente para el medicamento ${medicine.name}.`);
    stock.stockAvailable = Number(stock.stockAvailable ?? 0) - quantity;
    await inventoryRepo.save(stock);
    normalized.push({ medicineId: detail.medicineId, quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100 });
  }

  const subtotal = Math.round(normalized.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const tax = header.tax == null ? Math.round(subtotal * (Number(header.taxRate ?? 0) / 100) * 100) / 100 : Number(header.tax);
  const sale = await manager.getRepository('Sale').save(manager.getRepository('Sale').create({
    branchId: header.branchId,
    employeeId: header.employeeId,
    saleDate: header.saleDate,
    subtotal,
    tax,
    total: subtotal + tax,
    paymentMethod: header.paymentMethod,
    status: 'E',
    createdBy: userId
  }));

  await manager.getRepository('SaleDetail').save(normalized.map(item => manager.getRepository('SaleDetail').create({ ...item, saleId: sale.id, status: 'E', createdBy: userId })));

  const movementType = await manager.getRepository('CashMovementType').findOneBy({ code: 'SALE', status: 'E' });
  if (!movementType) throw new BusinessRuleError('No existe el tipo de movimiento de caja SALE.');
  await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({
    cashSessionId: header.cashSessionId,
    branchId: header.branchId,
    movementTypeId: movementType.id,
    amount: subtotal + tax,
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
