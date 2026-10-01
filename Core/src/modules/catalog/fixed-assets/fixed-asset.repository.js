import { AppDataSource } from '../../../config/data-source.js';

const fixedAssets = () => AppDataSource.getRepository('FixedAsset');
const fixedAssetHistory = manager => manager.getRepository('FixedAssetHistory');

const parseJson = value => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
};

const calculateDepreciation = item => {
  const purchaseCost = Number(item.purchaseCost ?? 0);
  const usefulLifeMonths = Number(item.usefulLifeMonths ?? 0);
  const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;
  if (!purchaseCost || !usefulLifeMonths || !purchaseDate || isNaN(purchaseDate.getTime())) return 0;
  const now = new Date();
  const months = Math.max((now.getFullYear() - purchaseDate.getFullYear()) * 12 + now.getMonth() - purchaseDate.getMonth() + (now.getDate() >= purchaseDate.getDate() ? 0 : -1), 0);
  return Math.min(Number(((purchaseCost / usefulLifeMonths) * months).toFixed(2)), purchaseCost);
};

const normalizeAssetData = data => ({
  ...data,
  accumulatedDepreciation: calculateDepreciation(data),
  attributes: data.attributes ? JSON.stringify(data.attributes) : null
});

const toDto = item => {
  const purchaseCost = Number(item.purchaseCost ?? 0);
  const accumulatedDepreciation = calculateDepreciation(item);
  return {
    id: item.id,
    branchId: item.branchId,
    branch_id: item.branchId,
    branchName: item.branch?.name ?? null,
    code: item.code,
    name: item.name,
    category: item.category,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serialNumber,
    serial_number: item.serialNumber,
    location: item.location,
    responsible: item.responsible,
    purchaseDate: item.purchaseDate,
    purchase_date: item.purchaseDate,
    purchaseCost,
    purchase_cost: purchaseCost,
    accumulatedDepreciation,
    accumulated_depreciation: accumulatedDepreciation,
    bookValue: Math.max(purchaseCost - accumulatedDepreciation, 0),
    book_value: Math.max(purchaseCost - accumulatedDepreciation, 0),
    usefulLifeMonths: item.usefulLifeMonths,
    useful_life_months: item.usefulLifeMonths,
    supplier: item.supplier,
    condition: item.condition,
    attributes: parseJson(item.attributes),
    notes: item.notes,
    retiredAt: item.retiredAt,
    retired_at: item.retiredAt,
    retiredReason: item.retiredReason,
    retired_reason: item.retiredReason,
    status: item.status
  };
};

const historyDto = item => ({
  id: item.id,
  fixedAssetId: item.fixedAssetId,
  action: item.action,
  branchFromId: item.branchFromId,
  branchToId: item.branchToId,
  branchFromName: item.branchFrom?.name ?? null,
  branchToName: item.branchTo?.name ?? null,
  locationFrom: item.locationFrom,
  locationTo: item.locationTo,
  responsibleFrom: item.responsibleFrom,
  responsibleTo: item.responsibleTo,
  reason: item.reason,
  createdAt: item.createdAt,
  createdBy: item.createdBy
});

const queryBase = () => fixedAssets().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name']);

export const listFixedAssets = async () => (await queryBase().where('item.status <> :inactive', { inactive: 'I' }).orderBy('branch.name', 'ASC').addOrderBy('item.name', 'ASC').getMany()).map(toDto);

export const paginateFixedAssets = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase().orderBy('branch.name', 'ASC').addOrderBy('item.name', 'ASC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findFixedAssetById = async id => queryBase().where('item.id = :id', { id }).getOne();
export const findFixedAssetByCode = async (code, excludeId = null) => {
  const query = fixedAssets().createQueryBuilder('item').where('item.code = :code', { code }).andWhere('item.status <> :inactive', { inactive: 'I' });
  if (excludeId) query.andWhere('item.id <> :excludeId', { excludeId });
  return query.getOne();
};
export const createFixedAsset = async data => toDto(await fixedAssets().save(fixedAssets().create(normalizeAssetData(data))));
export const updateFixedAsset = async (asset, data, userId = null) => AppDataSource.transaction(async manager => {
  const normalized = normalizeAssetData({ ...data, updatedBy: userId });
  await manager.getRepository('FixedAsset').update(asset.id, normalized);
  const changedAssignment = asset.branchId !== data.branchId || (asset.location ?? null) !== (data.location ?? null) || (asset.responsible ?? null) !== (data.responsible ?? null);
  if (changedAssignment) {
    await fixedAssetHistory(manager).save(fixedAssetHistory(manager).create({
      fixedAssetId: asset.id,
      action: 'ASSIGNMENT',
      branchFromId: asset.branchId,
      branchToId: data.branchId,
      locationFrom: asset.location,
      locationTo: data.location,
      responsibleFrom: asset.responsible,
      responsibleTo: data.responsible,
      reason: 'Cambio de asignacion',
      createdBy: userId
    }));
  }
  return true;
});
export const changeFixedAssetStatus = async (id, status) => (await fixedAssets().update(id, { status })).affected > 0;
export const listFixedAssetHistory = async fixedAssetId => (await AppDataSource.getRepository('FixedAssetHistory')
  .createQueryBuilder('item')
  .leftJoin('item.branchFrom', 'branchFrom')
  .leftJoin('item.branchTo', 'branchTo')
  .addSelect(['branchFrom.id', 'branchFrom.name', 'branchTo.id', 'branchTo.name'])
  .where('item.fixedAssetId = :fixedAssetId', { fixedAssetId })
  .orderBy('item.createdAt', 'DESC')
  .getMany()).map(historyDto);

export const transferFixedAsset = async (asset, data, userId = null) => AppDataSource.transaction(async manager => {
  await manager.getRepository('FixedAsset').update(asset.id, {
    branchId: data.branchId,
    location: data.location,
    responsible: data.responsible,
    updatedBy: userId
  });
  await fixedAssetHistory(manager).save(fixedAssetHistory(manager).create({
    fixedAssetId: asset.id,
    action: 'TRANSFERRED',
    branchFromId: asset.branchId,
    branchToId: data.branchId,
    locationFrom: asset.location,
    locationTo: data.location,
    responsibleFrom: asset.responsible,
    responsibleTo: data.responsible,
    reason: data.reason,
    createdBy: userId
  }));
});

export const retireFixedAsset = async (asset, reason, userId = null) => AppDataSource.transaction(async manager => {
  await manager.getRepository('FixedAsset').update(asset.id, { status: 'D', retiredAt: new Date(), retiredReason: reason, updatedBy: userId });
  await fixedAssetHistory(manager).save(fixedAssetHistory(manager).create({
    fixedAssetId: asset.id,
    action: 'RETIRED',
    branchFromId: asset.branchId,
    locationFrom: asset.location,
    responsibleFrom: asset.responsible,
    reason,
    createdBy: userId
  }));
});
export const toFixedAssetDto = toDto;
