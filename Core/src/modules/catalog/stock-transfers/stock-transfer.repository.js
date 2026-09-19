import { AppDataSource } from '../../../config/data-source.js';
import { getRequestContext } from '../../../utils/request-context.js';

const stockTransfers = () => AppDataSource.getRepository('MoveInventory');
const details = () => AppDataSource.getRepository('MoveInventoryDetail');

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.business = true;
  }
}

const toDetailDto = item => ({
  id: item.id,
  movementId: item.movementId,
  movement_id: item.movementId,
  medicineId: item.medicineId,
  medicine_id: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  quantity: Number(item.quantity ?? 0),
  unitCost: Number(item.unitCost ?? 0),
  unit_cost: Number(item.unitCost ?? 0)
});

const toDto = item => ({
  id: item.id,
  branchOriginId: item.branchOriginId,
  branch_origin_id: item.branchOriginId,
  branchOriginName: item.branchOrigin?.name ?? null,
  branchDestinationId: item.branchDestinationId,
  branch_destination_id: item.branchDestinationId,
  branchDestinationName: item.branchDestination?.name ?? null,
  movementTypeId: item.movementTypeId,
  movement_type_id: item.movementTypeId,
  movementTypeName: item.movementType?.name ?? null,
  movementDate: item.movementDate,
  description: item.description,
  itemsCount: Number(item.itemsCount ?? 0),
  status: item.status
});

const detailQuery = () => details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name']);

export const listTransferDetails = async movementId => {
  const rows = await detailQuery()
    .where('item.movementId = :movementId', { movementId })
    .orderBy('item.id', 'ASC')
    .getMany();
  return rows.map(toDetailDto);
};

const queryBase = () => stockTransfers().createQueryBuilder('item')
  .leftJoin('item.branchOrigin', 'branchOrigin')
  .addSelect(['branchOrigin.id', 'branchOrigin.name'])
  .leftJoin('item.branchDestination', 'branchDestination')
  .addSelect(['branchDestination.id', 'branchDestination.name'])
  .leftJoin('item.movementType', 'movementType')
  .addSelect(['movementType.id', 'movementType.name'])
  .addSelect((subQuery) => subQuery
    .select('COUNT(detail.id)', 'itemsCount')
    .from('MoveInventoryDetail', 'detail')
    .where('detail.movementId = item.id'), 'itemsCount');

const applyBranchScope = async query => {
  const scope = await resolveTransferScope();
  if (scope) {
    query.andWhere('(item.branchOriginId = :scope OR item.branchDestinationId = :scope)', { scope });
  }
  return query;
};

export const resolveTransferScope = async () => {
  const store = getRequestContext();
  if (!store?.user?.id) return null;

  let isGlobal = false;
  if (store.permissionName && store.user.role) {
    const permission = await AppDataSource.getRepository('Permission')
      .findOneBy({ name: store.permissionName });
    if (permission) {
      const rolePermission = await AppDataSource.getRepository('RolePermission')
        .findOneBy({ idRole: store.user.role, idPermission: permission.id });
      isGlobal = rolePermission?.isGlobal ?? false;
    }
  }
  return isGlobal ? null : (store.user.branchId ?? null);
};

export const findTransferById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const findTransferByIdScoped = async id => {
  const query = queryBase().andWhere('item.id = :id', { id });
  await applyBranchScope(query);
  return query.getOne();
};

export const listTransfers = async () => {
  const query = queryBase().where('item.status <> :inactive', { inactive: 'I' })
    .orderBy('item.movementDate', 'DESC');
  await applyBranchScope(query);
  const rows = await query.getMany();
  return rows.map(toDto);
};

export const paginateTransfers = async ({ offset, pageSize }) => {
  const query = queryBase().orderBy('item.movementDate', 'DESC');
  await applyBranchScope(query);
  const [rows, total] = await query.skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findMovementType = async name => AppDataSource.getRepository('MovementType')
  .findOneBy({ name, status: 'E' });

const getInventory = async (manager, medicineId, branchId) =>
  manager.getRepository('Inventory').findOneBy({ medicineId, branchId });

const createInventory = (manager, medicineId, branchId, quantity) => {
  const repo = manager.getRepository('Inventory');
  return repo.save(repo.create({
    medicineId,
    branchId,
    stockAvailable: quantity,
    reserve: 0,
    stockMin: 0,
    stockMax: 0
  }));
};

const adjustStock = async (manager, medicineId, branchId, delta, subject) => {
  const repo = manager.getRepository('Inventory');
  let stock = await getInventory(manager, medicineId, branchId);
  if (!stock) {
    if (delta < 0) {
      throw new BusinessRuleError(`No se encontro inventario del medicamento ${medicineId} en la sucursal ${subject}.`);
    }
    await createInventory(manager, medicineId, branchId, delta);
    return;
  }
  const nextStock = Number(stock.stockAvailable ?? 0) + delta;
  if (nextStock < 0) {
    throw new BusinessRuleError(`Stock insuficiente del medicamento ${medicineId} en la sucursal ${subject} para aplicar el traspaso.`);
  }
  stock.stockAvailable = nextStock;
  await repo.save(stock);
};

export const createStockTransferWithDetails = async (headerData, detailData, movementTypeId) =>
  AppDataSource.transaction(async manager => {
    const header = { ...headerData, movementTypeId, status: 'E' };
    const saved = await manager.getRepository('MoveInventory')
      .save(manager.getRepository('MoveInventory').create(header));

    const detailRepo = manager.getRepository('MoveInventoryDetail');
    const rows = detailData.map(detail => detailRepo.create({ movementId: saved.id, quantity: detail.quantity, unitCost: detail.unitCost, medicineId: detail.medicineId }));
    await detailRepo.save(rows);

    for (const detail of detailData) {
      await adjustStock(manager, detail.medicineId, headerData.branchOriginId, -Number(detail.quantity), 'de origen');
      await adjustStock(manager, detail.medicineId, headerData.branchDestinationId, Number(detail.quantity), 'de destino');
    }

    return saved.id;
  });

export const updateStockTransferWithDetails = async (id, headerData, movementTypeId, detailData) =>
  AppDataSource.transaction(async manager => {
    const detailRepo = manager.getRepository('MoveInventoryDetail');
    const oldDetails = await detailRepo.findBy({ movementId: id });
    const oldByMedicine = new Map(oldDetails.map(detail => [detail.medicineId, Number(detail.quantity ?? 0)]));
    const newByMedicine = new Map(detailData.map(detail => [detail.medicineId, Number(detail.quantity)]));

    const medicineIds = new Set([...oldByMedicine.keys(), ...newByMedicine.keys()]);
    for (const medicineId of medicineIds) {
      const delta = (newByMedicine.get(medicineId) ?? 0) - (oldByMedicine.get(medicineId) ?? 0);
      if (delta === 0) continue;

      if (delta > 0) {
        await adjustStock(manager, medicineId, headerData.branchOriginId, -delta, 'de origen');
        await adjustStock(manager, medicineId, headerData.branchDestinationId, delta, 'de destino');
      } else {
        await adjustStock(manager, medicineId, headerData.branchDestinationId, delta, 'de destino');
        await adjustStock(manager, medicineId, headerData.branchOriginId, -delta, 'de origen');
      }
    }

    await detailRepo.delete({ movementId: id });
    const rows = detailData.map(detail => detailRepo.create({ movementId: id, quantity: detail.quantity, unitCost: detail.unitCost, medicineId: detail.medicineId }));
    await detailRepo.save(rows);

    await manager.getRepository('MoveInventory').update(id, { ...headerData, movementTypeId, status: 'E' });
  });

export const deleteStockTransferWithDetails = async (id, headerData) =>
  AppDataSource.transaction(async manager => {
    const detailRepo = manager.getRepository('MoveInventoryDetail');
    const existingDetails = await detailRepo.findBy({ movementId: id });

    for (const detail of existingDetails) {
      const qty = Number(detail.quantity ?? 0);
      await adjustStock(manager, detail.medicineId, headerData.branchDestinationId, -qty, 'de destino');
      await adjustStock(manager, detail.medicineId, headerData.branchOriginId, qty, 'de origen');
    }

    await detailRepo.delete({ movementId: id });
    await manager.getRepository('MoveInventory').delete(id);
  });