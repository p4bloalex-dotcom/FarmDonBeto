import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addSale, getPagedSales, getSaleDetail, getSales } from './sale.controller.js';
import { saleSchema } from './sale.validation.js';

export const saleRoutes = Router();
export const permissions = registerScreen({ category: 'Operation', controller: 'Sale', routePath: 'sale', title: 'Ventas', icon: 'heroicons_solid:receipt-percent', actions: crudActions() });

saleRoutes.use(authenticate);
saleRoutes.post('/', permissionRequired(permissions.create), validate(saleSchema), asyncHandler(addSale));
saleRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getSales));
saleRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedSales));
saleRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getSaleDetail));
