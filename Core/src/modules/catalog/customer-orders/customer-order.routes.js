import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addCustomerOrder, changeCustomerOrderStatus, checkAvailability, findMedicinesForOrder, getCustomerHistory, getCustomerOrderDetail, getPagedCustomerOrders } from './customer-order.controller.js';
import { availabilitySchema, customerOrderSchema, orderStatusSchema } from './customer-order.validation.js';

export const customerOrderRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'CustomerOrder',
  routePath: 'customer-order',
  title: 'Ordenes de cliente',
  icon: 'heroicons_solid:phone-arrow-up-right',
  actions: crudActions()
});

customerOrderRoutes.use(authenticate);
customerOrderRoutes.post('/availability', permissionRequired(permissions.view), validate(availabilitySchema), asyncHandler(checkAvailability));
customerOrderRoutes.get('/medicines/search', permissionRequired(permissions.view), asyncHandler(findMedicinesForOrder));
customerOrderRoutes.get('/history/:phone', permissionRequired(permissions.view), asyncHandler(getCustomerHistory));
customerOrderRoutes.post('/', permissionRequired(permissions.create), validate(customerOrderSchema), asyncHandler(addCustomerOrder));
customerOrderRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedCustomerOrders));
customerOrderRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getCustomerOrderDetail));
customerOrderRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(orderStatusSchema), asyncHandler(changeCustomerOrderStatus));
