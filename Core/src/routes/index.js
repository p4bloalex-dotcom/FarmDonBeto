import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { branchRoutes } from '../modules/catalog/branches/branch.routes.js';
import { companyRoutes } from '../modules/catalog/companies/company.routes.js';
import { departmentRoutes } from '../modules/catalog/departments/department.routes.js';
import { municipalityRoutes } from '../modules/catalog/municipalities/municipality.routes.js';
import { personalRoutes } from '../modules/catalog/personals/personal.routes.js';
import { menuRoutes } from '../modules/security/menus/menu.routes.js';
import { permissionRoutes } from '../modules/security/permissions/permission.routes.js';
import { roleMenuRoutes } from '../modules/security/role-menus/role-menu.routes.js';
import { roleRoutes } from '../modules/security/roles/role.routes.js';
import { userRoutes } from '../modules/security/users/user.routes.js';
import { auditRoutes } from '../modules/security/audit/audit.routes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/security/roles', roleRoutes);
routes.use('/security/role-menus', roleMenuRoutes);
routes.use('/security/users', userRoutes);
routes.use('/security/menus', menuRoutes);
routes.use('/security/permissions', permissionRoutes);
routes.use('/security/audit', auditRoutes);
routes.use('/catalog/companies', companyRoutes);
routes.use('/catalog/personals', personalRoutes);
routes.use('/catalog/branches', branchRoutes);
routes.use('/catalog/departments', departmentRoutes);
routes.use('/catalog/municipalities', municipalityRoutes);
