import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { actions, crudActions } from '../../security/permissions/permission-actions.js';
import { addDeliveryRequest, editDeliveryRequest, getDeliveryRequestDetail, getDeliveryRequests, getPagedDeliveryRequests, removeDeliveryRequest, updateDeliveryRequestStatus } from './delivery-request.controller.js';
import { deliveryRequestSchema, deliveryRequestStatusSchema } from './delivery-request.validation.js';

export const deliveryRequestRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'DeliveryRequest',
  routePath: 'delivery-request',
  title: 'Traslados entre sucursales',
  icon: 'heroicons_solid:truck',
  actions: [...crudActions(), actions.accept, actions.send, actions.deliver, actions.reject, actions.cancel]
});

const statusPermissions = {
  A: permissions.accept,
  S: permissions.send,
  D: permissions.deliver,
  R: permissions.reject,
  C: permissions.cancel
};

const statusPermissionRequired = (req, res, next) => permissionRequired(statusPermissions[req.body?.status] ?? permissions.edit)(req, res, next);

deliveryRequestRoutes.use(authenticate);
deliveryRequestRoutes.post('/', permissionRequired(permissions.create), validate(deliveryRequestSchema), asyncHandler(addDeliveryRequest));
deliveryRequestRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getDeliveryRequests));
deliveryRequestRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedDeliveryRequests));
deliveryRequestRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getDeliveryRequestDetail));
deliveryRequestRoutes.put('/:id', permissionRequired(permissions.edit), validate(deliveryRequestSchema), asyncHandler(editDeliveryRequest));
deliveryRequestRoutes.patch('/:id/status', validate(deliveryRequestStatusSchema), statusPermissionRequired, asyncHandler(updateDeliveryRequestStatus));
deliveryRequestRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeDeliveryRequest));
