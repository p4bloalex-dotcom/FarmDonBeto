import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { actions } from '../permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { accessMenus, addMenu, editMenu, getMenus, updateMenuStatus } from './menu.controller.js';
import { changeMenuStatusSchema, menuSchema } from './menu.validation.js';

export const menuRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'Menu',
  routePath: 'menu',
  title: 'Menus',
  icon: 'heroicons_solid:list-bullet',
  actions: [actions.view, actions.create, actions.edit]
});

menuRoutes.use(authenticate);
menuRoutes.get('/access', asyncHandler(accessMenus));
menuRoutes.post('/', permissionRequired(permissions.create), validate(menuSchema), asyncHandler(addMenu));
menuRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getMenus));
menuRoutes.put('/:id', permissionRequired(permissions.edit), validate(menuSchema), asyncHandler(editMenu));
menuRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(changeMenuStatusSchema), asyncHandler(updateMenuStatus));
