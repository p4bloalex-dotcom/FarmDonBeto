import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { permissions as deliveryRequestPermissions } from '../delivery-requests/delivery-request.routes.js';
import { addStockTransfer, editStockTransfer, getPagedStockTransfers, getStockTransferDetail, getStockTransfers, removeStockTransfer } from './stock-transfer.controller.js';
import { stockTransferSchema } from './stock-transfer.validation.js';

export const stockTransferRoutes = Router();
export const permissions = deliveryRequestPermissions;

stockTransferRoutes.use(authenticate);
stockTransferRoutes.post('/', permissionRequired(permissions.authorize), validate(stockTransferSchema), asyncHandler(addStockTransfer));
stockTransferRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getStockTransfers));
stockTransferRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedStockTransfers));
stockTransferRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getStockTransferDetail));
stockTransferRoutes.put('/:id', permissionRequired(permissions.authorize), validate(stockTransferSchema), asyncHandler(editStockTransfer));
stockTransferRoutes.delete('/:id', permissionRequired(permissions.authorize), asyncHandler(removeStockTransfer));
