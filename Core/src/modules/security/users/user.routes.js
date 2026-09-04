import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addUser, editUser, getPagedUsers, getUsers, removeUser, resetPassword } from './user.controller.js';
import { userEditSchema, userSchema } from './user.validation.js';

export const userRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'User',
  routePath: 'user',
  title: 'Usuarios',
  icon: 'heroicons_solid:user',
  actions: crudActions()
});

userRoutes.use(authenticate);
userRoutes.post('/', permissionRequired(permissions.create), validate(userSchema), asyncHandler(addUser));
userRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getUsers));
userRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedUsers));
userRoutes.put('/:id', permissionRequired(permissions.edit), validate(userEditSchema), asyncHandler(editUser));
userRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeUser));
userRoutes.post('/reset-password', permissionRequired(permissions.edit), asyncHandler(resetPassword));
