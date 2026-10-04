import { badRequest, created, ok } from '../../../utils/api-response.js';
import { BusinessRuleError, createAccount, createManualMovement, getSummary, listAccounts, listMovements, reconcileMovement, reverseMovement, transferFunds, updateAccount } from './treasury.repository.js';

export const getFinancialAccounts = async (_req, res) => ok(res, await listAccounts());
export const addFinancialAccount = async (req, res) => created(res, await createAccount(req.body, req.user?.id ?? null), 'Cuenta financiera registrada correctamente.');
export const editFinancialAccount = async (req, res) => ok(res, { updated: await updateAccount(Number(req.params.id), req.body, req.user?.id ?? null) }, 'Cuenta financiera actualizada correctamente.');
export const getFinancialMovements = async (_req, res) => ok(res, await listMovements());
export const getTreasurySummary = async (_req, res) => ok(res, await getSummary());
export const addFinancialMovement = async (req, res) => {
  try {
    return created(res, await createManualMovement(req.body, req.user?.id ?? null), 'Movimiento financiero registrado correctamente.');
  } catch (error) {
    if (error instanceof BusinessRuleError) return badRequest(res, error.message);
    throw error;
  }
};
export const addTransfer = async (req, res) => {
  try { return created(res, await transferFunds(req.body, req.user?.id ?? null), 'Transferencia registrada correctamente.'); }
  catch (error) { if (error instanceof BusinessRuleError) return badRequest(res, error.message); throw error; }
};
export const reconcileFinancialMovement = async (req, res) => {
  try { return ok(res, await reconcileMovement(Number(req.params.id), req.body.note, req.user?.id ?? null), 'Movimiento conciliado correctamente.'); }
  catch (error) { if (error instanceof BusinessRuleError) return badRequest(res, error.message); throw error; }
};
export const reverseFinancialMovement = async (req, res) => {
  try { return ok(res, await reverseMovement(Number(req.params.id), req.body.reason, req.user?.id ?? null), 'Movimiento anulado con reversa correctamente.'); }
  catch (error) { if (error instanceof BusinessRuleError) return badRequest(res, error.message); throw error; }
};
