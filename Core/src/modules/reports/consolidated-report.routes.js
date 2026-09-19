import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { permissionRequired } from '../../middlewares/permission-required.js';
import { registerScreen } from '../../routes/route-registry.js';
import { readOnlyActions } from '../security/permissions/permission-actions.js';
import { getCashFlowReport, getFixedAssetReport, getInventoryKardexReport, getPayrollReport, getTransferReport } from './consolidated-report.controller.js';

export const consolidatedReportRoutes = Router();
export const permissions = registerScreen({ category: 'Reports', controller: 'ConsolidatedReport', routePath: 'consolidated-report', title: 'Reportes consolidados', icon: 'heroicons_solid:chart-bar-square', actions: readOnlyActions() });

consolidatedReportRoutes.use(authenticate);
consolidatedReportRoutes.get('/cash-flow', permissionRequired(permissions.view), asyncHandler(getCashFlowReport));
consolidatedReportRoutes.get('/inventory-kardex', permissionRequired(permissions.view), asyncHandler(getInventoryKardexReport));
consolidatedReportRoutes.get('/stock-transfers', permissionRequired(permissions.view), asyncHandler(getTransferReport));
consolidatedReportRoutes.get('/fixed-assets', permissionRequired(permissions.view), asyncHandler(getFixedAssetReport));
consolidatedReportRoutes.get('/payroll', permissionRequired(permissions.view), asyncHandler(getPayrollReport));
