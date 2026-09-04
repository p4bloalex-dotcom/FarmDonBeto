import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { actions } from '../../security/permissions/permission-actions.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { addCompany, getCompanies, getCompanyByUser } from './company.controller.js';
import { companySchema } from './company.validation.js';

export const companyRoutes = Router();
const permissions = registerScreen({
  category: 'Catalog',
  controller: 'Company',
  routePath: 'company',
  title: 'Empresa',
  icon: 'heroicons_solid:building-office',
  actions: [actions.view, actions.create]
});

companyRoutes.use(authenticate);
companyRoutes.post('/', permissionRequired(permissions.create), validate(companySchema), asyncHandler(addCompany));
companyRoutes.get('/findByUser', asyncHandler(getCompanyByUser));
companyRoutes.get('/', permissionRequired(permissions.view), asyncHandler(getCompanies));
