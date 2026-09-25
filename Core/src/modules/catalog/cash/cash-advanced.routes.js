import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { actions } from '../../security/permissions/permission-actions.js';
import { addCallCenterOrder, addReconciliation, addSaleReturn, getCallCenterAvailability, getCashAlerts, getCashDashboard } from './cash-advanced.controller.js';
import { callCenterOrderSchema, reconciliationSchema, saleReturnSchema } from './cash-advanced.validation.js';

export const cashAdvancedRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'CashAdvanced',
  routePath: 'cash-advanced',
  title: 'Caja avanzada',
  icon: 'heroicons_solid:banknotes',
  actions: [actions.view, actions.create, actions.authorize, actions.report, actions.audit, actions.reconcile]
});

cashAdvancedRoutes.use(authenticate);
cashAdvancedRoutes.get('/dashboard', permissionRequired(permissions.report), asyncHandler(getCashDashboard));
cashAdvancedRoutes.get('/alerts', permissionRequired(permissions.view), asyncHandler(getCashAlerts));
cashAdvancedRoutes.post('/returns', permissionRequired(permissions.authorize), validate(saleReturnSchema), asyncHandler(addSaleReturn));
cashAdvancedRoutes.post('/sessions/:sessionId/reconciliation', permissionRequired(permissions.reconcile), validate(reconciliationSchema), asyncHandler(addReconciliation));
cashAdvancedRoutes.post('/call-center/availability', permissionRequired(permissions.view), asyncHandler(getCallCenterAvailability));
cashAdvancedRoutes.post('/call-center/orders', permissionRequired(permissions.create), validate(callCenterOrderSchema), asyncHandler(addCallCenterOrder));
