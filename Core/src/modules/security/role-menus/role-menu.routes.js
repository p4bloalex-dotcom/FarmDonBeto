import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addRoleMenu, editRoleMenu, getPagedRoleMenus, getRoleMenus, removeRoleMenu, saveRoleMenusBulk } from './role-menu.controller.js';
import { roleMenuBulkSchema, roleMenuSchema } from './role-menu.validation.js';

export const roleMenuRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'MenuRol',
  routePath: 'menurol',
  title: 'Menus por rol',
  icon: 'heroicons_solid:squares-plus',
  actions: crudActions()
});

roleMenuRoutes.use(authenticate);
roleMenuRoutes.post('/', permissionRequired(permissions.create), validate(roleMenuSchema), asyncHandler(addRoleMenu));
roleMenuRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getRoleMenus));
roleMenuRoutes.put('/bulk', permissionRequired(permissions.edit), validate(roleMenuBulkSchema), asyncHandler(saveRoleMenusBulk));
roleMenuRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedRoleMenus));
roleMenuRoutes.put('/:id', permissionRequired(permissions.edit), validate(roleMenuSchema), asyncHandler(editRoleMenu));
roleMenuRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeRoleMenu));
