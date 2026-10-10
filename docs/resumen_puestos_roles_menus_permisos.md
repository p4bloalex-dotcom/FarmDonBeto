# Propuesta resumida de puestos, roles, menús y acciones

**Sistema:** cadena de farmacias con casa matriz y múltiples sucursales (Guatemala)  
**Base:** `MENUS_PERMISOS.md` (nombres exactos de menús y acciones).  
**Estado:** propuesta de configuración, **no** asignaciones actualmente verificadas en base de datos.

## 1. Puestos laborales (16)

| # | Puesto | Ubicación habitual | Descripción breve | Rol sugerido |
|---|---|---|---|---|
| 1 | Gerente general | Matriz | Dirige la cadena y autoriza decisiones de compras. | Gerencia General |
| 2 | Supervisor de sucursales | Matriz / sucursales | Supervisa resultados y controles de farmacias asignadas. | Supervisor de Sucursales |
| 3 | Encargado de compras | Matriz | Gestiona proveedores, órdenes y facturas de abastecimiento. | Compras y Abastecimiento |
| 4 | Encargado de bodega y logística | Matriz | Controla bodega central, recepciones y despachos. | Inventario / Bodega |
| 5 | Auxiliar de bodega | Matriz | Recibe y prepara productos para su distribución. | Auxiliar de Bodega |
| 6 | Contador general | Matriz | Revisa finanzas, cajas y activos fijos. | Contabilidad / Tesorería |
| 7 | Encargado de tesorería | Matriz | Gestiona cuentas, movimientos y pagos a proveedores. | Contabilidad / Tesorería |
| 8 | Encargado de RRHH | Matriz | Administra personal, puestos, conceptos y nómina. | RRHH |
| 9 | Agente de call center | Matriz | Registra pedidos y da seguimiento a entregas. | Call Center |
| 10 | Auditor interno | Matriz / visitas | Revisa trazabilidad, inventarios, caja y compras. | Auditor |
| 11 | Administrador de sistemas | Matriz | Administra acceso, menús, usuarios y permisos. | Administrador |
| 12 | Encargado de farmacia | Sucursal | Dirige ventas, caja, inventario y abastecimiento local. | Encargado de Sucursal |
| 13 | Cajero / Dependiente | Sucursal | Vende, cobra y opera su sesión de caja. | Cajero |
| 14 | Auxiliar de farmacia | Sucursal | Apoya inventario y recepción/preparación de productos. | Auxiliar de Farmacia |
| 15 | Motorista / Repartidor | Sucursal / distribución | Lleva pedidos a domicilio y confirma entregas. | Repartidor |
| 16 | Director técnico farmacéutico | Establecimientos autorizados | Supervisa conformidad sanitaria y liberación de lotes. | Responsable Técnico Farmacéutico |

> Un puesto no equivale necesariamente a un rol. El contador y el encargado de tesorería comparten un rol **solo de manera inicial**; conviene separarlo si ambos desempeñan funciones y autorizaciones independientes.

## 2. Lista de roles de seguridad (15)

1. Administrador
2. Gerencia General
3. Supervisor de Sucursales
4. Compras y Abastecimiento
5. Inventario / Bodega
6. Auxiliar de Bodega --------------
7. Contabilidad / Tesorería
8. RRHH
9. Call Center
10. Encargado de Sucursal
11. Cajero
12. Auxiliar de Farmacia
13. Repartidor
14. Responsable Técnico Farmacéutico
15. Auditor

## 3. Relación roles → menús → acciones autorizadas

**Convenciones:** `G` = permiso con `IS_GLOBAL=1`; `L` = permiso con `IS_GLOBAL=0`, restringido a la sucursal asociada; `M` = operaciones restringidas a CENTRAL/bodega matriz, **sin implicar global**; `A` = sucursales o registros asignados, que requieren un filtro adicional de asignación. **El alcance se configura por acción.** Los nombres de las acciones provienen del archivo de menús y permisos.

### 3.1 Administrador — configuración corporativa

| Menú | Acciones | Alcance |
|---|---|---|
| Usuarios, Roles, Menus por rol | Ver, Crear, Editar, Eliminar | G |
| Menus | Ver, Crear, Editar | G |
| Permisos | Ver, Editar | G |
| Empresa | Ver, Crear | G |
| Sucursales | Ver, Crear, Editar, Eliminar | G |
| Auditoria | Ver | G |

### 3.2 Gerencia General — supervisión ejecutiva

| Menú | Acciones | Alcance |
|---|---|---|
| Compras | Ver, Aprobar | G |
| Inventario, Ventas, Traslados entre sucursales, Caja y bancos, Activos fijos | Ver | G |
| Caja del dia | Ver, Reportes | G |
| Reportes | Ventas por periodo, Ventas por sucursal, Inventario consolidado, Compras por proveedor, Flujo de efectivo, Margen por sucursal, Activos fijos, Cierre y diferencias de caja | G |

### 3.3 Supervisor de Sucursales — supervisión operativa

| Menú | Acciones | Alcance |
|---|---|---|
| Sucursales, Ventas, Inventario, Traslados entre sucursales, Cajas | Ver | A |
| Caja del dia | Ver, Autorizar, Reportes | A |
| Reportes | Ventas por sucursal, Ventas por periodo, Inventario por sucursal, Stock minimo, Cierre y diferencias de caja, Traslados entre sucursales | A |

### 3.4 Compras y Abastecimiento — compras centralizadas

| Menú | Acciones | Alcance |
|---|---|---|
| Compras | Ver, Crear, Editar, Solicitar, Ordenar, Facturar, Devolver | G para Ver; M para operaciones de órdenes |
| Proveedores, Medicamentos por proveedor | Ver, Crear, Editar, Eliminar | G, catálogo central |
| Medicamentos, Inventario, Traslados entre sucursales | Ver | G |
| Reportes | Compras por proveedor, Stock minimo, Inventario consolidado | G |

### 3.5 Inventario / Bodega — control de bodega central

| Menú | Acciones | Alcance |
|---|---|---|
| Medicamentos, Categorias de medicina, Laboratorios, Presentaciones, Unidades de medida | Ver, Crear, Editar, Eliminar | G para catálogo maestro central |
| Inventario | Ver, Crear, Editar | M |
| Tipos de movimiento de inventario | Ver | M |
| Compras | Ver, Recibir, Devolver | M |
| Traslados entre sucursales | Ver, Crear, Aceptar, Enviar, Rechazar, Cancelar | M cuando CENTRAL intervenga |
| Reportes | Inventario por sucursal, Medicamentos proximos a vencer, Medicamentos vencidos, Stock minimo, Kardex de inventario, Traslados entre sucursales | M |

### 3.6 Auxiliar de Bodega — ejecución en bodega

| Menú | Acciones | Alcance |
|---|---|---|
| Medicamentos, Inventario | Ver | M |
| Compras | Ver, Recibir | M, recepción autorizada |
| Traslados entre sucursales | Ver, Enviar | M, despacho autorizado |
| Reportes | Inventario por sucursal, Medicamentos proximos a vencer | M |

### 3.7 Contabilidad / Tesorería — administración financiera

| Menú | Acciones | Alcance |
|---|---|---|
| Caja y bancos | Ver, Crear, Editar | G financiero |
| Compras | Ver, Pagar | G para Ver; pagos aprobados |
| Caja del dia | Ver, Reportes | G |
| Activos fijos | Ver, Crear, Editar, Eliminar | G |
| Reportes | Flujo de efectivo, Cierre y diferencias de caja, Movimientos detallados por caja, Conciliaciones de caja, Historial de ingresos y egresos por sesion, Compras por proveedor, Margen por sucursal, Activos fijos, Detalle de activos fijos | G |

### 3.8 RRHH — personal y planillas

| Menú | Acciones | Alcance |
|---|---|---|
| Personal | Ver, Crear, Editar, Eliminar | G |
| Puestos de nomina, Conceptos de nomina | Ver, Crear, Editar, Eliminar | G |
| Nomina | Ver, Crear, Editar, Eliminar | G, según estado |
| Sucursales | Ver | G |
| Reportes | Planilla | G, dato sensible |

### 3.9 Call Center — pedidos remotos

| Menú | Acciones | Alcance |
|---|---|---|
| Call Center | Ver, Crear, Editar, Cancelar | G para disponibilidad; pedidos a cargo para modificaciones |
| Medicamentos, Inventario, Sucursales | Ver | G en consulta |

### 3.10 Encargado de Sucursal — operación local

| Menú | Acciones | Alcance |
|---|---|---|
| Ventas | Ver | L |
| Caja del dia | Ver, Cerrar, Autorizar, Conciliar, Reportes | L |
| Cajas | Ver, Crear, Editar | L |
| Inventario | Ver, Editar | L, solo parámetros permitidos |
| Compras | Ver, Solicitar | L |
| Traslados entre sucursales | Ver, Crear, Aceptar, Enviar, Entregar, Rechazar, Cancelar | L, según origen/destino |
| Call Center | Ver, Enviar | L, pedidos de su sucursal |
| Reportes | Ventas por periodo, Detalle de venta, Inventario por sucursal, Stock minimo, Cierre y diferencias de caja | L |

### 3.11 Cajero — venta y cobro

| Menú | Acciones | Alcance |
|---|---|---|
| Ventas | Ver, Crear | L |
| Caja del dia | Ver, Crear, Cerrar, Movimiento | L, sesiones propias |
| Medicamentos, Inventario | Ver | L |

### 3.12 Auxiliar de Farmacia — apoyo operativo local

| Menú | Acciones | Alcance |
|---|---|---|
| Medicamentos, Inventario | Ver | L |
| Traslados entre sucursales | Ver, Entregar | L, solo recepción autorizada en destino |
| Compras | Ver | L, solicitudes propias de sucursal |
| Call Center | Ver | L, pedidos a preparar |

### 3.13 Repartidor — entregas a domicilio

| Menú | Acciones | Alcance |
|---|---|---|
| Call Center | Ver, Entregar | A, **solo pedidos asignados al motorista** |

### 3.14 Responsable Técnico Farmacéutico — control sanitario

| Menú | Acciones | Alcance |
|---|---|---|
| Medicamentos | Ver | A |
| Inventario | Ver, Validacion tecnica | A, lotes de establecimientos autorizados |
| Compras | Ver, Validacion tecnica | A, lotes recibidos que correspondan |
| Sucursales | Ver | A |
| Reportes | Medicamentos proximos a vencer, Medicamentos vencidos, Kardex de inventario, Inventario por sucursal | A |

### 3.15 Auditor — revisión sin modificación

| Menú | Acciones | Alcance |
|---|---|---|
| Auditoria | Ver | G |
| Ventas, Compras, Inventario, Traslados entre sucursales, Caja y bancos, Activos fijos | Ver | G |
| Caja del dia | Ver, Auditoria | G |
| Reportes | Ventas por periodo, Ventas por sucursal, Detalle de venta, Inventario consolidado, Kardex de inventario, Traslados entre sucursales, Compras por proveedor, Flujo de efectivo, Cierre y diferencias de caja, Movimientos detallados por caja, Conciliaciones de caja, Activos fijos, Detalle de activos fijos, Auditoria | G |

## 4. Reglas de matriz, sucursales e `IS_GLOBAL`

| Contexto | Regla sugerida |
|---|---|
| CENTRAL (`IS_MAIN=1`) | Identifica matriz y concentra compras externas; **no** concede acceso global por sí sola. |
| Sucursales (`IS_MAIN=0`) | Ventas, caja, inventario y solicitudes propias; traslados donde sean origen o destino. |
| `IS_GLOBAL=1` | Habilita una acción sobre todas las sucursales en los módulos autorizados. |
| `IS_GLOBAL=0` | Limita una acción al alcance local o asignado. |
| Supervisor / responsable técnico | Requieren asociación a múltiples sucursales específicas (por ejemplo `TB_USER_BRANCH`). |
| Repartidor | Requiere asociación de pedidos al usuario/motorista, **no** basta con `IS_GLOBAL=0`. |
| Usuarios sin sucursal | Denegar operaciones ligadas a sucursal salvo excepción expresa y controlada. |

## 5. Observaciones y pendientes de implementación

1. **No confundir menús con permisos:** ver un menú no autoriza sus acciones; ambas asignaciones deben existir.
2. **Acción `Ajustar` de Inventario:** aparece en la descripción funcional extendida, **pero no en `MENUS_PERMISOS.md`**. Antes de autorizar ajustes directamente, agregar permiso específico o usar un flujo existente con control equivalente. Por eso esta matriz no concede `Ajustar`.
3. **Compras e Inventario — `Validacion tecnica`:** sí existen en el archivo de acciones y deben reservarse al responsable técnico (con reemplazo autorizado si aplica).
4. **Call Center — repartidor:** existen `Ver` y `Entregar`, pero el filtro *pedidos asignados al motorista* debe implementarse en backend; no se logra solo asignando ese permiso.
5. **Separación financiera:** aunque el rol `Contabilidad / Tesorería` esté unificado, el sistema debe prevenir autoaprobaciones y registrar autorización de pagos. Con empleados diferentes, separar los roles.
6. **Inventario sanitario:** bloquear la venta de lotes no aptos y auditar los cambios de estado.
7. **Acceso corporativo:** otorgar `IS_GLOBAL=1` únicamente a las acciones concretas que necesiten operar globalmente, sin deducirlo de `IS_MAIN`.
8. **Reportes:** cada reporte se asigna individualmente; no se otorgan automáticamente todos al habilitar el menú `Reportes`.
9. **Sin menú `Dashboard` en el catálogo adjunto:** no se incluye como permiso en esta matriz hasta registrarlo en el catálogo.
10. **Estados y restricciones:** `Eliminar`, `Recibir`, `Enviar`, `Entregar` y `Pagar` requieren además validaciones del registro y trazabilidad en el backend.

---

**Resultado recomendado:** 16 puestos laborales, 15 roles informáticos y permisos mínimos por menú/acción, con alcance corporativo, local o por asignación según el proceso.

----RECUEPRAR AQUI
FASDFASDF
ADF

FDS
