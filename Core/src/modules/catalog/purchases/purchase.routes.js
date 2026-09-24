import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import {
  addPurchase,
  addPurchaseOrder,
  addPurchaseReceipt,
  addPurchaseRequest,
  addPurchaseReturn,
  addSupplierInvoice,
  approvePurchaseOrder,
  editPurchase,
  getNetworkAvailability,
  getPurchaseDashboard,
  getPurchaseDetail,
  getPagedPurchases,
  getPurchaseRequests,
  getPurchases,
  removePurchase
} from './purchase.controller.js';
import { purchaseSchema } from './purchase.validation.js';

export const purchaseRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'Purchase',
  routePath: 'purchase',
  title: 'Compras',
  icon: 'heroicons_solid:shopping-cart',
  actions: crudActions()
});

purchaseRoutes.use(authenticate);
purchaseRoutes.get('/dashboard', permissionRequired(permissions.view), asyncHandler(getPurchaseDashboard));
purchaseRoutes.get('/network-availability', permissionRequired(permissions.view), asyncHandler(getNetworkAvailability));
purchaseRoutes.post('/requests', permissionRequired(permissions.create), asyncHandler(addPurchaseRequest));
purchaseRoutes.get('/requests', permissionRequired(permissions.view), asyncHandler(getPurchaseRequests));
purchaseRoutes.post('/orders', permissionRequired(permissions.create), asyncHandler(addPurchaseOrder));
purchaseRoutes.post('/orders/:id/approve', permissionRequired(permissions.edit), asyncHandler(approvePurchaseOrder));
purchaseRoutes.post('/receipts', permissionRequired(permissions.create), asyncHandler(addPurchaseReceipt));
purchaseRoutes.post('/invoices', permissionRequired(permissions.create), asyncHandler(addSupplierInvoice));
purchaseRoutes.post('/returns', permissionRequired(permissions.create), asyncHandler(addPurchaseReturn));
purchaseRoutes.post('/', permissionRequired(permissions.create), validate(purchaseSchema), asyncHandler(addPurchase));
purchaseRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getPurchases));
purchaseRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedPurchases));
purchaseRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getPurchaseDetail));
purchaseRoutes.put('/:id', permissionRequired(permissions.edit), validate(purchaseSchema), asyncHandler(editPurchase));
purchaseRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removePurchase));
