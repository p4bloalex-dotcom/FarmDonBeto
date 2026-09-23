import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from './inventory-kardex.service.js';

const inventory = () => AppDataSource.getRepository('Inventory');

const toDto = item => ({
  id: item.id,
  medicineId: item.medicineId,
  medicine_id: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  stockAvailable: Number(item.stockAvailable ?? 0),
  stock_available: Number(item.stockAvailable ?? 0),
  reserve: Number(item.reserve ?? 0),
  stockMin: Number(item.stockMin ?? 0),
  stock_min: Number(item.stockMin ?? 0),
  stockMax: Number(item.stockMax ?? 0),
  stock_max: Number(item.stockMax ?? 0),
  statusLabel: Number(item.stockAvailable ?? 0) <= Number(item.stockMin ?? 0) ? 'Bajo minimo' : 'Disponible'
});

const queryBase = () => inventory().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name']);

export const listInventory = async () => (await queryBase()
  .orderBy('branch.name', 'ASC')
  .addOrderBy('medicine.name', 'ASC')
  .getMany()).map(toDto);

export const paginateInventory = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase()
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC')
    .skip(offset)
    .take(pageSize)
    .getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findInventoryById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const updateInventory = async (id, data) => {
  const payload = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  if (Object.keys(payload).length === 0) return false;
  return (await inventory().update(id, payload)).affected > 0;
};

export const listKardex = async ({ branchId = null, medicineId = null } = {}) => {
  const query = AppDataSource.getRepository('InventoryKardex').createQueryBuilder('item')
    .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
    .orderBy('item.movementDate', 'DESC').addOrderBy('item.id', 'DESC');
  if (branchId) query.andWhere('item.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) query.andWhere('item.medicineId = :medicineId', { medicineId: Number(medicineId) });
  return (await query.take(500).getMany()).map(item => ({
    id: item.id,
    branchId: item.branchId,
    branchName: item.branch?.name ?? null,
    medicineId: item.medicineId,
    medicineName: item.medicine?.name ?? null,
    movementDate: item.movementDate,
    movementType: item.movementType,
    quantityIn: Number(item.quantityIn ?? 0),
    quantityOut: Number(item.quantityOut ?? 0),
    balanceAfter: Number(item.balanceAfter ?? 0),
    referenceType: item.referenceType,
    referenceId: item.referenceId,
    reason: item.reason
  }));
};

export const listLots = async ({ branchId = null, medicineId = null, expiringDays = null } = {}) => {
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('item')
    .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
    .where('item.status = :status', { status: 'E' })
    .orderBy('item.expirationDate', 'ASC');
  if (branchId) query.andWhere('item.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) query.andWhere('item.medicineId = :medicineId', { medicineId: Number(medicineId) });
  if (expiringDays) {
    const limit = new Date();
    limit.setDate(limit.getDate() + Number(expiringDays));
    query.andWhere('item.expirationDate <= :limit', { limit });
  }
  return (await query.getMany()).map(item => ({
    id: item.id,
    branchId: item.branchId,
    branchName: item.branch?.name ?? null,
    medicineId: item.medicineId,
    medicineName: item.medicine?.name ?? null,
    lotNumber: item.lotNumber,
    expirationDate: item.expirationDate,
    quantity: Number(item.quantity ?? 0),
    status: item.status
  }));
};

export const createLot = async (data, userId = null) => {
  const repo = AppDataSource.getRepository('InventoryLot');
  const saved = await repo.save(repo.create({ ...data, status: 'E', createdBy: userId }));
  return saved.id;
};

export const lowStockAlerts = async () => (await queryBase()
  .where('item.stockMin > 0')
  .andWhere('item.stockAvailable <= item.stockMin')
  .orderBy('branch.name', 'ASC')
  .addOrderBy('medicine.name', 'ASC')
    .getMany()).map(toDto);

export const inventoryAlerts = async ({ expiringDays = 60 } = {}) => {
  const lowStock = await lowStockAlerts();
  const overStock = (await queryBase()
    .where('item.stockMax > 0')
    .andWhere('item.stockAvailable >= item.stockMax')
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC')
    .getMany()).map(toDto);
  const expiringLots = await listLots({ expiringDays });
  return {
    summary: {
      lowStock: lowStock.length,
      overStock: overStock.length,
      expiringLots: expiringLots.length
    },
    lowStock,
    overStock,
    expiringLots
  };
};

export const createAdjustment = async (data, userId = null) => AppDataSource.transaction(async manager => {
  const repo = manager.getRepository('Inventory');
  let stock = await repo.findOneBy({ branchId: data.branchId, medicineId: data.medicineId });
  if (!stock) {
    stock = repo.create({ branchId: data.branchId, medicineId: data.medicineId, stockAvailable: 0, reserve: 0, stockMin: 0, stockMax: 0 });
  }
  const quantityBefore = Number(stock.stockAvailable ?? 0);
  const quantityAfter = Number(data.quantityAfter);
  const delta = quantityAfter - quantityBefore;
  stock.stockAvailable = quantityAfter;
  await repo.save(stock);
  const adjustment = await manager.getRepository('InventoryAdjustment').save(manager.getRepository('InventoryAdjustment').create({
    branchId: data.branchId,
    medicineId: data.medicineId,
    adjustmentDate: new Date(),
    quantityBefore,
    quantityAfter,
    delta,
    reason: data.reason,
    createdBy: userId
  }));
  await registerKardex(manager, { branchId: data.branchId, medicineId: data.medicineId, movementType: 'ADJUSTMENT', quantityIn: delta > 0 ? delta : 0, quantityOut: delta < 0 ? Math.abs(delta) : 0, balanceAfter: quantityAfter, referenceType: 'INVENTORY_ADJUSTMENT', referenceId: adjustment.id, reason: data.reason, userId });
  return adjustment.id;
});

export const toInventoryDto = toDto;
