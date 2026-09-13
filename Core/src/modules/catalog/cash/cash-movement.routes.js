import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { permissions as cashSessionPermissions } from './cash-session.routes.js';
import {
  addMovement,
  editMovement,
  getMovements,
  getPagedMovements,
  removeMovement
} from './cash-movement.controller.js';
import { cashMovementSchema } from './cash-movement.validation.js';

export const cashMovementRoutes = Router();

cashMovementRoutes.use(authenticate);
cashMovementRoutes.post('/', permissionRequired(cashSessionPermissions.movement), validate(cashMovementSchema), asyncHandler(addMovement));
cashMovementRoutes.get('/', permissionRequired(cashSessionPermissions.movement), asyncHandler(getMovements));
cashMovementRoutes.get('/pagination', permissionRequired(cashSessionPermissions.movement), asyncHandler(getPagedMovements));
cashMovementRoutes.put('/:id', permissionRequired(cashSessionPermissions.movement), validate(cashMovementSchema), asyncHandler(editMovement));
cashMovementRoutes.delete('/:id', permissionRequired(cashSessionPermissions.movement), asyncHandler(removeMovement));