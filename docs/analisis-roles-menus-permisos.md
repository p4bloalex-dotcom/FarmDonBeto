# Analisis de roles, menus y permisos

## Estado actual del sistema

El sistema actualmente tiene una estructura de seguridad basada en:

- `TB_ROLE`: roles.
- `TB_MENU`: menus visibles por rol.
- `TB_ROLE_MENU`: relacion entre roles y menus.
- `TB_PERMISSION`: permisos por pantalla/accion.
- `T_ROLE_PERMISSION`: relacion entre roles y permisos, con `IS_CHECK` e `IS_GLOBAL`.
- `SP_VALIDATE_USER_ACCESS`: valida que el usuario tenga permiso activo y menu activo.
- RLS por sucursal sobre tablas operativas y tenant.

El seeder actual solo crea automaticamente el rol `Administrador` y le asigna todos los menus y permisos generados desde las rutas registradas.

Conclusion: si el sistema se usara en produccion con sucursales, matriz, caja, inventario, compras, RRHH, auditoria y reportes, si es necesario crear mas roles. Un solo rol `Administrador` no separa responsabilidades, no reduce riesgo operativo y no aprovecha correctamente `IS_GLOBAL`, RLS y sucursal matriz.

## Consideraciones RLS, IS_GLOBAL y sucursal matriz

El sistema aplica RLS en consultas `SELECT` sobre tablas con datos por sucursal, entre ellas inventario, ventas, compras, caja, nomina, empleados, activos fijos, traslados, pedidos y sucursales.

Reglas relevantes:

- Si `T_ROLE_PERMISSION.IS_GLOBAL = true` para el permiso usado en la ruta, el usuario consulta sin filtro de sucursal.
- Si el usuario pertenece a una sucursal marcada como matriz (`TB_BRANCH.IS_MAIN = 1`), tambien consulta sin filtro de sucursal.
- Si no es global y no esta en matriz, consulta datos filtrados por su sucursal.
- En traslados y solicitudes, RLS permite ver registros donde la sucursal participa como origen, destino, solicitante o abastecedora.
- Riesgo a revisar: si un usuario no tiene empleado/sucursal asociada y su permiso no es global, el contexto RLS puede quedar sin `branchId`; eso puede abrir visibilidad amplia. Los usuarios operativos deberian tener siempre `idPersonal` asociado a una sucursal.

Recomendacion general:

- Roles de matriz o gerencia pueden tener permisos `IS_GLOBAL = true` cuando necesiten operar/consultar todas las sucursales.
- Roles de sucursal normalmente deben tener `IS_GLOBAL = false`.
- Roles de auditoria/reportes pueden tener `IS_GLOBAL = true` solo en permisos de consulta y reportes.
- No usar `IS_GLOBAL = true` de forma masiva para roles transaccionales si no necesitan operar toda la red.

## Usuarios, departamentos y areas esperadas

Posibles usuarios/departamentos que se conectaran al sistema:

- Administracion del sistema / TI.
- Gerencia general.
- Gerencia de operaciones o matriz.
- Encargados o administradores de sucursal.
- Cajeros.
- Vendedores o dependientes de farmacia.
- Inventario / bodega.
- Compras matriz.
- Recepcion de compras.
- Logistica / traslados entre sucursales.
- Call center / pedidos de clientes.
- Despacho / entrega a domicilio de Call Center.
- Contabilidad / tesoreria.
- Recursos humanos / nomina.
- Activos fijos.
- Auditoria / cumplimiento.
- Catalogos maestros.

## Roles propuestos

| Rol | Tipo | Alcance recomendado | Objetivo |
| --- | --- | --- | --- |
| Administrador | Sistema | Global | Configuracion total, seguridad, menus, permisos y mantenimiento. |
| Gerencia General | Direccion | Global | Consulta ejecutiva, reportes consolidados y supervision general. |
| Gerente Matriz / Operaciones | Matriz | Global o sucursal matriz | Gestion operativa de compras, inventario, traslados, ventas y sucursales. |
| Encargado Sucursal | Sucursal | Local | Administrar operaciones de una sucursal sin acceso global. |
| Cajero | Sucursal | Local | Caja diaria, ventas, movimientos de caja permitidos. |
| Vendedor / Dependiente | Sucursal | Local | Ventas, consulta de inventario y atencion al cliente. |
| Inventario / Bodega | Sucursal o matriz | Local o global segun ubicacion | Stock, lotes, ajustes, kardex y alertas. |
| Compras Matriz | Matriz | Global | Solicitudes, ordenes, aprobaciones y compras a proveedor. |
| Recepcion Compras | Matriz | Global o matriz | Recepcion de mercaderia, facturas, devoluciones de compra. |
| Logistica / Traslados | Sucursal o matriz | Local o global segun rol | Solicitudes y movimientos entre sucursales. |
| Call Center | Central | Global limitado | Pedidos de clientes y disponibilidad por sucursal. |
| Despacho / Entrega Call Center | Sucursal o zona | Local | Entrega fisica de pedidos generados por Call Center. |
| Contabilidad / Tesoreria | Matriz | Global | Caja y bancos, pagos, conciliaciones y reportes financieros. |
| RRHH / Nomina | Matriz | Global | Personal, puestos, conceptos, planilla y pagos. |
| Activos Fijos | Matriz | Global | Registro, traslado, retiro y seguimiento de activos. |
| Auditor | Global consulta | Global | Auditoria, trazabilidad, reportes y consulta sin modificar. |
| Catalogos Maestros | Matriz | Global | Mantenimiento de medicamentos, proveedores y parametros. |

## Descripcion corta de cada rol

| Rol | Descripcion |
| --- | --- |
| Administrador | Usuario tecnico con control total del sistema, seguridad, menus, roles y permisos. |
| Gerencia General | Usuario directivo que consulta resultados globales, reportes y auditoria sin operar procesos diarios. |
| Gerente Matriz / Operaciones | Responsable de supervisar y coordinar la operacion de todas las sucursales desde matriz. |
| Encargado Sucursal | Responsable operativo de una sucursal, caja, ventas, inventario local y solicitudes de abastecimiento. |
| Cajero | Usuario que abre/cierra caja, registra ventas y movimientos permitidos de efectivo en su sucursal. |
| Vendedor / Dependiente | Usuario de atencion al cliente que vende, consulta productos e inventario disponible. |
| Inventario / Bodega | Usuario que controla stock, lotes, ajustes, kardex, alertas y disponibilidad de productos. |
| Compras Matriz | Usuario que consolida solicitudes, valida abastecimiento interno y gestiona compras a proveedores. |
| Recepcion Compras | Usuario que recibe mercaderia, registra recepciones, facturas y devoluciones de compras. |
| Logistica / Traslados | Usuario que gestiona solicitudes y movimientos de productos entre sucursales. |
| Call Center | Usuario que toma pedidos, valida disponibilidad por sucursal y coordina despacho. |
| Despacho / Entrega Call Center | Usuario que prepara, envia o entrega pedidos creados desde Call Center al cliente final. |
| Contabilidad / Tesoreria | Usuario que controla caja, bancos, pagos, conciliaciones y reportes financieros. |
| RRHH / Nomina | Usuario que administra personal, puestos, conceptos y procesos de nomina. |
| Activos Fijos | Usuario que registra, traslada, retira y consulta activos fijos de la empresa. |
| Auditor | Usuario de solo lectura para revisar trazabilidad, auditoria, reportes y operaciones. |
| Catalogos Maestros | Usuario que mantiene datos base como medicamentos, proveedores, unidades y parametros. |

## Abastecimiento interno y validacion de disponibilidad

El sistema contempla usuarios que solicitan abastecimiento y usuarios que validan si una necesidad se cubre con inventario interno antes de comprar a proveedor.

Roles involucrados:

- `Encargado Sucursal`: solicita abastecimiento para su propia sucursal.
- `Inventario / Bodega`: revisa stock y prepara producto si su sucursal abastece.
- `Compras Matriz`: valida disponibilidad interna de la red antes de crear una compra externa.
- `Gerente Matriz / Operaciones`: supervisa y autoriza decisiones globales de abastecimiento.
- `Logistica / Traslados`: ejecuta o coordina el traslado entre sucursales.

Regla recomendada para `IS_GLOBAL`:

- `Purchase.Solicitar`: normalmente `IS_GLOBAL = false` para sucursales, porque la solicitud nace desde la sucursal del usuario.
- `Purchase.Ver`: `IS_GLOBAL = true` para matriz/compras si se usa para revisar solicitudes de todas las sucursales o disponibilidad de red.
- `Inventory.Ver`: `IS_GLOBAL = true` para quien valida abastecimiento interno entre sucursales, porque necesita ver stock de la red completa.
- `DeliveryRequest.Ver`: `IS_GLOBAL = true` para coordinadores de matriz/logistica que supervisan todos los traslados.
- `DeliveryRequest.Crear`: puede ser `IS_GLOBAL = true` para matriz/logistica si crean solicitudes entre cualquier par de sucursales; debe ser `false` para usuarios locales.
- `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`: `IS_GLOBAL = false` para sucursales que solo actuan cuando participan como abastecedora o solicitante; `true` solo para coordinador global.

Respuesta puntual: si el usuario valida abastecimiento interno viendo inventario de varias sucursales, si, el permiso de consulta usado para esa validacion debe tener `IS_GLOBAL = true`, principalmente `Inventory.Ver` y, segun la pantalla usada, tambien `Purchase.Ver` o `DeliveryRequest.Ver`. Si ese usuario pertenece a sucursal matriz, el RLS ya le da visibilidad amplia, pero aun asi es mas claro marcar global los permisos de matriz que operan red completa.

## Menus actuales generados por el sistema

### Seguridad

- `user`: Usuarios.
- `role`: Roles.
- `menurol`: Menus por rol.
- `roleaction`: Permisos.
- `menu`: Menus.

### Catalogo

- `company`: Empresa.
- `personal`: Personal.
- `branch`: Sucursales.
- `medicinecategory`: Categorias de medicina.
- `medicinelaboratory`: Laboratorios.
- `medicinepresentation`: Presentaciones.
- `unitmeasurement`: Unidades de medida.
- `supplier`: Proveedores.
- `medicine`: Medicamentos.
- `suppliermedicine`: Medicamentos por proveedor.
- `cashmovementtype`: Tipos de movimiento de caja.
- `movementtype`: Tipos de movimiento de inventario.
- `cashregister`: Cajas.
- `payrollposition`: Puestos de nomina.
- `payrollconcept`: Conceptos de nomina.

### Operaciones

- `cashsession`: Caja del dia.
- `purchase`: Compras.
- `delivery-request`: Traslados entre sucursales.
- `inventory`: Inventario.
- `fixed-asset`: Activos fijos.
- `customer-order`: Call Center.
- `sale`: Ventas.
- `payroll`: Nomina.
- `treasury`: Caja y bancos.

### Reportes

- `consolidated-report`: Reportes.

### Auditoria

- `audit`: Auditoria.

## Posibles relaciones menus-rol

| Rol | Menus sugeridos |
| --- | --- |
| Administrador | Todos los menus de Seguridad, Catalogo, Operaciones, Reportes y Auditoria. |
| Gerencia General | `company`, `branch`, `inventory`, `purchase`, `delivery-request`, `sale`, `cashsession`, `treasury`, `payroll`, `fixed-asset`, `customer-order`, `consolidated-report`, `audit`. |
| Gerente Matriz / Operaciones | `branch`, `personal`, `medicine`, `supplier`, `suppliermedicine`, `inventory`, `purchase`, `delivery-request`, `sale`, `cashsession`, `cashregister`, `customer-order`, `fixed-asset`, `consolidated-report`. |
| Encargado Sucursal | `inventory`, `purchase`, `delivery-request`, `sale`, `cashsession`, `cashregister`, `customer-order`, `medicine`, `consolidated-report`. |
| Cajero | `sale`, `cashsession`, `customer-order`, `inventory`. |
| Vendedor / Dependiente | `sale`, `inventory`, `customer-order`, `medicine`. |
| Inventario / Bodega | `inventory`, `delivery-request`, `purchase`, `medicine`, `movementtype`, `suppliermedicine`, `consolidated-report`. |
| Compras Matriz | `purchase`, `supplier`, `suppliermedicine`, `medicine`, `inventory`, `delivery-request`, `consolidated-report`. |
| Recepcion Compras | `purchase`, `inventory`, `delivery-request`, `supplier`, `medicine`. |
| Logistica / Traslados | `delivery-request`, `inventory`, `branch`, `consolidated-report`. |
| Call Center | `customer-order`, `inventory`, `sale`, `branch`. |
| Despacho / Entrega Call Center | `customer-order`, `inventory`, `branch`. |
| Contabilidad / Tesoreria | `treasury`, `cashsession`, `cashmovementtype`, `purchase`, `sale`, `consolidated-report`. |
| RRHH / Nomina | `personal`, `payroll`, `payrollposition`, `payrollconcept`, `branch`, `consolidated-report`. |
| Activos Fijos | `fixed-asset`, `branch`, `personal`, `consolidated-report`. |
| Auditor | `audit`, `consolidated-report`, `inventory`, `purchase`, `delivery-request`, `sale`, `cashsession`, `treasury`, `payroll`, `fixed-asset`. |
| Catalogos Maestros | `company`, `branch`, `medicinecategory`, `medicinelaboratory`, `medicinepresentation`, `unitmeasurement`, `supplier`, `medicine`, `suppliermedicine`, `cashmovementtype`, `movementtype`, `cashregister`, `payrollposition`, `payrollconcept`. |

## Acciones/permisos actuales

Los permisos se generan con el patron `Controlador.Accion`. Ejemplos:

- `User.Ver`, `User.Crear`, `User.Editar`, `User.Eliminar`.
- `Role.Ver`, `Role.Crear`, `Role.Editar`, `Role.Eliminar`.
- `MenuRol.Ver`, `MenuRol.Crear`, `MenuRol.Editar`, `MenuRol.Eliminar`.
- `Permission.Ver`, `Permission.Editar`.
- `Menu.Ver`, `Menu.Crear`, `Menu.Editar`.
- `Medicine.Ver`, `Medicine.Crear`, `Medicine.Editar`, `Medicine.Eliminar`.
- `Inventory.Ver`, `Inventory.Crear`, `Inventory.Editar`, `Inventory.Eliminar`.
- `Sale.Ver`, `Sale.Crear`, `Sale.Editar`, `Sale.Eliminar`.
- `Purchase.Ver`, `Purchase.Crear`, `Purchase.Editar`, `Purchase.Eliminar`, `Purchase.Solicitar`, `Purchase.Ordenar`, `Purchase.Aprobar`, `Purchase.Recibir`, `Purchase.Facturar`, `Purchase.Pagar`, `Purchase.Devolver`.
- `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Editar`, `DeliveryRequest.Eliminar`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`, `DeliveryRequest.Rechazar`, `DeliveryRequest.Cancelar`.
- `CashSession.Ver`, `CashSession.Crear`, `CashSession.Editar`, `CashSession.Eliminar`, `CashSession.Cerrar`, `CashSession.Movimiento`, `CashSession.Autorizar`, `CashSession.Reportes`, `CashSession.Auditoria`, `CashSession.Conciliar`.
- `CustomerOrder.Ver`, `CustomerOrder.Crear`, `CustomerOrder.Editar`, `CustomerOrder.Eliminar`, `CustomerOrder.Enviar`, `CustomerOrder.Entregar`, `CustomerOrder.Cancelar`.
- `Payroll.Ver`, `Payroll.Crear`, `Payroll.Editar`, `Payroll.Eliminar`.
- `Treasury.Ver`, `Treasury.Crear`, `Treasury.Editar`, `Treasury.Eliminar`.
- `ConsolidatedReport.<nombre del reporte>`.
- `Audit.Ver`.

## Cobertura real de modulos, menus y permisos personalizados

Esta seccion diferencia entre pantallas que generan menu/permiso propio y rutas tecnicas que reutilizan permisos existentes o no generan menu.

| Modulo/ruta backend | Menu generado | Permisos usados | Observacion |
| --- | --- | --- | --- |
| `security/users` | `user` | `User.Ver`, `User.Crear`, `User.Editar`, `User.Eliminar` | `reset-password` usa `User.Editar`. |
| `security/roles` | `role` | `Role.Ver`, `Role.Crear`, `Role.Editar`, `Role.Eliminar` | Incluye consulta de permisos del rol. |
| `security/role-menus` | `menurol` | `MenuRol.Ver`, `MenuRol.Crear`, `MenuRol.Editar`, `MenuRol.Eliminar` | Asignacion de menus por rol. |
| `security/permissions` | `roleaction` | `Permission.Ver`, `Permission.Editar` | Asignacion de permisos por rol. |
| `security/menus` | `menu` | `Menu.Ver`, `Menu.Crear`, `Menu.Editar` | No tiene `Eliminar`; usa cambio de estado con `Editar`. |
| `security/audit` | `audit` | `Audit.Ver` | Solo lectura. |
| `catalog/companies` | `company` | `Company.Ver`, `Company.Crear` | `findByUser` no exige permiso especifico, solo autenticacion. |
| `catalog/personals` | `personal` | `Personal.Ver`, `Personal.Crear`, `Personal.Editar`, `Personal.Eliminar` | Cambio de estado usa `Personal.Editar`. |
| `catalog/branches` | `branch` | `Branch.Ver`, `Branch.Crear`, `Branch.Editar`, `Branch.Eliminar` | Cambio de estado usa `Branch.Editar`. |
| `catalog/medicine-categories` | `medicinecategory` | `MedicineCategory.Ver`, `MedicineCategory.Crear`, `MedicineCategory.Editar`, `MedicineCategory.Eliminar` | Catalogo maestro. |
| `catalog/medicine-laboratories` | `medicinelaboratory` | `MedicineLaboratory.Ver`, `MedicineLaboratory.Crear`, `MedicineLaboratory.Editar`, `MedicineLaboratory.Eliminar` | Catalogo maestro. |
| `catalog/medicine-presentations` | `medicinepresentation` | `MedicinePresentation.Ver`, `MedicinePresentation.Crear`, `MedicinePresentation.Editar`, `MedicinePresentation.Eliminar` | Catalogo maestro. |
| `catalog/unit-measurements` | `unitmeasurement` | `UnitMeasurement.Ver`, `UnitMeasurement.Crear`, `UnitMeasurement.Editar`, `UnitMeasurement.Eliminar` | Catalogo maestro. |
| `catalog/suppliers` | `supplier` | `Supplier.Ver`, `Supplier.Crear`, `Supplier.Editar`, `Supplier.Eliminar` | Catalogo maestro. |
| `catalog/medicines` | `medicine` | `Medicine.Ver`, `Medicine.Crear`, `Medicine.Editar`, `Medicine.Eliminar` | Catalogo maestro. |
| `catalog/supplier-medicines` | `suppliermedicine` | `SupplierMedicine.Ver`, `SupplierMedicine.Crear`, `SupplierMedicine.Editar`, `SupplierMedicine.Eliminar` | Relacion proveedor-medicamento. |
| `catalog/cash-movement-types` | `cashmovementtype` | `CashMovementType.Ver`, `CashMovementType.Crear`, `CashMovementType.Editar`, `CashMovementType.Eliminar` | Catalogo financiero. |
| `catalog/movement-types` | `movementtype` | `MovementType.Ver`, `MovementType.Crear`, `MovementType.Editar`, `MovementType.Eliminar` | Catalogo inventario. |
| `catalog/cash-registers` | `cashregister` | `CashRegister.Ver`, `CashRegister.Crear`, `CashRegister.Editar`, `CashRegister.Eliminar` | Cambio de estado usa `CashRegister.Editar`. |
| `catalog/payroll` subrutas `positions` | `payrollposition` | `PayrollPosition.Ver`, `PayrollPosition.Crear`, `PayrollPosition.Editar`, `PayrollPosition.Eliminar` | Menu de puestos de nomina. |
| `catalog/payroll` subrutas `concepts` | `payrollconcept` | `PayrollConcept.Ver`, `PayrollConcept.Crear`, `PayrollConcept.Editar`, `PayrollConcept.Eliminar` | Menu de conceptos de nomina. |
| `catalog/cash-sessions` | `cashsession` | `CashSession.Ver`, `CashSession.Crear`, `CashSession.Editar`, `CashSession.Eliminar`, `CashSession.Cerrar`, `CashSession.Movimiento`, `CashSession.Autorizar`, `CashSession.Reportes`, `CashSession.Auditoria`, `CashSession.Conciliar` | Incluye permisos personalizados de caja. |
| `catalog/cash-movements` | No genera menu propio | `CashSession.Movimiento` | Reutiliza permiso de `cashsession`. |
| `catalog/cash-advanced` | No genera menu propio | `CashSession.Reportes`, `CashSession.Ver`, `CashSession.Autorizar`, `CashSession.Conciliar`, `CashSession.Crear` | Reutiliza permisos de `cashsession`. |
| `catalog/purchases` | `purchase` | `Purchase.Ver`, `Purchase.Crear`, `Purchase.Editar`, `Purchase.Eliminar`, `Purchase.Solicitar`, `Purchase.Ordenar`, `Purchase.Aprobar`, `Purchase.Recibir`, `Purchase.Facturar`, `Purchase.Pagar`, `Purchase.Devolver` | Incluye abastecimiento, ordenes, aprobacion, recepcion, factura, pago y devolucion. |
| `catalog/delivery-requests` | `delivery-request` | `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Editar`, `DeliveryRequest.Eliminar`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`, `DeliveryRequest.Rechazar`, `DeliveryRequest.Cancelar` | Estados usan permisos personalizados segun accion. |
| `catalog/stock-transfers` | No genera menu propio | Permisos de `DeliveryRequest` | Reutiliza `delivery-request`. |
| `catalog/inventory` | `inventory` | `Inventory.Ver`, `Inventory.Crear`, `Inventory.Editar`, `Inventory.Eliminar` | Kardex, lotes, disponibilidad, alertas y reposicion usan `Inventory.Ver`; lotes/reservas/ajustes usan `Crear`; eliminar reserva usa `Eliminar`. |
| `catalog/fixed-assets` | `fixed-asset` | `FixedAsset.Ver`, `FixedAsset.Crear`, `FixedAsset.Editar`, `FixedAsset.Eliminar` | Historial usa `Ver`; traslado/retiro/cambio estado usan `Editar`. |
| `catalog/customer-orders` | `customer-order` | `CustomerOrder.Ver`, `CustomerOrder.Crear`, `CustomerOrder.Editar`, `CustomerOrder.Eliminar`, `CustomerOrder.Enviar`, `CustomerOrder.Entregar`, `CustomerOrder.Cancelar` | Disponibilidad, busqueda e historial usan `Ver`; estado usa permiso personalizado. |
| `catalog/sales` | `sale` | `Sale.Ver`, `Sale.Crear`, `Sale.Editar`, `Sale.Eliminar` | La ruta actual usa principalmente `Ver` y `Crear`. |
| `catalog/payroll` | `payroll` | `Payroll.Ver`, `Payroll.Crear`, `Payroll.Editar`, `Payroll.Eliminar` | Periodos, salarios, pagos, ajustes y generacion usan permisos CRUD de `Payroll`. |
| `catalog/treasury` | `treasury` | `Treasury.Ver`, `Treasury.Crear`, `Treasury.Editar`, `Treasury.Eliminar` | Conciliar/reversar movimientos usan `Treasury.Editar`; no hay permisos personalizados `Conciliar` o `Reversar` en este menu. |
| `reports/consolidated` | `consolidated-report` | `ConsolidatedReport.<reporte>` | Cada reporte es un permiso independiente. |
| `dashboard` | No genera menu propio | Solo autenticacion | No pasa por `permissionRequired`. Si se quiere controlar por rol, deberia agregarse como pantalla/permisos. |
| `geolocation` | No genera menu propio | Solo autenticacion | No pasa por `permissionRequired`; usado como servicio auxiliar. |
| `departments` | No genera menu propio | Solo autenticacion | Catalogo auxiliar sin pantalla/permiso registrado. |
| `municipalities` | No genera menu propio | Solo autenticacion | Catalogo auxiliar sin pantalla/permiso registrado. |
| `auth` | No genera menu propio | Publico/autenticacion | Login y flujo de sesion, fuera del esquema rol-menu. |

### Permisos personalizados de reportes

El menu `consolidated-report` no usa CRUD. Cada reporte genera un permiso propio:

- `ConsolidatedReport.Ventas por periodo`.
- `ConsolidatedReport.Ventas por sucursal`.
- `ConsolidatedReport.Detalle de venta`.
- `ConsolidatedReport.Ventas por medicamento`.
- `ConsolidatedReport.Productos mas vendidos`.
- `ConsolidatedReport.Productos con baja rotacion`.
- `ConsolidatedReport.Inventario por sucursal`.
- `ConsolidatedReport.Inventario consolidado`.
- `ConsolidatedReport.Medicamentos proximos a vencer`.
- `ConsolidatedReport.Medicamentos vencidos`.
- `ConsolidatedReport.Stock minimo`.
- `ConsolidatedReport.Kardex de inventario`.
- `ConsolidatedReport.Traslados entre sucursales`.
- `ConsolidatedReport.Flujo de efectivo`.
- `ConsolidatedReport.Cierre y diferencias de caja`.
- `ConsolidatedReport.Movimientos detallados por caja`.
- `ConsolidatedReport.Conciliaciones de caja`.
- `ConsolidatedReport.Historial de ingresos y egresos por sesion`.
- `ConsolidatedReport.Compras por proveedor`.
- `ConsolidatedReport.Rentabilidad por sucursal`.
- `ConsolidatedReport.Activos fijos`.
- `ConsolidatedReport.Detalle de activos fijos`.
- `ConsolidatedReport.Planilla`.
- `ConsolidatedReport.Auditoria`.

## Posibles relaciones permisos-rol

### Administrador

| Permisos | IS_GLOBAL |
| --- | --- |
| Todos los permisos `*.Ver`, `*.Crear`, `*.Editar`, `*.Eliminar` y acciones especiales. | `true` recomendado. |

Debe tener todos los menus y permisos. Es el unico rol que deberia administrar `User`, `Role`, `MenuRol`, `Permission` y `Menu` completos.

### Gerencia General

| Permisos | IS_GLOBAL |
| --- | --- |
| `*.Ver` para operaciones principales. | `true` |
| `ConsolidatedReport.*`. | `true` |
| `Audit.Ver`. | `true` |

No deberia crear, editar ni eliminar registros operativos salvo que el negocio lo requiera.

### Gerente Matriz / Operaciones

| Permisos | IS_GLOBAL |
| --- | --- |
| `Inventory.Ver`, `Inventory.Editar`. | `true` o por sucursal matriz |
| `Purchase.Ver`, `Purchase.Ordenar`, `Purchase.Aprobar`, `Purchase.Recibir`, `Purchase.Facturar`, `Purchase.Devolver`. | `true` |
| `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`, `DeliveryRequest.Rechazar`, `DeliveryRequest.Cancelar`. | `true` |
| `Sale.Ver`, `CashSession.Ver`, `CustomerOrder.Ver`. | `true` |
| Reportes operativos. | `true` |

Debe tener capacidad de supervision y ejecucion operativa en toda la red.

### Encargado Sucursal

| Permisos | IS_GLOBAL |
| --- | --- |
| `Inventory.Ver`, `Inventory.Crear`, `Inventory.Editar`. | `false` |
| `Sale.Ver`, `Sale.Crear`. | `false` |
| `CashSession.Ver`, `CashSession.Crear`, `CashSession.Cerrar`, `CashSession.Movimiento`. | `false` |
| `Purchase.Ver`, `Purchase.Solicitar`. | `false` |
| `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`, `DeliveryRequest.Rechazar`, `DeliveryRequest.Cancelar`. | `false` |
| `CustomerOrder.Ver`, `CustomerOrder.Entregar`. | `false` |

No deberia tener permisos globales. Si esta asignado a una sucursal matriz, heredara visibilidad amplia por RLS.

### Cajero

| Permisos | IS_GLOBAL |
| --- | --- |
| `Sale.Ver`, `Sale.Crear`. | `false` |
| `CashSession.Ver`, `CashSession.Crear`, `CashSession.Cerrar`, `CashSession.Movimiento`. | `false` |
| `Inventory.Ver`. | `false` |
| `CustomerOrder.Ver`, `CustomerOrder.Entregar`. | `false` |

No deberia eliminar ventas, sesiones de caja ni movimientos. La anulacion/devolucion deberia quedar para encargado o autorizador.

### Vendedor / Dependiente

| Permisos | IS_GLOBAL |
| --- | --- |
| `Sale.Ver`, `Sale.Crear`. | `false` |
| `Inventory.Ver`. | `false` |
| `Medicine.Ver`. | `false` |
| `CustomerOrder.Ver`, `CustomerOrder.Crear`. | `false` |

Debe operar solo en su sucursal.

### Inventario / Bodega

| Permisos | IS_GLOBAL |
| --- | --- |
| `Inventory.Ver`, `Inventory.Crear`, `Inventory.Editar`. | `false` en sucursal, `true` en matriz |
| `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`. | segun alcance |
| `Purchase.Ver`, `Purchase.Recibir`. | `true` solo si recepciona en matriz |
| `Medicine.Ver`, `SupplierMedicine.Ver`, `MovementType.Ver`. | `false` o `true` segun necesidad |

Los ajustes de inventario deberian restringirse a personal autorizado.

### Compras Matriz

| Permisos | IS_GLOBAL |
| --- | --- |
| `Purchase.Ver`, `Purchase.Crear`, `Purchase.Editar`, `Purchase.Solicitar`, `Purchase.Ordenar`, `Purchase.Aprobar`. | `true` |
| `Supplier.Ver`, `Supplier.Crear`, `Supplier.Editar`. | `true` |
| `SupplierMedicine.Ver`, `SupplierMedicine.Crear`, `SupplierMedicine.Editar`. | `true` |
| `Inventory.Ver`. | `true` |
| `DeliveryRequest.Ver`. | `true` |

`Purchase.Pagar` deberia quedar en Tesoreria, no en Compras, salvo autorizacion especial.

### Recepcion Compras

| Permisos | IS_GLOBAL |
| --- | --- |
| `Purchase.Ver`, `Purchase.Recibir`, `Purchase.Facturar`, `Purchase.Devolver`. | `true` o matriz |
| `Inventory.Ver`, `Inventory.Crear`, `Inventory.Editar`. | `true` o matriz |
| `Supplier.Ver`, `Medicine.Ver`. | `true` o matriz |

No deberia aprobar ni pagar compras.

### Logistica / Traslados

| Permisos | IS_GLOBAL |
| --- | --- |
| `DeliveryRequest.Ver`, `DeliveryRequest.Crear`, `DeliveryRequest.Aceptar`, `DeliveryRequest.Enviar`, `DeliveryRequest.Entregar`, `DeliveryRequest.Rechazar`, `DeliveryRequest.Cancelar`. | `false` sucursal, `true` coordinador matriz |
| `Inventory.Ver`. | segun alcance |
| `Branch.Ver`. | `true` si coordina red |

El rol local solo debe ver solicitudes donde participe su sucursal.

### Call Center

| Permisos | IS_GLOBAL |
| --- | --- |
| `CustomerOrder.Ver`, `CustomerOrder.Crear`, `CustomerOrder.Editar`, `CustomerOrder.Enviar`, `CustomerOrder.Cancelar`. | `true` recomendado |
| `Inventory.Ver`. | `true` para disponibilidad de red |
| `Branch.Ver`. | `true` |
| `Sale.Ver` opcional. | `false` o `true` segun operacion |

Debe poder consultar disponibilidad en varias sucursales, pero no modificar inventario ni marcar entregas fisicas si existe un equipo separado de despacho.

### Despacho / Entrega Call Center

| Permisos | IS_GLOBAL |
| --- | --- |
| `CustomerOrder.Ver`. | `false` si entrega solo pedidos de su sucursal/zona, `true` si coordina entregas de toda la red |
| `CustomerOrder.Enviar`. | `false` para despacho local, `true` para coordinador central |
| `CustomerOrder.Entregar`. | `false` para repartidor/despacho local, `true` solo para coordinador global |
| `CustomerOrder.Cancelar` opcional. | `false`; preferible dejarlo en Call Center o encargado |
| `Inventory.Ver`. | `false` para confirmar disponibilidad local, `true` solo si coordina varias sucursales |
| `Branch.Ver`. | `false` local, `true` coordinador |

Este rol cubre a quien entrega el producto a la ubicacion del cliente en el flujo de Call Center. No deberia crear pedidos ni modificar catalogos; su funcion es ver pedidos asignados, marcar envio y confirmar entrega.

### Contabilidad / Tesoreria

| Permisos | IS_GLOBAL |
| --- | --- |
| `Treasury.Ver`, `Treasury.Crear`, `Treasury.Editar`. | `true` |
| `CashSession.Ver`, `CashSession.Reportes`, `CashSession.Conciliar`, `CashSession.Auditoria`. | `true` |
| `Purchase.Ver`, `Purchase.Pagar`. | `true` |
| `Sale.Ver`. | `true` |
| Reportes financieros. | `true` |

No deberia tener permisos de seguridad ni mantenimiento general de catalogos salvo tipos financieros.

### RRHH / Nomina

| Permisos | IS_GLOBAL |
| --- | --- |
| `Personal.Ver`, `Personal.Crear`, `Personal.Editar`. | `true` |
| `Payroll.Ver`, `Payroll.Crear`, `Payroll.Editar`. | `true` |
| `PayrollPosition.Ver`, `PayrollPosition.Crear`, `PayrollPosition.Editar`, `PayrollPosition.Eliminar`. | `true` |
| `PayrollConcept.Ver`, `PayrollConcept.Crear`, `PayrollConcept.Editar`, `PayrollConcept.Eliminar`. | `true` |
| `Branch.Ver`. | `true` |

Eliminar personal o pagos deberia ser excepcional.

### Activos Fijos

| Permisos | IS_GLOBAL |
| --- | --- |
| `FixedAsset.Ver`, `FixedAsset.Crear`, `FixedAsset.Editar`. | `true` |
| `Branch.Ver`, `Personal.Ver`. | `true` |
| Reportes de activos fijos. | `true` |

No requiere permisos de caja, ventas, compras ni seguridad.

### Auditor

| Permisos | IS_GLOBAL |
| --- | --- |
| `Audit.Ver`. | `true` |
| `ConsolidatedReport.*`. | `true` |
| `*.Ver` en operaciones principales. | `true` |

Debe ser solo lectura. No asignar `Crear`, `Editar`, `Eliminar`, `Aprobar`, `Pagar`, `Autorizar`, `Conciliar` ni acciones transaccionales.

### Catalogos Maestros

| Permisos | IS_GLOBAL |
| --- | --- |
| `MedicineCategory.*`, `MedicineLaboratory.*`, `MedicinePresentation.*`, `UnitMeasurement.*`. | `true` |
| `Medicine.*`, `Supplier.*`, `SupplierMedicine.*`. | `true` |
| `CashMovementType.*`, `MovementType.*`, `CashRegister.*`. | `true` |
| `Company.Ver`, `Branch.Ver`, `Branch.Crear`, `Branch.Editar`. | `true` |

Este rol mantiene datos maestros, pero no deberia tener permisos transaccionales de ventas, compras, pagos o seguridad.

## Reportes por rol

| Rol | Reportes sugeridos |
| --- | --- |
| Gerencia General | Todos los reportes consolidados. |
| Gerente Matriz / Operaciones | Ventas, inventario, traslados, compras, rentabilidad, stock minimo, productos vencidos/proximos a vencer. |
| Encargado Sucursal | Ventas por periodo/sucursal, inventario por sucursal, stock minimo, cierre de caja de su sucursal. |
| Cajero | Cierre de caja, movimientos detallados por caja, historial de sesion propio. |
| Inventario / Bodega | Inventario por sucursal, consolidado, kardex, stock minimo, vencimientos, baja rotacion, traslados. |
| Compras Matriz | Compras por proveedor, inventario consolidado, stock minimo, baja rotacion, vencimientos. |
| Contabilidad / Tesoreria | Flujo de efectivo, cierre de caja, conciliaciones, compras por proveedor, rentabilidad. |
| RRHH / Nomina | Planilla. |
| Activos Fijos | Activos fijos y detalle de activos fijos. |
| Auditor | Todos los reportes, auditoria y detalle de auditoria. |

## Recomendacion final

Se recomienda mantener `Administrador` como rol tecnico total y crear roles funcionales por area. La separacion minima sugerida para produccion seria:

- `Administrador`.
- `Gerencia General`.
- `Gerente Matriz / Operaciones`.
- `Encargado Sucursal`.
- `Cajero`.
- `Vendedor / Dependiente`.
- `Inventario / Bodega`.
- `Compras Matriz`.
- `Contabilidad / Tesoreria`.
- `RRHH / Nomina`.
- `Auditor`.

Roles adicionales como `Recepcion Compras`, `Logistica / Traslados`, `Call Center`, `Activos Fijos` y `Catalogos Maestros` pueden crearse si esas funciones las realizan personas distintas.

La regla practica es: primero asignar menus, luego asignar permisos por accion y finalmente definir `IS_GLOBAL` solo cuando el usuario realmente deba ver u operar datos de todas las sucursales. Para usuarios de sucursal, dejar `IS_GLOBAL = false` y asegurar que tengan empleado/sucursal asociada.
