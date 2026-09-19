import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addFixedAsset, editFixedAsset, getFixedAssetDetail, getFixedAssetHistory, getFixedAssets, getPagedFixedAssets, retireAsset, transferAsset, updateFixedAssetStatus } from './fixed-asset.controller.js';
import { fixedAssetRetireSchema, fixedAssetSchema, fixedAssetStatusSchema, fixedAssetTransferSchema } from './fixed-asset.validation.js';

export const fixedAssetRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'FixedAsset',
  routePath: 'fixed-asset',
  title: 'Activos fijos',
  icon: 'heroicons_solid:building-storefront',
  actions: crudActions()
});

fixedAssetRoutes.use(authenticate);
fixedAssetRoutes.post('/', permissionRequired(permissions.create), validate(fixedAssetSchema), asyncHandler(addFixedAsset));
fixedAssetRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getFixedAssets));
fixedAssetRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedFixedAssets));
fixedAssetRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getFixedAssetDetail));
fixedAssetRoutes.get('/:id/history', permissionRequired(permissions.view), asyncHandler(getFixedAssetHistory));
fixedAssetRoutes.put('/:id', permissionRequired(permissions.edit), validate(fixedAssetSchema), asyncHandler(editFixedAsset));
fixedAssetRoutes.patch('/:id/status', permissionRequired(permissions.edit), validate(fixedAssetStatusSchema), asyncHandler(updateFixedAssetStatus));
fixedAssetRoutes.post('/:id/transfer', permissionRequired(permissions.edit), validate(fixedAssetTransferSchema), asyncHandler(transferAsset));
fixedAssetRoutes.post('/:id/retire', permissionRequired(permissions.edit), validate(fixedAssetRetireSchema), asyncHandler(retireAsset));
