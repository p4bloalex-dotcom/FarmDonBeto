import { AppDataSource } from '../../../config/data-source.js';

const fixedAssets = () => AppDataSource.getRepository('FixedAsset');
const fixedAssetHistory = manager => manager.getRepository('FixedAssetHistory');

const toDto = item => {
  const purchaseCost = Number(item.purchaseCost ?? 0);
  const accumulatedDepreciation = Number(item.accumulatedDepreciation ?? 0);
  return {
    id: item.id,
    branchId: item.branchId,
    branch_id: item.branchId,
    branchName: item.branch?.name ?? null,
    code: item.code,
    name: item.name,
    category: item.category,
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
export const createFixedAsset = async data => toDto(await fixedAssets().save(fixedAssets().create(data)));
export const updateFixedAsset = async (id, data) => (await fixedAssets().update(id, data)).affected > 0;
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
