import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { findSessionById } from './cash-session.repository.js';
import {
  createMovement,
  findActiveMovementType,
  findMovementById,
  listMovementsBySession,
  paginateMovements,
  reverseMovement,
  updateMovement
} from './cash-movement.repository.js';

const findMovableSession = async sessionId => {
  const session = await findSessionById(sessionId);
  if (!session) {
    return { ok: false, reason: 'not_found' };
  }
  if (session.status !== 'A') {
    return { ok: false, reason: 'closed', session };
  }
  return { ok: true, session };
};

const validateWithinWindow = (movementDate, session) => {
  const date = new Date(movementDate);
  if (date.getTime() < new Date(session.openingDate).getTime()) {
    return 'La fecha del movimiento no puede ser anterior a la apertura de la sesion.';
  }
  if (date.getTime() > Date.now()) {
    return 'La fecha del movimiento no puede estar en el futuro.';
  }
  return null;
};

const buildMovementData = (session, body) => ({
  cashSessionId: session.id,
  branchId: session.branchId,
  movementTypeId: body.movementTypeId,
  amount: body.amount,
  description: body.description || null,
  referenceId: body.referenceId || null,
  referenceType: body.referenceType || null,
  authorizedBy: body.authorizedBy ?? null,
  movementDate: body.movementDate ?? new Date(),
  status: 'E'
});

export const addMovement = async (req, res) => {
  const { cashSessionId } = req.body;

  const { ok, session, reason } = await findMovableSession(cashSessionId);
  if (!ok) {
    return badRequest(res, reason === 'not_found' ? 'La sesion de caja no existe.' : 'La sesion de caja ya fue cerrada. No es posible registrar movimientos.');
  }

  const movementType = await findActiveMovementType(req.body.movementTypeId);
  if (!movementType) {
    return badRequest(res, 'El tipo de movimiento no existe o esta desactivado.');
  }

  const windowError = validateWithinWindow(req.body.movementDate ?? new Date(), session);
  if (windowError) {
    return badRequest(res, windowError);
  }

  return created(res, await createMovement(buildMovementData(session, req.body)));
};

export const getMovements = async (req, res) => {
  const { sessionId } = req.query;
  if (sessionId) {
    return ok(res, await listMovementsBySession(Number(sessionId)));
  }
  return ok(res, []);
};

export const getPagedMovements = async (req, res) => {
  const pagination = getPagination(req.query);
  const { sessionId } = req.query;
  const { rows, total } = await paginateMovements(pagination, sessionId ? Number(sessionId) : null);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editMovement = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findMovementById(id);
  if (!existing) {
    return notFound(res);
  }

  const { ok, session, reason } = await findMovableSession(existing.cashSessionId);
  if (!ok) {
    return conflict(res, reason === 'not_found' ? 'La sesion de caja no existe.' : 'No se puede modificar un movimiento de una sesion cerrada.');
  }

  const movementType = await findActiveMovementType(req.body.movementTypeId);
  if (!movementType) {
    return badRequest(res, 'El tipo de movimiento no existe o esta desactivado.');
  }

  const windowError = validateWithinWindow(req.body.movementDate ?? existing.movementDate, session);
  if (windowError) {
    return badRequest(res, windowError);
  }

  const updated = await updateMovement(id, buildMovementData(session, req.body));
  return updated ? ok(res, null, 'Movimiento actualizado correctamente.') : notFound(res);
};

export const removeMovement = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findMovementById(id);
  if (!existing) {
    return notFound(res);
  }

  const { ok, reason } = await findMovableSession(existing.cashSessionId);
  if (!ok) {
    return conflict(res, reason === 'not_found' ? 'La sesion de caja no existe.' : 'No se puede eliminar un movimiento de una sesion cerrada.');
  }

  if (existing.reversalOfId) {
    return conflict(res, 'No se puede reversar un movimiento que ya es reverso.');
  }

  const reversed = await reverseMovement(existing, req.user?.id ?? null);
  return reversed ? ok(res, reversed, 'Movimiento reversado correctamente.') : conflict(res, 'No existe un tipo de movimiento activo para registrar el reverso.');
};
