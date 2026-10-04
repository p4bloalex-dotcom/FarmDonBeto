import { TableColumn } from '@fuse/components/table/table-column.model';

export interface PharmacyFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'datetime' | 'url';
  required?: boolean;
  endpoint?: string;
  optionLabel?: string;
  options?: { value: string; label: string }[];
}

export interface PharmacyCatalogConfig {
  title: string;
  service: string;
  columns: TableColumn[];
  fields: PharmacyFieldConfig[];
}

export const pharmacyCatalogConfigs: Record<string, PharmacyCatalogConfig> = {
  medicineCategory: {
    title: 'Categorias de medicina',
    service: 'MedicineCategory',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'status', header: 'Estado', width: '140px', }
    ],
    fields: [{ name: 'name', label: 'Nombre', required: true }]
  },
  medicineLaboratory: {
    title: 'Laboratorios de medicina',
    service: 'MedicineLaboratory',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'status', header: 'Estado', width: '140px'}
    ],
    fields: [{ name: 'name', label: 'Nombre', required: true }]
  },
  medicinePresentation: {
    title: 'Presentaciones de medicina',
    service: 'MedicinePresentation',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'status', header: 'Estado', width: '140px' }
    ],
    fields: [{ name: 'name', label: 'Nombre', required: true }]
  },
  unitMeasurement: {
    title: 'Unidades de medida',
    service: 'UnitMeasurement',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'status', header: 'Estado', width: '140px'}
    ],
    fields: [{ name: 'name', label: 'Nombre', required: true }]
  },
  supplier: {
    title: 'Proveedores',
    service: 'Supplier',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'address', header: 'Direccion', width: '2fr'},
      { field: 'status', header: 'Estado', width: '140px'}
    ],
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'address', label: 'Direccion', type: 'textarea' }
    ]
  },
  medicine: {
    title: 'Medicamentos',
    service: 'Medicine',
    columns: [
      { field: 'code', header: 'Codigo', width: '1fr' },
      { field: 'imageUrl', header: 'Img', width: '64px', type: 'image' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'laboratoryName', header: 'Laboratorio', width: '1.5fr'},
      { field: 'presentationName', header: 'Presentacion', width: '1.5fr'},
      { field: 'priceSell', header: 'Precio venta', width: '130px'},
      { field: 'status', header: 'Estado', width: '120px'}
    ],
    fields: [
      { name: 'code', label: 'Codigo', required: true },
      { name: 'name', label: 'Nombre', required: true },
      { name: 'laboratory_id', label: 'Laboratorio', type: 'select', required: true, endpoint: 'MedicineLaboratory' },
      { name: 'presentation_id', label: 'Presentacion', type: 'select', required: true, endpoint: 'MedicinePresentation' },
      { name: 'category_id', label: 'Categoria', type: 'select', required: true, endpoint: 'MedicineCategory' },
      { name: 'unit_measurement_id', label: 'Unidad de medida', type: 'select', required: true, endpoint: 'UnitMeasurement' },
      { name: 'price_buy', label: 'Precio compra', type: 'number' },
      { name: 'price_sell', label: 'Precio venta', type: 'number' },
      { name: 'image_url', label: 'Enlace de imagen', type: 'url' },
      { name: 'description', label: 'Descripcion', type: 'textarea' }
    ]
  },
  supplierMedicine: {
    title: 'Medicamentos por proveedor',
    service: 'SupplierMedicine',
    columns: [
      // { field: 'id', header: '#', width: '70px' },
      { field: 'supplierName', header: 'Proveedor', width: '2fr' },
      { field: 'medicineName', header: 'Medicamento', width: '2fr' },
      { field: 'status', header: 'Estado', width: '140px'}
    ],
    fields: [
      { name: 'supplier_id', label: 'Proveedor', type: 'select', required: true, endpoint: 'Supplier' },
      { name: 'medicine_id', label: 'Medicamento', type: 'select', required: true, endpoint: 'Medicine' }
    ]
  },
  cashMovementType: {
    title: 'Tipos de movimiento de caja',
    service: 'CashMovementType',
    columns: [
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'operation', header: 'Operacion', width: '1fr' },
      { field: 'code', header: 'Codigo', width: '1fr', hideAt: 'sm' },
      { field: 'status', header: 'Estado', width: '130px' }
    ],
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'code', label: 'Codigo', required: true },
      { name: 'operation', label: 'Operacion', type: 'select', required: true, options: [{ value: 'I', label: 'Ingreso' }, { value: 'E', label: 'Egreso' }] }
    ]
  },
  movementType: {
    title: 'Tipos de movimiento de inventario',
    service: 'MovementType',
    columns: [
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'status', header: 'Estado', width: '130px' }
    ],
    fields: [{ name: 'name', label: 'Nombre', required: true }]
  },
  cashRegister: {
    title: 'Cajas',
    service: 'CashRegister',
    columns: [
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'code', header: 'Codigo', width: '1fr', hideAt: 'sm' },
      { field: 'branchName', header: 'Sucursal', width: '1.5fr', hideAt: 'sm' },
      { field: 'status', header: 'Estado', width: '130px' }
    ],
    fields: [
      { name: 'branch_id', label: 'Sucursal', type: 'select', required: true, endpoint: 'Branch' },
      { name: 'name', label: 'Nombre', required: true },
      { name: 'code', label: 'Codigo', required: true }
    ]
  },
  payrollPosition: {
    title: 'Puestos de nomina',
    service: 'PayrollPosition',
    columns: [
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'description', header: 'Descripcion', width: '2fr' },
      { field: 'status', header: 'Estado', width: '130px' }
    ],
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'description', label: 'Descripcion', type: 'textarea' }
    ]
  },
  payrollConcept: {
    title: 'Conceptos de nomina',
    service: 'PayrollConcept',
    columns: [
      { field: 'code', header: 'Codigo', width: '1fr' },
      { field: 'name', header: 'Nombre', width: '2fr' },
      { field: 'type', header: 'Tipo', width: '1fr' },
      { field: 'status', header: 'Estado', width: '130px' }
    ],
    fields: [
      { name: 'code', label: 'Codigo', required: true },
      { name: 'name', label: 'Nombre', required: true },
      { name: 'type', label: 'Tipo', type: 'select', required: true, options: [{ value: 'INCOME', label: 'Ingreso' }, { value: 'DEDUCTION', label: 'Deduccion' }] }
    ]
  }
};
