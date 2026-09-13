import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import {
  addRegister,
  editRegister,
  getPagedRegisters,
  getRegisters,
  removeRegister,
  updateRegisterStatus
} from './cash-register.controller.js';
import { cashRegisterSchema, cashRegisterStatusSchema } from './cash-register.validation.js';

export const cashRegisterRoutes = Router();
const permissions = registerScreen({
  category: 'Catalog',
  controller: 'CashRegister',
  routePath: 'cashregister',
  title: 'Cajas',
  icon: 'heroicons_solid:banknotes',
  actions: crudActions()
});

cashRegisterRoutes.use(authenticate);
cashRegisterRoutes.post('/', permissionRequired(permissions.create), validate(cashRegisterSchema), asyncHandler(addRegister));
cashRegisterRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getRegisters));
cashRegisterRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedRegisters));
cashRegisterRoutes.put('/:id', permissionRequired(permissions.edit), validate(cashRegisterSchema), asyncHandler(editRegister));
cashRegisterRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(cashRegisterStatusSchema), asyncHandler(updateRegisterStatus));
cashRegisterRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeRegister));