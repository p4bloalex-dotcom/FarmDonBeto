import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { permissionRequired } from '../../middlewares/permission-required.js';
import { registerScreen } from '../../routes/route-registry.js';
import { getReport } from './consolidated-report.controller.js';

export const consolidatedReportRoutes = Router();

const reportCatalog = {
  'sales-period': 'Ventas por periodo',
  'sales-branch': 'Ventas por sucursal',
  'sales-detail': 'Detalle de venta',
  'sales-medicine': 'Ventas por medicamento',
  'top-products': 'Productos mas vendidos',
  'low-movement-products': 'Productos con baja rotacion',
  'inventory-branch': 'Inventario por sucursal',
  'inventory-consolidated': 'Inventario consolidado',
  'expiring-medicines': 'Medicamentos proximos a vencer',
  'expired-medicines': 'Medicamentos vencidos',
  'minimum-stock': 'Stock minimo',
  'inventory-kardex': 'Kardex de inventario',
  'stock-transfers': 'Traslados entre sucursales',
  'cash-flow': 'Flujo de efectivo',
  'cash-closing': 'Cierre y diferencias de caja',
  'purchases-supplier': 'Compras por proveedor',
  'profitability-branch': 'Rentabilidad por sucursal',
  'fixed-assets': 'Activos fijos',
  'fixed-assets-detail': 'Detalle de activos fijos',
  payroll: 'Planilla',
  audit: 'Auditoria'
};

const reportActions = Object.entries(reportCatalog).map(([key, name]) => ({ key: `report_${key}`, name }));

export const permissions = registerScreen({ category: 'Reports', controller: 'ConsolidatedReport', routePath: 'consolidated-report', title: 'Reportes', icon: 'heroicons_solid:chart-bar-square', actions: reportActions });

const reportPermission = (req, res, next) => {
  const report = req.params.report === 'audit-detail' ? 'audit' : req.params.report;
  const key = `report_${report}`;
  const routePermission = permissions[key];
  return permissionRequired(routePermission)(req, res, next);
};

consolidatedReportRoutes.use(authenticate);
consolidatedReportRoutes.get('/:report', reportPermission, asyncHandler(getReport));
