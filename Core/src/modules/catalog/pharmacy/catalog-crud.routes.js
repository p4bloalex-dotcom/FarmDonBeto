import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { permissionRequired } from '../../../middlewares/permission-required.js';
import { validate } from '../../../middlewares/validate.js';
import { registerScreen } from '../../../routes/route-registry.js';
import { crudActions } from '../../security/permissions/permission-actions.js';
import { addItem, editItem, getItems, getPagedItems, removeItem, updateItemStatus } from './catalog-crud.controller.js';
import { cashMovementTypeSchema, medicineSchema, nameSchema, statusSchema, supplierMedicineSchema, supplierSchema } from './catalog-crud.validation.js';

export const createCatalogCrudRoutes = ({ entityName, controller, routePath, title, icon, schema }) => {
  const routes = Router();
  const permissions = registerScreen({
    category: 'Catalog',
    controller,
    routePath,
    title,
    icon,
    actions: crudActions()
  });

  routes.use(authenticate);
  routes.post('/', permissionRequired(permissions.create), validate(schema), asyncHandler(addItem(entityName)));
  routes.get('/', permissionRequired(permissions.view), asyncHandler(getItems(entityName)));
  routes.get('/pagination', permissionRequired(permissions.view), asyncHandler(getPagedItems(entityName)));
  routes.put('/:id', permissionRequired(permissions.edit), validate(schema), asyncHandler(editItem(entityName)));
  routes.patch('/:id/status', permissionRequired(permissions.edit), validate(statusSchema), asyncHandler(updateItemStatus(entityName)));
  routes.delete('/:id', permissionRequired(permissions.delete), asyncHandler(removeItem(entityName)));

  return routes;
};

export const medicineCategoryRoutes = createCatalogCrudRoutes({ entityName: 'MedicineCategory', controller: 'MedicineCategory', routePath: 'medicinecategory', title: 'Categorias de medicina', icon: 'heroicons_solid:tag', schema: nameSchema });
export const medicineLaboratoryRoutes = createCatalogCrudRoutes({ entityName: 'MedicineLaboratory', controller: 'MedicineLaboratory', routePath: 'medicinelaboratory', title: 'Laboratorios', icon: 'heroicons_solid:beaker', schema: nameSchema });
export const medicinePresentationRoutes = createCatalogCrudRoutes({ entityName: 'MedicinePresentation', controller: 'MedicinePresentation', routePath: 'medicinepresentation', title: 'Presentaciones', icon: 'heroicons_solid:squares-2x2', schema: nameSchema });
export const unitMeasurementRoutes = createCatalogCrudRoutes({ entityName: 'UnitMeasurement', controller: 'UnitMeasurement', routePath: 'unitmeasurement', title: 'Unidades de medida', icon: 'heroicons_solid:scale', schema: nameSchema });
export const supplierRoutes = createCatalogCrudRoutes({ entityName: 'Supplier', controller: 'Supplier', routePath: 'supplier', title: 'Proveedores', icon: 'heroicons_solid:truck', schema: supplierSchema });
export const medicineRoutes = createCatalogCrudRoutes({ entityName: 'Medicine', controller: 'Medicine', routePath: 'medicine', title: 'Medicamentos', icon: 'heroicons_solid:archive-box', schema: medicineSchema });
export const supplierMedicineRoutes = createCatalogCrudRoutes({ entityName: 'SupplierMedicine', controller: 'SupplierMedicine', routePath: 'suppliermedicine', title: 'Medicamentos por proveedor', icon: 'heroicons_solid:clipboard-document-list', schema: supplierMedicineSchema });
export const cashMovementTypeRoutes = createCatalogCrudRoutes({ entityName: 'CashMovementType', controller: 'CashMovementType', routePath: 'cashmovementtype', title: 'Tipos de movimiento de caja', icon: 'heroicons_solid:arrows-right-left', schema: cashMovementTypeSchema });
