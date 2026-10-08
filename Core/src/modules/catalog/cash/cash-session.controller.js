import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { findRegisterWithBranch } from './cash-register.repository.js';
import {
  countMovementsBySession,
  createSession,
  deleteSession,
  findOpenSessionByRegister,
  findSessionById,
  listSessions,
  paginateSessions,
  sessionBalance,
  updateSession
} from './cash-session.repository.js';

const buildBalance = async session => {
  const { income, expense } = await sessionBalance(session.id);
  const expectedAmount = Number(session.openingAmount ?? 0) + income - expense;
  return { income, expense, expectedAmount };
};

const toCents = value => Math.round((Number(value) || 0) * 100);

const breakdownTotal = breakdown => {
  if (!breakdown) return null;
  const denominations = { q100: 100, q50: 50, q20: 20, q10: 10, q5: 5, q1: 1 };
  const billsAndCoins = Object.entries(denominations).reduce((total, [key, value]) => total + (Number(breakdown[key]) || 0) * value, 0);
  return billsAndCoins + (Number(breakdown.cents) || 0) / 100;
};

const hasInvalidBreakdown = breakdown => {
  if (!breakdown) return false;
  const hasInvalidDenomination = ['q100', 'q50', 'q20', 'q10', 'q5', 'q1'].some(key => {
    const value = Number(breakdown[key] ?? 0);
    return !Number.isInteger(value) || value < 0;
  });

  const cents = Number(breakdown.cents ?? 0);
  return hasInvalidDenomination || !Number.isInteger(cents) || cents < 0 || cents > 99;
};

export const addSession = async (req, res) => {
  const { cashRegisterId, openingAmount, openingDate } = req.body;

  const register = await findRegisterWithBranch(cashRegisterId);
  if (!register) {
    return badRequest(res, 'La caja seleccionada no existe.');
  }
  if (register.status !== 'E') {
    return badRequest(res, 'La caja seleccionada esta desactivada.');
  }
  if (await findOpenSessionByRegister(cashRegisterId)) {
    return conflict(res, 'La caja ya tiene una sesion abierta. Cierrela antes de abrir otra.');
  }

  const session = await createSession({
    cashRegisterId,
    branchId: register.branchId,
    openingAmount: openingAmount ?? 0,
    openingDate: openingDate ?? new Date(),
    status: 'A'
  });

  return created(res, session, 'Sesion abierta correctamente.');
};

export const getSessions = async (req, res) => {
  const { status } = req.query;
  const rows = await listSessions(status || null);
  return ok(res, rows);
};

export const getPagedSessions = async (req, res) => {
  const pagination = getPagination(req.query);
  const { status } = req.query;
  const { rows, total } = await paginateSessions(pagination, status || null);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const sessionSummary = async (req, res) => {
  const id = Number(req.params.id);
  const session = await findSessionById(id);
  if (!session) {
    return notFound(res);
  }

  const { income, expense, expectedAmount } = await buildBalance(session);
  return ok(res, {
    session,
    summary: {
      income,
      expense,
      expectedAmount
    }
  });
};

export const closeSession = async (req, res) => {
  const id = Number(req.params.id);
  const session = await findSessionById(id);
  if (!session) {
    return notFound(res);
  }
  if (session.status !== 'A') {
    return conflict(res, 'La sesion no esta abierta.');
  }

  const { closingAmount, closingDate, countedBreakdown, differenceExplanation, authorizedBy } = req.body;
  if (new Date(closingDate).getTime() < new Date(session.openingDate).getTime()) {
    return badRequest(res, 'La fecha de cierre no puede ser anterior a la apertura.');
  }

  if (hasInvalidBreakdown(countedBreakdown)) {
    return badRequest(res, 'El desglose de efectivo solo puede contener cantidades enteras no negativas.');
  }

  const countedTotal = breakdownTotal(countedBreakdown);
  if (countedTotal !== null && toCents(countedTotal) !== toCents(closingAmount)) {
    return badRequest(res, 'El desglose de efectivo debe coincidir con el monto contado.');
  }

  const { expectedAmount } = await buildBalance(session);
  const differenceAmount = Number(closingAmount) - expectedAmount;
  const absoluteDifference = Math.abs(differenceAmount);
  if (absoluteDifference > 50 && !authorizedBy) {
    return badRequest(res, 'La diferencia supera la tolerancia permitida y requiere autorizacion.');
  }
  if (absoluteDifference > 5 && !differenceExplanation) {
    return badRequest(res, 'La diferencia requiere explicacion.');
  }

  const updated = await updateSession(id, {
    closingAmount,
    closingDate,
    expectedAmount,
    differenceAmount,
    countedBreakdown: countedBreakdown ? JSON.stringify(countedBreakdown) : null,
    differenceExplanation: differenceExplanation || null,
    authorizedBy: authorizedBy ?? null,
    status: 'C'
  });

  if (!updated) {
    return notFound(res);
  }

  const closed = await findSessionById(id);
  return ok(res, closed, 'Sesion cerrada correctamente.');
};

export const removeSession = async (req, res) => {
  const id = Number(req.params.id);
  const session = await findSessionById(id);
  if (!session) {
    return notFound(res);
  }
  if (session.status === 'A') {
    return conflict(res, 'No se puede eliminar una sesion abierta. Cierrela primero.');
  }

  const movements = await countMovementsBySession(id);
  if (movements > 0) {
    return conflict(res, 'No se puede eliminar una sesion con movimientos registrados.');
  }

  const deleted = await deleteSession(id);
  return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
};
