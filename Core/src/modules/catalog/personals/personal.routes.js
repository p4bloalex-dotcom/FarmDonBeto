import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addPersonal, editPersonal, getPagedPersonals, getPersonals, removePersonal, updatePersonalStatus } from './personal.controller.js';
import { personalSchema, personalStatusSchema } from './personal.validation.js';

export const personalRoutes = Router();
const permissions = registerScreen({
  category: 'Catalog',
  controller: 'Personal',
  routePath: 'personal',
  title: 'Personal',
  icon: 'heroicons_solid:identification',
  actions: crudActions()
});

personalRoutes.use(authenticate);
personalRoutes.post('/', permissionRequired(permissions.create), validate(personalSchema), asyncHandler(addPersonal));
personalRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getPersonals));
personalRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedPersonals));
personalRoutes.put('/:id', permissionRequired(permissions.edit), validate(personalSchema), asyncHandler(editPersonal));
personalRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(personalStatusSchema), asyncHandler(updatePersonalStatus));
personalRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removePersonal));
