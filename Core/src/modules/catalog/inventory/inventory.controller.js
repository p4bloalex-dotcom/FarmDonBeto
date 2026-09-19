import { notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { findInventoryById, listInventory, paginateInventory, toInventoryDto, updateInventory } from './inventory.repository.js';

export const getInventory = async (_req, res) => ok(res, await listInventory());

export const getPagedInventory = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateInventory(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getInventoryDetail = async (req, res) => {
  const row = await findInventoryById(Number(req.params.id));
  if (!row) return notFound(res);
  return ok(res, toInventoryDto(row));
};

export const editInventory = async (req, res) => {
  const id = Number(req.params.id);
  const row = await findInventoryById(id);
  if (!row) return notFound(res);
  await updateInventory(id, req.body);
  return ok(res, toInventoryDto(await findInventoryById(id)), 'Inventario actualizado correctamente.');
};
