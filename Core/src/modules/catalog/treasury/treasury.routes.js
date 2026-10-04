import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addFinancialAccount, addFinancialMovement, addTransfer, editFinancialAccount, getFinancialAccounts, getFinancialMovements, getTreasurySummary, reconcileFinancialMovement, reverseFinancialMovement } from './treasury.controller.js';
import { financialAccountSchema, financialMovementSchema, reconcileSchema, reverseSchema, transferSchema } from './treasury.validation.js';

export const treasuryRoutes = Router();
export const permissions = registerScreen({ category: 'Operation', controller: 'Treasury', routePath: 'treasury', title: 'Caja y bancos', icon: 'heroicons_solid:building-library', actions: crudActions() });

treasuryRoutes.use(authenticate);
treasuryRoutes.get('/accounts', permissionRequired(permissions.view), asyncHandler(getFinancialAccounts));
treasuryRoutes.get('/summary', permissionRequired(permissions.view), asyncHandler(getTreasurySummary));
treasuryRoutes.post('/accounts', permissionRequired(permissions.create), validate(financialAccountSchema), asyncHandler(addFinancialAccount));
treasuryRoutes.put('/accounts/:id', permissionRequired(permissions.edit), validate(financialAccountSchema), asyncHandler(editFinancialAccount));
treasuryRoutes.get('/movements', permissionRequired(permissions.view), asyncHandler(getFinancialMovements));
treasuryRoutes.post('/movements', permissionRequired(permissions.create), validate(financialMovementSchema), asyncHandler(addFinancialMovement));
treasuryRoutes.post('/transfers', permissionRequired(permissions.create), validate(transferSchema), asyncHandler(addTransfer));
treasuryRoutes.patch('/movements/:id/reconcile', permissionRequired(permissions.edit), validate(reconcileSchema), asyncHandler(reconcileFinancialMovement));
treasuryRoutes.patch('/movements/:id/reverse', permissionRequired(permissions.edit), validate(reverseSchema), asyncHandler(reverseFinancialMovement));
