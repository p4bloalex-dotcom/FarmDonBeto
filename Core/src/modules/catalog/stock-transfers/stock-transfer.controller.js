import { AppDataSource } from '../../../config/data-source.js';
import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { allowSecondaryBranchScope } from '../../../utils/request-context.js';
import {
  BusinessRuleError,
  createStockTransferWithDetails,
  deleteStockTransferWithDetails,
  findMovementType,
  findTransferById,
  findTransferByIdScoped,
  listTransferDetails,
  listTransfers,
  paginateTransfers,
  resolveTransferScope,
  updateStockTransferWithDetails
} from './stock-transfer.repository.js';

const MOVEMENT_TYPE_NAME = 'TRASPASO';

const toTransferResponse = async item => {
  const details = await listTransferDetails(item.id);
  return { ...item, details };
};

const findEnabled = async (name, id) => AppDataSource.getRepository(name).findOneBy({ id, status: 'E' });

const validateTransferData = async payload => {
  const branchOrigin = await findEnabled('Branch', payload.branchOriginId);
  if (!branchOrigin) {
    return { ok: false, message: 'La sucursal de origen no existe o esta desactivada.' };
  }

  const branchDestination = await findEnabled('Branch', payload.branchDestinationId);
  if (!branchDestination) {
    return { ok: false, message: 'La sucursal de destino no existe o esta desactivada.' };
  }

  if (payload.branchOriginId === payload.branchDestinationId) {
    return { ok: false, message: 'La sucursal de origen y destino deben ser diferentes.' };
  }

  if (new Date(payload.movementDate).getTime() > Date.now()) {
    return { ok: false, message: 'La fecha del traspaso no puede estar en el futuro.' };
  }

  const movementType = await findMovementType(MOVEMENT_TYPE_NAME);
  if (!movementType) {
    return { ok: false, message: 'No se configuro el tipo de movimiento de traspaso.' };
  }

  const medicineRepository = AppDataSource.getRepository('Medicine');
  for (const detail of payload.details) {
    const medicine = await medicineRepository.findOneBy({ id: detail.medicineId, status: 'E' });
    if (!medicine) {
      return { ok: false, message: `El medicamento con ID ${detail.medicineId} no existe o esta desactivado.` };
    }
  }

  return { ok: true, movementType };
};

export const addStockTransfer = async (req, res) => {
  const localScope = await resolveTransferScope();
  if (localScope) {
    const originId = Number(req.body.branchOriginId);
    const destinationId = Number(req.body.branchDestinationId);
    if (![originId, destinationId].includes(Number(localScope))) {
      return badRequest(res, 'El traspaso debe involucrar la sucursal a la que pertenece el usuario.');
    }
    allowSecondaryBranchScope(originId === Number(localScope) ? destinationId : originId);
  }

  const { ok: valid, message, movementType } = await validateTransferData(req.body);
  if (!valid) {
    return badRequest(res, message);
  }

  const header = {
    branchOriginId: req.body.branchOriginId,
    branchDestinationId: req.body.branchDestinationId,
    movementDate: req.body.movementDate,
    description: req.body.description,
    status: req.body.status ?? 'E'
  };

  try {
    const id = await createStockTransferWithDetails(header, req.body.details, movementType.id);
    const transfer = await findTransferById(id);
    return created(res, await toTransferResponse(transfer), 'Traspaso registrado correctamente. El inventario fue actualizado.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return badRequest(res, error.message);
    }
    throw error;
  }
};

export const getStockTransfers = async (_req, res) => ok(res, await listTransfers());

export const getPagedStockTransfers = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateTransfers(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getStockTransferDetail = async (req, res) => {
  const id = Number(req.params.id);
  const transfer = await findTransferByIdScoped(id);
  if (!transfer) {
    return notFound(res);
  }
  return ok(res, await toTransferResponse(transfer));
};

export const editStockTransfer = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findTransferByIdScoped(id);
  if (!existing) {
    return notFound(res);
  }
  if (existing.status === 'I') {
    return conflict(res, 'No se puede editar un traspaso anulado.');
  }

  const { ok: valid, message, movementType } = await validateTransferData(req.body);
  if (!valid) {
    return badRequest(res, message);
  }

  try {
    await updateStockTransferWithDetails(id, { ...req.body, branchOriginId: existing.branchOriginId, branchDestinationId: existing.branchDestinationId }, movementType.id, req.body.details);
    const transfer = await findTransferById(id);
    return ok(res, await toTransferResponse(transfer), 'Traspaso actualizado correctamente.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return badRequest(res, error.message);
    }
    throw error;
  }
};

export const removeStockTransfer = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findTransferByIdScoped(id);
  if (!existing) {
    return notFound(res);
  }
  if (existing.status === 'I') {
    return conflict(res, 'El traspaso ya fue anulado.');
  }

  try {
    await deleteStockTransferWithDetails(id, { branchOriginId: existing.branchOriginId, branchDestinationId: existing.branchDestinationId });
    return ok(res, null, 'Traspaso eliminado correctamente. El inventario fue actualizado.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return conflict(res, error.message);
    }
    throw error;
  }
};
