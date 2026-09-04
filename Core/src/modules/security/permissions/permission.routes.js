import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { readEditActions } from './permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { getPermissionScreens, getPermissions, setRolePermission } from './permission.controller.js';
import { updateRolePermissionSchema } from './permission.validation.js';

export const permissionRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'Permission',
  routePath: 'roleaction',
  title: 'Permisos',
  icon: 'heroicons_solid:key',
  actions: readEditActions()
});

permissionRoutes.use(authenticate);
permissionRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getPermissions));
permissionRoutes.get('/screens', permissionRequired(permissions.view), asyncHandler(getPermissionScreens));
permissionRoutes.put('/role', permissionRequired(permissions.edit), validate(updateRolePermissionSchema), asyncHandler(setRolePermission));
