# Analisis de roles, menus y permisos

Fecha de analisis: 2026-10-07

Fuente principal: datos activos consultados en Oracle desde `TB_ROLE`, `TB_MENU`, `TB_ROLE_MENU`, `TB_PERMISSION`, `T_ROLE_PERMISSION`, `TB_BRANCH` y `TB_PAYROLL_POSITION`.

## Resumen ejecutivo

La propuesta de roles cubre varios flujos principales de una cadena de farmacias, pero todavia no esta consistente para operar en produccion. Hay roles bien encaminados, pero existen tres problemas criticos:

1. `Gerencia General` tiene 28 menus asignados y 0 permisos efectivos. El usuario vera opciones, pero no podra ejecutar acciones protegidas.
2. Todos los permisos activos tienen `IS_GLOBAL = 0`. El alcance global depende de que el empleado este asignado a la sucursal matriz (`TB_BRANCH.IS_MAIN = 1`) o no tenga empleado/sucursal asignada. Esto puede funcionar, pero es fragil para puestos corporativos.
3. Hay puestos operativos propuestos que no tienen rol dedicado o estan mezclados con roles demasiado amplios: `Supervisor de sucursales`, `Motorista/Repartidor`, `Auxiliar de farmacia`, `Director tecnico farmaceutico`, y la separacion entre `Contador general` y `Tesoreria`.

Conclusion: no recomiendo eliminar roles existentes todavia; recomiendo corregir permisos, dividir 2 roles por segregacion de funciones y agregar 5 roles nuevos para cubrir flujos reales sin sobrepermisos.

## Modelo de seguridad observado

- `TB_ROLE` define roles de acceso, no puestos de nomina.
- `TB_USER.ID_ROLE` asigna un unico rol al usuario.
- `TB_USER.ID_PERSONAL` enlaza al empleado.
- `TB_EMPLOYEE.BRANCH_ID` define la sucursal del empleado.
- `TB_BRANCH.IS_MAIN = 1` identifica casa matriz. Actualmente existe `CENTRAL` como sucursal matriz.
- `T_ROLE_PERMISSION.IS_CHECK = 1` habilita el permiso.
- `T_ROLE_PERMISSION.IS_GLOBAL = 1` omite filtro por sucursal para ese permiso.
- Si `IS_GLOBAL = 0`, el RLS limita datos por sucursal del empleado, excepto si el empleado pertenece a una sucursal matriz (`IS_MAIN = 1`).
- Si el usuario no tiene empleado/sucursal asociada, el contexto RLS queda sin sucursal y en la practica ve global.

## Sucursales activas

| ID | Sucursal | Matriz |
| --- | --- | --- |
| 1 | CENTRAL | Si |
| 2 | Sucursal Solola | No |
| 3 | Sucursal Panajachel | No |
| 4 | Sucursal Tecpan | No |
| 7 | Sucursal San Andres Semetabaj | No |

## Roles activos extraidos de base de datos

| Rol | Menus activos | Permisos efectivos | Permisos globales | Permisos locales | Diagnostico |
| --- | ---: | ---: | ---: | ---: | --- |
| Administrador | 40 | 215 | 0 | 215 | Completo, pero global depende de sucursal/no empleado. |
| Cajero | 5 | 15 | 0 | 15 | Razonable para venta/caja local, pero mezcla dependiente y cajero. |
| Encargado de Sucursal | 10 | 62 | 0 | 62 | Cubre administracion local, pero tiene demasiados permisos de reportes sensibles. |
| Gerencia General | 28 | 0 | 0 | 0 | Invalido actualmente: menus sin permisos. |
| Inventario / Bodega | 12 | 30 | 0 | 30 | Cubre bodega, pero es muy amplio para auxiliar de bodega. |
| Compras y Abastecimiento | 13 | 26 | 0 | 26 | Bien encaminado, pero falta definir alcance global/matriz. |
| Call Center | 6 | 8 | 0 | 8 | Correcto para toma de pedidos, no para reparto. Tiene nombre con espacio final. |
| Contabilidad / Tesoreria | 10 | 20 | 0 | 20 | Funcional, pero combina contabilidad y tesoreria. |
| RRHH | 9 | 13 | 0 | 13 | Cubre mantenimiento de personal/nomina, pero menu Reportes no tiene permisos. |
| Auditor | 3 | 2 | 0 | 2 | Insuficiente para auditoria interna real. |
| Logistica / Traslados | 8 | 11 | 0 | 11 | Util para traslados, excesivo para motorista/repartidor. |

No se encontraron duplicados fisicos en `TB_ROLE_MENU` ni `T_ROLE_PERMISSION`.

## Modulos y pantallas registradas por backend

| Area | Pantallas activas registradas |
| --- | --- |
| Seguridad | Menus, Menus por rol, Permisos, Roles, Usuarios |
| Catalogo / mantenimiento | Empresa, Sucursales, Personal, Medicamentos, Categorias, Laboratorios, Presentaciones, Proveedores, Medicamentos por proveedor, Unidades de medida, Cajas, Tipos de movimiento de caja, Tipos de movimiento de inventario, Puestos de nomina, Conceptos de nomina |
| Operaciones | Caja del dia, Caja y bancos, Call Center, Compras, Inventario, Traslados entre sucursales, Ventas, Nomina, Activos fijos |
| Reportes | Reportes consolidados |

Observacion: existen permisos activos para `StockTransfer`, `AuditReport` y `PayrollReport`, pero sus menus estan deshabilitados (`STATUS = D`) y esas pantallas ya no aparecen registradas como pantallas activas. Deben depurarse o reactivarse formalmente.

## Organigrama propuesto

```text
Gerente general
+-- Supervisor de sucursales
|   +-- Encargado de farmacia
|   |   +-- Cajero / Dependiente
|   |   +-- Auxiliar de farmacia
|   +-- Motorista / Repartidor
+-- Compras y abastecimiento
|   +-- Encargado de bodega y logistica
|       +-- Auxiliar de bodega
+-- Contador general
|   +-- Encargado de tesoreria
+-- Recursos humanos
+-- Call center
+-- Responsable tecnico farmaceutico
+-- Auditor interno
+-- Administrador de sistemas
```

## Mapeo puesto contra rol actual

| Puesto propuesto | Rol actual sugerido | Validacion |
| --- | --- | --- |
| Gerente general | Gerencia General | No valido hasta asignar permisos. Debe ser global y principalmente lectura/aprobacion. |
| Supervisor de sucursales | No existe rol especifico | Falta rol. No conviene usar Gerencia General ni Encargado de Sucursal. |
| Encargado de compras | Compras y Abastecimiento | Valido, con alcance matriz/global. |
| Encargado de bodega y logistica | Inventario / Bodega o Logistica / Traslados | Parcial. Conviene definir si administra catalogo/inventario o solo traslados. |
| Auxiliar de bodega | Inventario / Bodega | No ideal: rol actual permite crear/editar catalogos. Requiere rol mas limitado. |
| Contador general | Contabilidad / Tesoreria | Parcial. Debe separarse de tesoreria si se busca control interno. |
| Encargado de tesoreria | Contabilidad / Tesoreria | Parcial. Debe tener bancos, pagos, conciliaciones; no necesariamente contabilidad completa. |
| Encargado de recursos humanos | RRHH | Valido, pero faltan reportes de planilla si se usan. |
| Agente de call center | Call Center | Valido para pedido, disponibilidad y seguimiento. |
| Administrador de sistemas | Administrador | Valido. Debe ser global independientemente de sucursal. |
| Encargado de farmacia | Encargado de Sucursal | Valido como rol local. Revisar reportes sensibles. |
| Cajero / Dependiente | Cajero | Valido si el puesto vende y cobra. Si solo atiende, falta rol Dependiente. |
| Auxiliar de farmacia | Cajero o Encargado de Sucursal | No ideal. Falta rol auxiliar con venta/consulta/recepcion limitada. |
| Motorista / Repartidor | Logistica / Traslados | No ideal. El rol actual puede crear/cancelar/rechazar traslados. Falta rol repartidor. |
| Director tecnico farmaceutico | No existe rol especifico | Falta rol sanitario/tecnico. |
| Auditor interno | Auditor | No valido: permisos actuales son insuficientes. |

## Evaluacion por rol

### Administrador

Tiene todos los menus relevantes de seguridad, catalogo, operaciones y reportes. Es correcto para `Administrador de sistemas`, pero no deberia depender de estar en sucursal matriz para tener alcance global. Recomendacion: marcar `IS_GLOBAL = 1` en sus permisos o asegurar que nunca tenga empleado/sucursal local asociada.

### Gerencia General

Inconsistente: tiene menus de catalogo, operaciones y reportes, pero 0 permisos efectivos. Debe corregirse antes de usarlo.

Recomendacion minima: asignar permisos `Ver` y permisos de reportes ejecutivos con `IS_GLOBAL = 1`. Evitar permisos de crear/editar/eliminar salvo aprobaciones gerenciales puntuales.

### Supervisor de sucursales

No existe. Es distinto de Gerente General y de Encargado de Sucursal. Debe ver multiples sucursales, monitorear ventas, inventario, caja y cumplimiento, pero no administrar seguridad ni mantenimiento maestro.

Recomendacion: crear rol `Supervisor de Sucursales` con permisos globales de lectura/reportes y acciones operativas limitadas como autorizar/revisar caja, inventario y traslados.

### Encargado de Sucursal

Es el rol local mas completo. Logicamente cubre encargado de farmacia si se asigna a sucursal local. Tiene ventas, caja, inventario, traslados, solicitudes de compra y reportes.

Riesgo: tiene 24 permisos de reportes, incluyendo auditoria, planilla, rentabilidad y activos fijos. Para sucursal puede ser demasiado sensible.

Recomendacion: mantener local (`IS_GLOBAL = 0`), quitar reportes de planilla/auditoria/rentabilidad si no son necesarios, y dejar ventas, inventario, caja, traslados y stock local.

### Cajero

Tiene caja del dia, ventas, inventario en lectura, entrega de pedidos y algunos permisos de consulta. Es coherente para cajero/dependiente.

Riesgo: tiene permiso `Purchase.Ver` sin menu activo de compras; puede ser permiso tecnico innecesario o inconsistente.

Recomendacion: conservar venta/caja local; quitar `Purchase.Ver` si no se usa para validar disponibilidad o recepcion.

### Auxiliar de farmacia

No existe rol. Usar `Cajero` le da caja y venta; usar `Encargado de Sucursal` le da demasiada administracion.

Recomendacion: crear rol `Auxiliar de Farmacia` con `Medicine.Ver`, `Inventory.Ver`, `CustomerOrder.Ver`, `CustomerOrder.Entregar` si prepara pedidos, y opcionalmente `Sale.Crear` solo si tambien vende.

### Call Center

Tiene permisos adecuados para crear, editar, enviar, cancelar y ver pedidos, consultar medicamentos, inventario y sucursales. Es correcto para agente de call center.

Riesgo: el nombre del rol tiene espacio final (`Call Center `), lo cual puede causar duplicados visuales o errores de comparacion.

Recomendacion: normalizar el nombre a `Call Center`.

### Motorista / Repartidor

No existe rol especifico. `Logistica / Traslados` no debe usarse para motorista porque permite crear/cancelar/rechazar traslados entre sucursales.

Recomendacion: crear rol `Repartidor` con permisos minimos sobre pedidos a domicilio: ver pedidos asignados, marcar entregado/fallido, registrar cobro si aplica. Actualmente el modulo visible mas cercano es `CustomerOrder.Entregar`, pero faltaria modelar estados de entrega si el flujo lo requiere.

### Compras y Abastecimiento

Permisos coherentes: proveedores, medicamentos/proveedor, compras con solicitar, ordenar, aprobar, recibir, facturar y devolver. Falta `Pagar`, que correctamente esta en tesoreria.

Riesgo: tiene `Aprobar` y `Ordenar` en el mismo rol; en empresas pequenas puede aceptarse, pero para control interno conviene separar solicitante/comprador/aprobador.

Recomendacion: mantener para encargado de compras; si habra flujo formal, separar `Compras` y `Aprobador de Compras`.

### Inventario / Bodega

Cubre catalogos de medicamento, movimientos y traslados. Es adecuado para encargado de bodega, no para auxiliar.

Riesgo: permite crear/editar catalogos maestros. Un auxiliar de bodega no deberia crear categorias, laboratorios, unidades ni medicamentos salvo autorizacion.

Recomendacion: mantener como encargado de bodega/logistica; crear rol `Auxiliar de Bodega` solo con recepcion, preparacion, inventario/traslados en lectura y estados necesarios.

### Logistica / Traslados

Cubre traslados entre sucursales con crear, aceptar, enviar, entregar, cancelar y rechazar. Es util para coordinacion logistica, no para motorista.

Recomendacion: mantener para encargado/coordinador de logistica. No usarlo para repartidores.

### Contabilidad / Tesoreria

Cubre cajas, tipos de movimientos, sesiones de caja, compras en pago, ventas en lectura, bancos/tesoreria y reportes financieros. Funcionalmente tiene logica.

Riesgo: une dos puestos sensibles. La persona que paga proveedores y concilia bancos no siempre debe administrar contabilidad completa o tipos de caja.

Recomendacion: dividir en `Contabilidad` y `Tesoreria` si habra control interno. Si el negocio es pequeno, puede mantenerse combinado temporalmente.

### RRHH

Cubre personal, puestos/conceptos de nomina y nomina. Es coherente para recursos humanos.

Inconsistencia: tiene menu `Reportes`, pero no tiene permisos efectivos de `ConsolidatedReport`; por tanto el menu queda inutil.

Recomendacion: agregar permiso de reporte `Planilla` si RRHH debe consultar reportes, o quitar el menu de reportes.

### Auditor

Actualmente solo tiene `Branch.Ver` y `ConsolidatedReport.Auditoria`. Es insuficiente para auditor interno, porque el puesto propuesto debe revisar inventarios, caja, compras, traslados y cumplimiento.

Recomendacion: ampliar como rol de solo lectura global sobre reportes de ventas, caja, inventario, compras, traslados, activos y auditoria. No debe crear/editar/eliminar.

## Hallazgos de consistencia

| Hallazgo | Impacto | Recomendacion |
| --- | --- | --- |
| `Gerencia General` tiene menus sin permisos | Alto | Asignar permisos o desactivar el rol. |
| Todos los `IS_GLOBAL` estan en 0 | Alto | Definir matriz/global por rol. No depender solo de sucursal matriz para roles corporativos criticos. |
| `RRHH` tiene menu de Reportes sin permisos | Medio | Agregar reporte de planilla o quitar menu. |
| `Cajero` tiene `Purchase.Ver` sin menu de compras | Bajo/Medio | Quitar si no hay dependencia funcional. |
| `Encargado de Sucursal` tiene reportes sensibles | Medio | Reducir reportes a alcance operativo local. |
| `Auditor` es demasiado limitado | Alto | Ampliar lectura/reportes globales. |
| `Call Center ` tiene espacio final | Bajo | Renombrar a `Call Center`. |
| Permisos activos de menus deshabilitados | Medio | Depurar `StockTransfer`, `AuditReport`, `PayrollReport` o reactivarlos formalmente. |
| `Contabilidad / Tesoreria` combina funciones | Medio | Separar si se requiere segregacion. |

## Recomendacion de roles finales

### Mantener

- `Administrador`
- `Cajero`
- `Encargado de Sucursal`
- `Compras y Abastecimiento`
- `Call Center` despues de normalizar nombre
- `RRHH` despues de corregir reportes
- `Inventario / Bodega` como encargado, no como auxiliar
- `Logistica / Traslados` como coordinador, no como motorista

### Corregir

- `Gerencia General`: agregar permisos efectivos globales de lectura/reporte/aprobacion.
- `Auditor`: convertir a auditoria interna de solo lectura global.
- `Contabilidad / Tesoreria`: dividir si se requiere control interno.

### Agregar

- `Supervisor de Sucursales`
- `Auxiliar de Farmacia`
- `Auxiliar de Bodega`
- `Repartidor`
- `Responsable Tecnico Farmaceutico`

### Evaluar dividir

- `Contabilidad`
- `Tesoreria`
- `Aprobador de Compras`, solo si se quiere flujo de aprobacion separado del comprador.

## Matriz de alcance recomendada

| Rol | Alcance recomendado | IS_GLOBAL recomendado |
| --- | --- | --- |
| Administrador | Sistema completo | Si |
| Gerencia General | Toda la cadena | Si |
| Supervisor de Sucursales | Toda la cadena operativa | Si |
| Compras y Abastecimiento | Matriz / bodega central | Si en compras e inventario central |
| Inventario / Bodega | Matriz o bodega asignada | Si solo si opera bodega central; local si opera sucursal |
| Logistica / Traslados | Matriz o rutas asignadas | Parcial, segun flujo |
| Contabilidad | Toda la cadena financiera | Si |
| Tesoreria | Toda la cadena financiera | Si |
| RRHH | Toda la cadena de personal | Si |
| Call Center | Toda la cadena para disponibilidad/pedidos | Si para consulta de sucursales/inventario; local si se asigna por sucursal |
| Encargado de Sucursal | Sucursal asignada | No |
| Cajero | Sucursal asignada | No |
| Auxiliar de Farmacia | Sucursal asignada | No |
| Repartidor | Pedidos/ruta asignada | No o alcance especial por asignacion |
| Auditor | Toda la cadena, solo lectura | Si |
| Responsable Tecnico Farmaceutico | Establecimientos bajo responsabilidad | Parcial; idealmente alcance por asignacion, no global total |

## Decision sobre puestos vs roles

Los puestos propuestos tienen logica organizacional. El problema no esta en el organigrama, sino en que algunos puestos no deben compartir el mismo rol porque sus permisos son distintos.

Roles y puestos no deben mapearse 1:1 siempre. Un rol puede servir para varios puestos si sus permisos coinciden, pero en estos casos no coinciden: auxiliar vs encargado, repartidor vs logistica, contador vs tesoreria, auditor real vs auditor actual.

## Unificacion recomendada de puestos y roles

No todos los puestos necesitan un rol propio. Conviene crear roles solo cuando la operacion, el alcance o el riesgo de permisos cambia de forma real. Bajo ese criterio, esta es la propuesta mas practica.

### Puestos que pueden compartir rol

| Puestos | Rol recomendado | Justificacion |
| --- | --- | --- |
| Gerente general | Gerencia General | Es un rol ejecutivo de lectura, reportes y aprobaciones globales. |
| Encargado de compras | Compras y Abastecimiento | La operacion principal es proveedores, compras, ordenes y recepcion documental. |
| Encargado de bodega y logistica | Inventario / Bodega | Si administra inventario central, recepciones, lotes y abastecimiento. |
| Contador general y Encargado de tesoreria | Contabilidad / Tesoreria | Se pueden unificar si la empresa es pequena y una misma persona controla contabilidad, bancos, pagos y conciliacion. |
| Agente de call center | Call Center | Rol directo y suficiente para pedidos, disponibilidad y seguimiento. |
| Administrador de sistemas | Administrador | Rol directo para seguridad, configuracion y mantenimiento tecnico. |
| Encargado de farmacia | Encargado de Sucursal | Rol directo para administrar la sucursal local. |
| Cajero / Dependiente | Cajero | Puede unificarse si el dependiente vende, cobra y atiende clientes. |
| Auditor interno | Auditor | Puede mantenerse el rol, pero debe ampliarse; no hace falta crear otro nombre. |

### Puestos que no deberian compartir rol actual

| Puesto | Por que no conviene usar rol existente | Rol requerido |
| --- | --- | --- |
| Supervisor de sucursales | No es gerente general ni encargado local; necesita ver varias sucursales sin administrar seguridad. | Supervisor de Sucursales |
| Auxiliar de bodega | `Inventario / Bodega` permite crear/editar catalogos maestros. | Auxiliar de Bodega |
| Auxiliar de farmacia | `Cajero` da caja/venta y `Encargado de Sucursal` da demasiada administracion. | Auxiliar de Farmacia |
| Motorista / Repartidor | `Logistica / Traslados` permite crear, cancelar y rechazar traslados; es demasiado amplio. | Repartidor |
| Director o responsable tecnico farmaceutico | No existe rol sanitario/tecnico para supervision regulatoria. | Responsable Tecnico Farmaceutico |

### Roles que recomiendo dejar unificados inicialmente

- `Contabilidad / Tesoreria`: mantener unificado si el volumen operativo es bajo o si el negocio aun no requiere segregacion formal entre pago, conciliacion y contabilidad.
- `Cajero`: puede cubrir tambien dependiente si el dependiente realiza venta y cobro.
- `Inventario / Bodega`: puede cubrir encargado de bodega y encargado de logistica central si la misma persona gestiona recepcion, inventario y despacho.
- `Auditor`: no crear otro rol; corregir el existente para que sea realmente auditoria interna.

### Roles que si recomiendo crear

| Rol nuevo | Motivo operativo | Alcance sugerido |
| --- | --- | --- |
| Supervisor de Sucursales | Supervisa ventas, inventario, caja y cumplimiento en varias sucursales. | Global o por grupo de sucursales. |
| Auxiliar de Bodega | Recibe, organiza y despacha, pero no debe administrar catalogos maestros. | Bodega central o sucursal asignada. |
| Auxiliar de Farmacia | Apoya atencion, preparacion de pedidos e inventario local sin control administrativo completo. | Sucursal local. |
| Repartidor | Entrega pedidos y actualiza estados, sin permisos de traslados ni catalogos. | Pedidos/ruta asignada. |
| Responsable Tecnico Farmaceutico | Requiere supervision sanitaria y tecnica distinta de operaciones comerciales. | Establecimientos asignados. |

### Ajuste recomendado a la lista de roles finales

Con un criterio pragmatico, la matriz final podria quedar asi:

| Rol final | Puestos que cubre |
| --- | --- |
| Administrador | Administrador de sistemas |
| Gerencia General | Gerente general |
| Supervisor de Sucursales | Supervisor de sucursales |
| Compras y Abastecimiento | Encargado de compras |
| Inventario / Bodega | Encargado de bodega y logistica |
| Auxiliar de Bodega | Auxiliar de bodega |
| Contabilidad / Tesoreria | Contador general, encargado de tesoreria |
| RRHH | Encargado de recursos humanos |
| Call Center | Agente de call center |
| Encargado de Sucursal | Encargado de farmacia |
| Cajero | Cajero / Dependiente |
| Auxiliar de Farmacia | Auxiliar de farmacia |
| Repartidor | Motorista / Repartidor |
| Responsable Tecnico Farmaceutico | Director o responsable tecnico farmaceutico |
| Auditor | Auditor interno |

Esta propuesta reduce duplicidad, pero crea roles donde la operacion y el riesgo de permisos si son distintos.

## Acciones recomendadas en orden

1. Corregir `Gerencia General` asignando permisos efectivos o quitar sus menus hasta configurarlo.
2. Definir politica de `IS_GLOBAL`: matriz por sucursal principal o permisos globales explicitos. Recomiendo explicitos para roles corporativos.
3. Crear roles faltantes: `Supervisor de Sucursales`, `Auxiliar de Farmacia`, `Auxiliar de Bodega`, `Repartidor`, `Responsable Tecnico Farmaceutico`.
4. Ampliar `Auditor` como solo lectura global sobre reportes clave.
5. Corregir `RRHH`: agregar reporte de planilla o quitar menu `Reportes`.
6. Normalizar nombre `Call Center ` a `Call Center`.
7. Depurar permisos activos de menus deshabilitados (`StockTransfer`, `AuditReport`, `PayrollReport`) para evitar deuda de seguridad.
8. Revisar reportes de `Encargado de Sucursal` y retirar planilla/auditoria/rentabilidad si no corresponden.
9. Separar `Contabilidad / Tesoreria` si el negocio requiere aprobacion, pago y conciliacion por personas distintas.

## Veredicto final

La estructura propuesta es una buena base, pero no esta cerrada. Actualmente cubre ventas, caja, compras, inventario, traslados, nomina, tesoreria, call center y seguridad, pero no cubre correctamente supervision multi-sucursal, auditoria interna, reparto, auxiliares y responsable tecnico. Tampoco esta consistente el alcance matriz/local porque todos los permisos estan locales y se confia en la sucursal matriz para elevar alcance.

Antes de operar con usuarios reales, deben corregirse como minimo `Gerencia General`, `Auditor`, `RRHH`, `IS_GLOBAL` para roles corporativos y los roles faltantes de auxiliares/reparto/supervision.
