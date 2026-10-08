import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { actions, crudActions } from '../../security/permissions/permission-actions.js';
import { addLot, addReservation, adjustInventory, editInventory, editLotSanitaryStatus, getInventory, getInventoryAlerts, getInventoryAvailability, getInventoryDetail, getKardex, getLots, getLowStockAlerts, getPagedInventory, getReplenishment, removeReservation } from './inventory.controller.js';
import { inventoryAdjustmentSchema, inventoryLotSanitaryStatusSchema, inventoryLotSchema, inventoryReservationSchema, inventoryUpdateSchema } from './inventory.validation.js';

export const inventoryRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'Inventory',
  routePath: 'inventory',
  title: 'Inventario',
  icon: 'heroicons_solid:archive-box',
  actions: [...crudActions(), actions.technicalReview]
});

inventoryRoutes.use(authenticate);
inventoryRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getInventory));
inventoryRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedInventory));
inventoryRoutes.get('/kardex', permissionRequired(permissions.view), asyncHandler(getKardex));
inventoryRoutes.get('/lots', permissionRequired(permissions.view), asyncHandler(getLots));
inventoryRoutes.post('/lots', permissionRequired(permissions.create), validate(inventoryLotSchema), asyncHandler(addLot));
inventoryRoutes.patch('/lots/:id/sanitary-status', permissionRequired(permissions['technical-review']), validate(inventoryLotSanitaryStatusSchema), asyncHandler(editLotSanitaryStatus));
inventoryRoutes.get('/availability', permissionRequired(permissions.view), asyncHandler(getInventoryAvailability));
inventoryRoutes.get('/replenishment-suggestions', permissionRequired(permissions.view), asyncHandler(getReplenishment));
inventoryRoutes.post('/reservations', permissionRequired(permissions.create), validate(inventoryReservationSchema), asyncHandler(addReservation));
inventoryRoutes.delete('/reservations/:id', permissionRequired(permissions.delete), asyncHandler(removeReservation));
inventoryRoutes.get('/alerts/low-stock', permissionRequired(permissions.view), asyncHandler(getLowStockAlerts));
inventoryRoutes.get('/alerts', permissionRequired(permissions.view), asyncHandler(getInventoryAlerts));
inventoryRoutes.post('/adjustments', permissionRequired(permissions.create), validate(inventoryAdjustmentSchema), asyncHandler(adjustInventory));
inventoryRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getInventoryDetail));
inventoryRoutes.put('/:id', permissionRequired(permissions.edit), validate(inventoryUpdateSchema), asyncHandler(editInventory));
