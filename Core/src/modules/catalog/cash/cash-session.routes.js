import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import {
  addSession,
  closeSession,
  getPagedSessions,
  getSessions,
  removeSession,
  sessionSummary
} from './cash-session.controller.js';
import { closeSessionSchema, openSessionSchema } from './cash-session.validation.js';

export const cashSessionRoutes = Router();
export const permissions = registerScreen({
  category: 'Catalog',
  controller: 'CashSession',
  routePath: 'cashsession',
  title: 'Caja del dia',
  icon: 'heroicons_solid:banknotes',
  actions: [...crudActions(), { key: 'close', name: 'Cerrar' }, { key: 'movement', name: 'Movimiento' }]
});

cashSessionRoutes.use(authenticate);
cashSessionRoutes.post('/', permissionRequired(permissions.create), validate(openSessionSchema), asyncHandler(addSession));
cashSessionRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getSessions));
cashSessionRoutes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedSessions));
cashSessionRoutes.get('/:id/balance', permissionRequired(permissions.view), asyncHandler(sessionSummary));
cashSessionRoutes.post('/:id/close', permissionRequired(permissions.close), validate(closeSessionSchema), asyncHandler(closeSession));
cashSessionRoutes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeSession));