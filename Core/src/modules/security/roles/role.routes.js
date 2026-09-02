import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addRole, editRole, findRole, getPagedRoles, getRoles, removeRole } from './role.controller.js';
import { roleSchema } from './role.validation.js';

export const roleRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'Role',
  title: 'Roles',
  icon: 'heroicons_solid:user-group',
  actions: crudActions()
});

roleRoutes.use(authenticate);
roleRoutes.post('/', permissionRequired(permissions.create), validate(roleSchema), asyncHandler(addRole));
roleRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getRoles));
roleRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedRoles));
roleRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(findRole));
roleRoutes.put('/:id', permissionRequired(permissions.edit), validate(roleSchema), asyncHandler(editRole));
roleRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeRole));
