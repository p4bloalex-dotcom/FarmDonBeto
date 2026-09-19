import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { readEditActions } from '../../security/permissions/permission-actions.js';
import { editInventory, getInventory, getInventoryDetail, getPagedInventory } from './inventory.controller.js';
import { inventoryUpdateSchema } from './inventory.validation.js';

export const inventoryRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'Inventory',
  routePath: 'inventory',
  title: 'Inventario',
  icon: 'heroicons_solid:archive-box',
  actions: readEditActions()
});

inventoryRoutes.use(authenticate);
inventoryRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getInventory));
inventoryRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedInventory));
inventoryRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getInventoryDetail));
inventoryRoutes.put('/:id', permissionRequired(permissions.edit), validate(inventoryUpdateSchema), asyncHandler(editInventory));
