import { AppDataSource } from '../../../config/data-source.js';
import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { changeFixedAssetStatus, createFixedAsset, findFixedAssetByCode, findFixedAssetById, listFixedAssetHistory, listFixedAssets, paginateFixedAssets, retireFixedAsset, toFixedAssetDto, transferFixedAsset, updateFixedAsset } from './fixed-asset.repository.js';

const findEnabledBranch = async id => AppDataSource.getRepository('Branch').findOneBy({ id, status: 'E' });

const validateFixedAsset = async (payload, excludeId = null) => {
  const branch = await findEnabledBranch(payload.branchId);
  if (!branch) return { ok: false, message: 'La sucursal seleccionada no existe o esta desactivada.' };
  const duplicated = await findFixedAssetByCode(payload.code, excludeId);
  if (duplicated) return { ok: false, message: 'El codigo del activo ya existe.' };
  return { ok: true };
};

export const addFixedAsset = async (req, res) => {
  if (req.body.status === 'D') return badRequest(res, 'Use la baja controlada para registrar fecha y motivo de baja.');
  const { ok: valid, message } = await validateFixedAsset(req.body);
  if (!valid) return badRequest(res, message);
  return created(res, await createFixedAsset(req.body), 'Activo fijo registrado correctamente.');
};

export const getFixedAssets = async (_req, res) => ok(res, await listFixedAssets());

export const getPagedFixedAssets = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateFixedAssets(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getFixedAssetDetail = async (req, res) => {
  const asset = await findFixedAssetById(Number(req.params.id));
  if (!asset) return notFound(res);
  return ok(res, toFixedAssetDto(asset));
};

export const editFixedAsset = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findFixedAssetById(id);
  if (!existing) return notFound(res);
  if (existing.status === 'D') return conflict(res, 'No se puede editar un activo dado de baja.');
  if (req.body.status === 'D') return badRequest(res, 'Use la baja controlada para registrar fecha y motivo de baja.');
  const { ok: valid, message } = await validateFixedAsset(req.body, id);
  if (!valid) return badRequest(res, message);
  await updateFixedAsset(existing, req.body, req.user?.id ?? null);
  return ok(res, toFixedAssetDto(await findFixedAssetById(id)), 'Activo fijo actualizado correctamente.');
};

export const updateFixedAssetStatus = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findFixedAssetById(id);
  if (!existing) return notFound(res);
  if (existing.status === req.body.status) return conflict(res, 'El activo ya tiene ese estado.');
  if (req.body.status === 'D') return badRequest(res, 'Use la baja controlada para registrar el motivo de baja.');
  await changeFixedAssetStatus(id, req.body.status);
  return ok(res, null, 'Estado actualizado correctamente.');
};

export const transferAsset = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findFixedAssetById(id);
  if (!existing) return notFound(res);
  if (existing.status !== 'E') return conflict(res, 'Solo se pueden trasladar activos activos.');
  const branch = await findEnabledBranch(req.body.branchId);
  if (!branch) return badRequest(res, 'La sucursal destino no existe o esta desactivada.');
  if (existing.branchId === req.body.branchId && existing.location === req.body.location && existing.responsible === req.body.responsible) return conflict(res, 'No hay cambios de traslado para registrar.');
  await transferFixedAsset(existing, req.body, req.user?.id ?? null);
  return ok(res, toFixedAssetDto(await findFixedAssetById(id)), 'Traslado registrado correctamente.');
};

export const retireAsset = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findFixedAssetById(id);
  if (!existing) return notFound(res);
  if (existing.status === 'D') return conflict(res, 'El activo ya fue dado de baja.');
  await retireFixedAsset(existing, req.body.reason, req.user?.id ?? null);
  return ok(res, null, 'Activo dado de baja correctamente.');
};

export const getFixedAssetHistory = async (req, res) => {
  const asset = await findFixedAssetById(Number(req.params.id));
  if (!asset) return notFound(res);
  return ok(res, await listFixedAssetHistory(asset.id));
};
