import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addAdjustment, addGeneratedPayments, addPosition, addSalary, cancelPayment, editPosition, editSalary, getAdjustments, getPayments, getPositions, getSalaries } from './payroll.controller.js';
import { payrollAdjustmentSchema, payrollGenerateSchema, payrollVoidSchema, positionSchema, salarySchema } from './payroll.validation.js';

export const payrollRoutes = Router();
export const permissions = registerScreen({ category: 'Operation', controller: 'Payroll', routePath: 'payroll', title: 'Nomina', icon: 'heroicons_solid:banknotes', actions: crudActions() });

payrollRoutes.use(authenticate);
payrollRoutes.get('/positions', permissionRequired(permissions.view), asyncHandler(getPositions));
payrollRoutes.post('/positions', permissionRequired(permissions.create), validate(positionSchema), asyncHandler(addPosition));
payrollRoutes.put('/positions/:id', permissionRequired(permissions.edit), validate(positionSchema), asyncHandler(editPosition));
payrollRoutes.get('/salaries', permissionRequired(permissions.view), asyncHandler(getSalaries));
payrollRoutes.post('/salaries', permissionRequired(permissions.create), validate(salarySchema), asyncHandler(addSalary));
payrollRoutes.put('/salaries/:id', permissionRequired(permissions.edit), validate(salarySchema), asyncHandler(editSalary));
payrollRoutes.get('/payments', permissionRequired(permissions.view), asyncHandler(getPayments));
payrollRoutes.get('/adjustments', permissionRequired(permissions.view), asyncHandler(getAdjustments));
payrollRoutes.post('/adjustments', permissionRequired(permissions.create), validate(payrollAdjustmentSchema), asyncHandler(addAdjustment));
payrollRoutes.post('/generate', permissionRequired(permissions.create), validate(payrollGenerateSchema), asyncHandler(addGeneratedPayments));
payrollRoutes.patch('/payments/:id/void', permissionRequired(permissions.edit), validate(payrollVoidSchema), asyncHandler(cancelPayment));
