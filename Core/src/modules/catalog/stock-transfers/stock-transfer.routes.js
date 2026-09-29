import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addStockTransfer, editStockTransfer, getPagedStockTransfers, getStockTransferDetail, getStockTransfers, removeStockTransfer } from './stock-transfer.controller.js';
import { stockTransferSchema } from './stock-transfer.validation.js';

export const stockTransferRoutes = Router();
export const permissions = registerScreen({
  category: 'Operation',
  controller: 'StockTransfer',
  routePath: 'stock-transfer',
  title: 'Movimientos de stock',
  icon: 'heroicons_solid:arrows-right-left',
  actions: crudActions()
});

stockTransferRoutes.use(authenticate);
stockTransferRoutes.post('/', permissionRequired(permissions.create), validate(stockTransferSchema), asyncHandler(addStockTransfer));
stockTransferRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getStockTransfers));
stockTransferRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedStockTransfers));
stockTransferRoutes.get('/:id', permissionRequired(permissions.view), asyncHandler(getStockTransferDetail));
stockTransferRoutes.put('/:id', permissionRequired(permissions.edit), validate(stockTransferSchema), asyncHandler(editStockTransfer));
stockTransferRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeStockTransfer));
