import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addBranch, editBranch, getBranches, getPagedBranches, removeBranch, updateBranchStatus } from './branch.controller.js';
import { branchSchema, branchStatusSchema } from './branch.validation.js';

export const branchRoutes = Router();
const permissions = registerScreen({
  category: 'Catalog',
  controller: 'Branch',
  routePath: 'branch',
  title: 'Sucursales',
  icon: 'heroicons_solid:map-pin',
  actions: crudActions()
});

branchRoutes.use(authenticate);
branchRoutes.post('/', permissionRequired(permissions.create), validate(branchSchema), asyncHandler(addBranch));
branchRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getBranches));
branchRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedBranches));
branchRoutes.put('/:id', permissionRequired(permissions.edit), validate(branchSchema), asyncHandler(editBranch));
branchRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(branchStatusSchema), asyncHandler(updateBranchStatus));
branchRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeBranch));
