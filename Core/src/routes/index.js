import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { menuRoutes } from '../modules/security/menus/menu.routes.js';
import { permissionRoutes } from '../modules/security/permissions/permission.routes.js';
import { roleRoutes } from '../modules/security/roles/role.routes.js';
import { auditRoutes } from '../modules/security/audit/audit.routes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/security/roles', roleRoutes);
routes.use('/security/menus', menuRoutes);
routes.use('/security/permissions', permissionRoutes);
routes.use('/security/audit', auditRoutes);
