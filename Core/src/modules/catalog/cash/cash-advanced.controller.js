import { badRequest, created, ok } from '../../../utils/api-response.js';
import { CashAdvancedRuleError, callCenterAvailability, cashAlerts, cashCentralDashboard, createCallCenterOrder, createSaleReturn, reconcileSession } from './cash-advanced.repository.js';

const handleRule = (res, error) => error instanceof CashAdvancedRuleError ? badRequest(res, error.message) : null;

export const getCashDashboard = async (_req, res) => ok(res, await cashCentralDashboard());
export const getCashAlerts = async (_req, res) => ok(res, await cashAlerts());

export const addSaleReturn = async (req, res) => {
  try {
    return created(res, await createSaleReturn(req.body, req.user?.id ?? null), 'Devolucion registrada correctamente.');
  } catch (error) {
    const response = handleRule(res, error);
    if (response) return response;
    throw error;
  }
};

export const addReconciliation = async (req, res) => {
  try {
    return created(res, await reconcileSession(Number(req.params.sessionId), req.body.items, req.user?.id ?? null), 'Conciliacion registrada correctamente.');
  } catch (error) {
    const response = handleRule(res, error);
    if (response) return response;
    throw error;
  }
};

export const getCallCenterAvailability = async (req, res) => ok(res, await callCenterAvailability(req.body));

export const addCallCenterOrder = async (req, res) => {
  try {
    return created(res, { id: await createCallCenterOrder(req.body, req.user?.id ?? null) }, 'Pedido de call center creado correctamente.');
  } catch (error) {
    const response = handleRule(res, error);
    if (response) return response;
    throw error;
  }
};
