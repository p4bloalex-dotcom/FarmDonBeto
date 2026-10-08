import { created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { badRequest } from '../../../utils/api-response.js';
import { cancelReservation, createAdjustment, createLot, createReservation, findInventoryById, getAvailability, getReplenishmentSuggestions, inventoryAlerts, listInventory, listKardex, listLots, lowStockAlerts, paginateInventory, toInventoryDto, updateInventory, updateLotSanitaryStatus } from './inventory.repository.js';

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

export const getKardex = async (req, res) => ok(res, await listKardex(req.query));

export const getLots = async (req, res) => ok(res, await listLots(req.query));

export const addLot = async (req, res) => created(res, { id: await createLot(req.body, req.user?.id ?? null) }, 'Lote registrado correctamente.');

export const editLotSanitaryStatus = async (req, res) => {
  const updated = await updateLotSanitaryStatus(req.params.id, req.body, req.user?.id ?? null);
  if (!updated) return notFound(res);
  return ok(res, { id: Number(req.params.id) }, 'Estado sanitario del lote actualizado.');
};

export const getLowStockAlerts = async (_req, res) => ok(res, await lowStockAlerts());

export const getInventoryAlerts = async (req, res) => ok(res, await inventoryAlerts(req.query));

export const adjustInventory = async (req, res) => created(res, { id: await createAdjustment(req.body, req.user?.id ?? null) }, 'Ajuste registrado y auditado correctamente.');

export const getInventoryAvailability = async (req, res) => ok(res, await getAvailability(req.query));

export const addReservation = async (req, res) => {
  try {
    return created(res, { id: await createReservation(req.body, req.user?.id ?? null) }, 'Reserva registrada correctamente.');
  } catch (error) {
    return badRequest(res, error.message);
  }
};

export const removeReservation = async (req, res) => {
  const deleted = await cancelReservation(req.params.id, req.user?.id ?? null);
  if (!deleted) return notFound(res);
  return ok(res, null, 'Reserva cancelada correctamente.');
};

export const getReplenishment = async (req, res) => ok(res, await getReplenishmentSuggestions(req.query));
