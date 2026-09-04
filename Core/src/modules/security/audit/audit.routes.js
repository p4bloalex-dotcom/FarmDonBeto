import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { readOnlyActions } from '../permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { getAuditLogs } from './audit.controller.js';

export const auditRoutes = Router();
const permissions = registerScreen({
  category: 'Security',
  controller: 'Audit',
  routePath: 'audit',
  title: 'Auditoria',
  icon: 'heroicons_solid:document-text',
  actions: readOnlyActions()
});

auditRoutes.use(authenticate);
auditRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getAuditLogs));
