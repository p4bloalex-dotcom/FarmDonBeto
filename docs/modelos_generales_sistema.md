# Modelos generales del sistema

Fecha de revision: 8 de octubre de 2026.

Este documento resume los modelos existentes a nivel de codigo. No describe infraestructura ni detalles tecnicos internos; organiza las entidades segun el uso funcional del sistema.

## Criterio de clasificacion

En este sistema, un modulo es una operacion o pantalla principal del negocio. Por eso se consideran modulos las operaciones, reportes y seguridad. Los mantenimientos y catalogos no se tratan como modulos principales; se documentan como modelos de soporte porque alimentan a las operaciones.

La base del documento son las entidades de `Core/src/entities`, las rutas registradas en `Core/src/modules` y las pantallas declaradas en `Front/src/app/modules/admin`.

## Modulos operativos

### Caja del dia

Pantalla: `cashsession`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `CashSession` | `TB_CASH_SESSION` | Apertura, cierre, monto inicial, monto contado, monto esperado y diferencias de caja. |
| `CashMovement` | `TB_CASH_MOVEMENT` | Entradas, salidas, reversas y referencias de movimientos dentro de una sesion de caja. |
| `CashReconciliation` | `TB_CASH_RECONCILIATION` | Conciliacion o cuadre asociado al efectivo registrado. |
| `CashRegister` | `TB_CASH_REGISTER` | Caja fisica o punto de cobro usado para abrir sesiones. |
| `CashMovementType` | `TB_CASH_MOVEMENT_TYPE` | Clasificacion de movimientos de caja. |

Relacion funcional: una caja se abre por sucursal, registra ventas o movimientos manuales, y se cierra comparando el monto esperado contra el contado.

### Compras

Pantalla: `purchase`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `Purchase` | `TB_PURCHASE` | Encabezado de compra: proveedor, sucursal, fechas, factura, totales, estado y aprobacion. |
| `PurchaseDetail` | `TB_PURCHASE_DETAIL` | Medicamentos comprados, cantidades, precios, descuentos, impuestos, lote y vencimiento. |
| `PurchaseReceipt` | `TB_PURCHASE_RECEIPT` | Recepcion de mercaderia de una compra. |
| `PurchaseReceiptDetail` | `TB_PURCHASE_RECEIPT_DETAIL` | Detalle recibido por producto/lote. |
| `PurchaseRequest` | `TB_PURCHASE_REQUEST` | Solicitud previa de compra. |
| `PurchaseRequestDetail` | `TB_PURCHASE_REQUEST_DETAIL` | Detalle de productos solicitados. |
| `PurchaseReturn` | `TB_PURCHASE_RETURN` | Devoluciones relacionadas con compras. |
| `SupplierInvoice` | `TB_SUPPLIER_INVOICE` | Documento o factura del proveedor. |

Relacion funcional: la compra concentra proveedor, sucursal y valores; sus detalles alimentan recepciones, lotes, inventario y posibles devoluciones.

### Traslados entre sucursales

Pantalla: `delivery-request`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `DeliveryRequest` | `TB_DELIVERY_REQUEST` | Solicitud de traslado entre una sucursal solicitante y una sucursal que abastece. |
| `DeliveryRequestDetail` | `TB_DELIVERY_REQUEST_DETAIL` | Medicamentos y cantidades solicitadas en el traslado. |
| `MoveInventory` | `TB_MOVE_INVENTORY` | Movimiento de inventario entre origen y destino. |
| `MoveInventoryDetail` | `TB_MOVE_INVENTORY_DETAIL` | Detalle de productos movidos. |
| `MovementType` | `TB_MOVEMENT_TYPE` | Tipo de movimiento de inventario. |

Relacion funcional: una solicitud de entrega puede generar un movimiento de inventario que descuenta en origen y registra el destino esperado.

### Inventario

Pantalla: `inventory`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `Inventory` | `TB_INVENTORY` | Existencia disponible, reserva, minimo y maximo por medicamento y sucursal. |
| `InventoryLot` | `TB_INVENTORY_LOT` | Lotes, vencimientos y control sanitario/logistico del producto. |
| `InventoryKardex` | `TB_INVENTORY_KARDEX` | Historial de entradas, salidas, saldos y referencias de movimiento. |
| `InventoryReservation` | `TB_INVENTORY_RESERVATION` | Reserva de medicamentos, principalmente para pedidos. |
| `InventoryAdjustment` | `TB_INVENTORY_ADJUSTMENT` | Ajustes manuales o correctivos de existencia. |
| `StorageLocation` | `TB_STORAGE_LOCATION` | Ubicaciones fisicas o logicas de almacenamiento. |

Relacion funcional: inventario controla saldos por medicamento y sucursal; kardex deja el historial; lotes y reservas evitan perder trazabilidad de vencimiento y disponibilidad.

### Ventas

Pantalla: `sale`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `Sale` | `TB_SALE` | Encabezado de venta: sucursal, empleado, cliente, fecha, totales, metodo de pago, caja y canal. |
| `SaleDetail` | `TB_SALE_DETAIL` | Productos vendidos, cantidades, precio y total por linea. |
| `SalePayment` | `TB_SALE_PAYMENT` | Pagos asociados a una venta. |
| `SaleReceipt` | `TB_SALE_RECEIPT` | Comprobante interno de venta. |
| `SaleLotDetail` | `TB_SALE_LOT_DETAIL` | Relacion de venta contra lotes de inventario. |
| `SaleReturn` | `TB_SALE_RETURN` | Devoluciones de ventas. |
| `SaleReturnDetail` | `TB_SALE_RETURN_DETAIL` | Detalle de productos devueltos. |

Relacion funcional: una venta descuenta inventario, registra el cobro y conserva el detalle de productos y lotes afectados.

### Call Center / Pedidos de cliente

Pantalla: `customer-order`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `CustomerOrder` | `TB_CUSTOMER_ORDER` | Pedido remoto con cliente, telefono, direccion, coordenadas, estado de pago, total y venta relacionada. |
| `CustomerOrderDetail` | `TB_CUSTOMER_ORDER_DETAIL` | Medicamentos solicitados en el pedido. |
| `InventoryReservation` | `TB_INVENTORY_RESERVATION` | Reserva temporal de stock para el pedido. |
| `Sale` | `TB_SALE` | Venta final cuando el pedido se concreta. |

Relacion funcional: el pedido puede reservar inventario y luego enlazarse con una venta para no duplicar cobros ni descuentos de stock.

### Nomina

Pantalla: `payroll`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `PayrollPayment` | `TB_PAYROLL_PAYMENT` | Pago de nomina por empleado, sucursal, periodo, salario base, bonos, descuentos y total. |
| `PayrollDetail` | `TB_PAYROLL_DETAIL` | Lineas o conceptos aplicados a un pago. |
| `PayrollPeriod` | `TB_PAYROLL_PERIOD` | Periodos de calculo o pago. |
| `PayrollAdjustment` | `TB_PAYROLL_ADJUSTMENT` | Ajustes aplicados a la nomina. |
| `EmployeeSalary` | `TB_EMPLOYEE_SALARY` | Salario asignado a un empleado. |
| `PayrollPosition` | `TB_PAYROLL_POSITION` | Puesto laboral usado por nomina. |
| `PayrollConcept` | `TB_PAYROLL_CONCEPT` | Conceptos de ingresos, descuentos u otros rubros. |

Relacion funcional: nomina toma empleados, salarios, puestos, periodos y conceptos para registrar pagos y ajustes.

### Activos fijos

Pantalla: `fixed-asset`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `FixedAsset` | `TB_FIXED_ASSET` | Activo fijo: codigo, nombre, categoria, marca, modelo, serie, ubicacion, responsable, costo, depreciacion y estado. |
| `FixedAssetHistory` | `TB_FIXED_ASSET_HISTORY` | Historial de cambios, asignaciones, traslados o bajas del activo. |

Relacion funcional: el activo conserva su ficha principal y el historial registra cambios relevantes durante su vida util.

### Caja y bancos

Pantalla: `treasury`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `FinancialAccount` | `TB_FINANCIAL_ACCOUNT` | Cuenta financiera usada para movimientos de dinero. |
| `FinancialMovement` | `TB_FINANCIAL_MOVEMENT` | Movimiento financiero con origen, operacion, monto, referencia y estado de conciliacion. |
| `CashSession` | `TB_CASH_SESSION` | Sesion de caja que puede originar o relacionarse con movimientos financieros. |

Relacion funcional: caja y bancos concentra entradas y salidas financieras provenientes de ventas, caja, compras, nomina u otras referencias.



## Modulo de seguridad

Seguridad se considera modulo completo del sistema porque controla acceso, permisos, usuarios, menus y auditoria.

Pantallas: `role`, `menu`, `menurol`, `roleaction`, `user`.

Modelos principales:

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `User` | `TB_USER` | Usuario de acceso, credenciales, rol, empleado relacionado y ultimo inicio de sesion. |
| `Role` | `TB_ROLE` | Perfil o grupo de permisos. |
| `Menu` | `TB_MENU` | Opcion de navegacion del sistema. |
| `RoleMenu` | `TB_ROLE_MENU` | Relacion entre roles y menus visibles o permitidos. |
| `Permission` | `TB_PERMISSION` | Acciones autorizables sobre pantallas o controladores. |
| `RolePermission` | `T_ROLE_PERMISSION` | Permisos asignados a cada rol. |
| `AuditTrailLog` | `TB_AUDIT_TRAIL_LOG` | Registro de eventos, cambios y acciones auditables. |

Relacion funcional: el usuario pertenece a un rol; el rol define menus y acciones permitidas; auditoria registra eventos relevantes del sistema.

## Modulo de reportes

Pantallas: `report`, `personalq`, `inventoryhistory`, `consolidated-report`.

Modelos usados como fuente:

| Area de reporte | Modelos base |
| --- | --- |
| Ventas y margen | `Sale`, `SaleDetail`, `SalePayment`, `SaleReturn`, `Medicine`, `InventoryKardex` |
| Inventario historico | `Inventory`, `InventoryLot`, `InventoryKardex`, `InventoryAdjustment`, `MoveInventory` |
| Personal | `Employee`, `Company`, `Branch`, `PayrollPayment` |
| Auditoria | `AuditTrailLog`, `User` |
| Consolidado operativo | Ventas, compras, inventario, caja, nomina y auditoria segun filtros del reporte. |

Relacion funcional: reportes no crea un modelo de negocio independiente; consulta modelos operativos y de seguridad para mostrar informacion resumida, historica o consolidada.

## Modelos de soporte y catalogos

Estos modelos existen en el sistema y son necesarios, pero no se clasifican como modulos principales porque funcionan como mantenimientos, catalogos o datos maestros.

### Empresa, sucursales y personal

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `Company` | `TB_COMPANY` | Datos generales de la empresa. |
| `Branch` | `TB_BRANCH` | Sucursales, ubicacion y datos operativos del establecimiento. |
| `Department` | `TB_DEPARTMENT` | Departamento o area organizativa. |
| `Employee` | `TB_EMPLOYEE` | Personal de la empresa asociado a compania y sucursal. |
| `Municipality` | `TB_MUNICIPALITY` | Catalogo geografico de municipios. |

### Catalogo farmaceutico

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `Medicine` | `TB_MEDICINE` | Producto o medicamento con codigo, laboratorio, presentacion, categoria, unidad y precios. |
| `MedicineCategory` | `TB_MEDICINE_CATEGORY` | Categoria del medicamento. |
| `MedicineLaboratory` | `TB_MEDICINE_LABORATORY` | Laboratorio asociado al medicamento. |
| `MedicinePresentation` | `TB_MEDICINE_PRESENTATION` | Presentacion del medicamento. |
| `UnitMeasurement` | `TB_UNIT_MEASUREMENT` | Unidad de medida para compra, venta o inventario. |
| `Supplier` | `TB_SUPPLIER` | Proveedor. |
| `SupplierMedicine` | `TB_SUPPLIER_MEDICINE` | Relacion proveedor-medicamento. |

### Catalogos financieros y de caja

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `CashRegister` | `TB_CASH_REGISTER` | Caja o punto de cobro configurable. |
| `CashMovementType` | `TB_CASH_MOVEMENT_TYPE` | Tipos de entrada o salida de caja. |
| `FinancialAccount` | `TB_FINANCIAL_ACCOUNT` | Cuenta usada por tesoreria. |

### Catalogos de inventario

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `MovementType` | `TB_MOVEMENT_TYPE` | Tipo de movimiento de inventario. |
| `StorageLocation` | `TB_STORAGE_LOCATION` | Ubicacion de almacenamiento. |

### Catalogos de nomina

| Modelo | Tabla | Uso general |
| --- | --- | --- |
| `PayrollPosition` | `TB_PAYROLL_POSITION` | Puestos usados por nomina. |
| `PayrollConcept` | `TB_PAYROLL_CONCEPT` | Conceptos de calculo de nomina. |
| `PayrollPeriod` | `TB_PAYROLL_PERIOD` | Periodos de nomina. |

## Resumen general de entidades

| Grupo | Entidades principales |
| --- | --- |
| Operacion comercial | `Sale`, `SaleDetail`, `SalePayment`, `SaleReceipt`, `SaleLotDetail`, `SaleReturn`, `SaleReturnDetail`, `CustomerOrder`, `CustomerOrderDetail` |
| Abastecimiento | `Purchase`, `PurchaseDetail`, `PurchaseReceipt`, `PurchaseReceiptDetail`, `PurchaseRequest`, `PurchaseRequestDetail`, `PurchaseReturn`, `SupplierInvoice` |
| Inventario y traslados | `Inventory`, `InventoryLot`, `InventoryKardex`, `InventoryReservation`, `InventoryAdjustment`, `MoveInventory`, `MoveInventoryDetail`, `DeliveryRequest`, `DeliveryRequestDetail` |
| Caja y finanzas | `CashSession`, `CashMovement`, `CashReconciliation`, `CashRegister`, `CashMovementType`, `FinancialAccount`, `FinancialMovement` |
| Nomina | `PayrollPayment`, `PayrollDetail`, `PayrollAdjustment`, `PayrollPeriod`, `PayrollPosition`, `PayrollConcept`, `EmployeeSalary` |
| Activos fijos | `FixedAsset`, `FixedAssetHistory` |
| Seguridad | `User`, `Role`, `Menu`, `RoleMenu`, `Permission`, `RolePermission`, `AuditTrailLog` |
| Catalogos base | `Company`, `Branch`, `Department`, `Employee`, `Municipality`, `Medicine`, `MedicineCategory`, `MedicineLaboratory`, `MedicinePresentation`, `UnitMeasurement`, `Supplier`, `SupplierMedicine`, `MovementType`, `StorageLocation` |

## Observaciones de consistencia

- El frontend ubica algunas pantallas operativas bajo carpetas de catalogo, por ejemplo compras, caja y traslados. A nivel funcional y de permisos backend se registran como `Operation`.
- Los catalogos y mantenimientos existen como pantallas, pero no se cuentan como modulos principales en este documento.
- Reportes trabaja sobre datos ya generados por operaciones; no debe tratarse como origen principal de datos.
- Seguridad tiene entidad propia como modulo porque administra acceso, menus, permisos, roles, usuarios y auditoria.
- Las pantallas `assign`, `loan` y `appointment` requieren confirmacion si deben tener modelo backend propio o si solo son vistas pendientes de integracion.
