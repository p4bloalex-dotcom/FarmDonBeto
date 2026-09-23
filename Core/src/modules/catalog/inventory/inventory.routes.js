import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addLot, adjustInventory, editInventory, getInventory, getInventoryAlerts, getInventoryDetail, getKardex, getLots, getLowStockAlerts, getPagedInventory } from './inventory.controller.js';
import { inventoryAdjustmentSchema, inventoryLotSchema, inventoryUpdateSchema } from './inventory.validation.js';

export const inventoryRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'Inventory',
  routePath: 'inventory',
  title: 'Inventario',
  icon: 'heroicons_solid:archive-box',
  actions: crudActions()
});

inventoryRoutes.use(authenticate);
inventoryRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getInventory));
inventoryRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedInventory));
inventoryRoutes.get('/kardex', permissionRequired(permissions.view), asyncHandler(getKardex));
inventoryRoutes.get('/lots', permissionRequired(permissions.view), asyncHandler(getLots));
inventoryRoutes.post('/lots', permissionRequired(permissions.create), validate(inventoryLotSchema), asyncHandler(addLot));
inventoryRoutes.get('/alerts/low-stock', permissionRequired(permissions.view), asyncHandler(getLowStockAlerts));
inventoryRoutes.get('/alerts', permissionRequired(permissions.view), asyncHandler(getInventoryAlerts));
inventoryRoutes.post('/adjustments', permissionRequired(permissions.create), validate(inventoryAdjustmentSchema), asyncHandler(adjustInventory));
inventoryRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getInventoryDetail));
inventoryRoutes.put('/:id', permissionRequired(permissions.edit), validate(inventoryUpdateSchema), asyncHandler(editInventory));
