import { AppDataSource } from '../../../config/data-source.js';

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

export const toInventoryDto = toDto;
