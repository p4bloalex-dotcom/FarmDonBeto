# Manual de usuario final: Reportes consolidados

Fecha de revision: 8 de octubre de 2026.

Este manual explica el uso del modulo **Reportes consolidados** para el usuario final que consulta informacion operativa, financiera, inventario, compras, ventas, nomina, activos y auditoria. El contenido se basa en la pantalla, permisos y consultas implementadas en el sistema.

## 1. Objetivo del modulo

El modulo **Reportes consolidados** permite consultar informacion resumida o detallada de las operaciones del sistema, aplicar filtros, revisar resultados en pantalla y exportar reportes en **XLSX** o **PDF**.

Los reportes no crean informacion nueva. Toman datos ya registrados en otros modulos.

[img1, pantalla principal de Reportes consolidados]

## 2. Ubicacion en el sistema

Ruta funcional: **Reportes > Reportes consolidados**.

Ruta tecnica de pantalla: `consolidated-report`.

Nombre de permiso/controlador: `ConsolidatedReport`.

Categoria de permisos: `Reports`.

## 3. Alcance funcional

El modulo permite:

| Funcion | Uso |
| --- | --- |
| Seleccionar reporte | Escoger el tipo de informacion a consultar. |
| Filtrar por sucursal | Ver una sucursal o todas. |
| Filtrar por fecha | Consultar desde/hasta segun el reporte. |
| Filtrar auditoria | Buscar por usuario, objeto, accion, registro o id de auditoria. |
| Paginacion manual | Avanzar reportes grandes por pagina y limite. |
| Ver detalle | Abrir detalle de ventas o auditoria cuando aplica. |
| Exportar XLSX | Descargar reporte en Excel. |
| Exportar PDF | Descargar reporte en PDF. |

## 4. Usuarios que lo utilizan

Este modulo puede ser usado por gerencia, administracion, auditoria, contabilidad, encargados de sucursal, compras, inventario o seguridad, segun los permisos asignados.

El acceso no depende automaticamente del puesto laboral. Depende de los permisos de reporte configurados en seguridad.

## 5. Roles, puestos y matriz de permisos

### Roles sugeridos

| Rol sugerido | Uso esperado |
| --- | --- |
| Administrador | Acceso a todos los reportes. |
| Gerencia | Reportes de ventas, margen, inventario, caja, compras y nomina. |
| Auditoria | Reportes de auditoria, caja, movimientos y cierres. |
| Encargado de inventario | Reportes de inventario, kardex, vencimientos y traslados. |
| Encargado de caja | Reportes de caja, cierres y conciliaciones. |
| Compras | Reportes de compras por proveedor e inventario relacionado. |
| Recursos humanos | Reporte de planilla. |

### Puestos relacionados

| Puesto | Relacion con reportes |
| --- | --- |
| Gerente | Analiza indicadores generales y margen estimado. |
| Administrador de sucursal | Revisa ventas, caja e inventario de su sucursal. |
| Auditor interno | Revisa auditoria, diferencias y trazabilidad. |
| Encargado de compras | Revisa compras por proveedor. |
| Encargado de inventario | Revisa kardex, vencimientos y stock minimo. |
| Cajero o supervisor de caja | Revisa cierres, movimientos y conciliaciones. |
| Recursos humanos | Revisa planilla. |

### Matriz de permisos por reporte

Cada reporte tiene su propio permiso. El usuario puede tener acceso a unos reportes y no a otros.

| Permiso | Reporte |
| --- | --- |
| `ConsolidatedReport.Ventas por periodo` | Ventas por periodo. |
| `ConsolidatedReport.Ventas por sucursal` | Ventas por sucursal. |
| `ConsolidatedReport.Detalle de venta` | Detalle de venta. |
| `ConsolidatedReport.Ventas por medicamento` | Ventas por medicamento. |
| `ConsolidatedReport.Productos mas vendidos` | Productos mas vendidos. |
| `ConsolidatedReport.Productos con baja rotacion` | Productos menos vendidos o sin movimiento. |
| `ConsolidatedReport.Inventario por sucursal` | Inventario por sucursal. |
| `ConsolidatedReport.Inventario consolidado` | Inventario consolidado. |
| `ConsolidatedReport.Medicamentos proximos a vencer` | Medicamentos proximos a vencer. |
| `ConsolidatedReport.Medicamentos vencidos` | Medicamentos vencidos. |
| `ConsolidatedReport.Stock minimo` | Stock minimo. |
| `ConsolidatedReport.Kardex de inventario` | Kardex de inventario. |
| `ConsolidatedReport.Traslados entre sucursales` | Traspasos. |
| `ConsolidatedReport.Flujo de efectivo` | Flujo de efectivo. |
| `ConsolidatedReport.Cierre y diferencias de caja` | Cierre / diferencias de caja. |
| `ConsolidatedReport.Movimientos detallados por caja` | Movimientos detallados por caja. |
| `ConsolidatedReport.Conciliaciones de caja` | Conciliaciones de caja. |
| `ConsolidatedReport.Historial de ingresos y egresos por sesion` | Historial ingresos/egresos por sesion. |
| `ConsolidatedReport.Compras por proveedor` | Compras por proveedor. |
| `ConsolidatedReport.Margen por sucursal` | Margen por sucursal. |
| `ConsolidatedReport.Activos fijos` | Activos fijos. |
| `ConsolidatedReport.Detalle de activos fijos` | Detalle de activos. |
| `ConsolidatedReport.Planilla` | Nomina. |
| `ConsolidatedReport.Auditoria` | Auditoria y detalle de auditoria. |

Si el usuario intenta abrir o descargar un reporte sin permiso, el sistema puede mostrar: **No tienes permiso o no se pudo descargar el reporte.**

## 6. Dependencias con otros modulos

### Dependencias obligatorias

| Modulo | Relacion |
| --- | --- |
| Seguridad | Controla permisos por reporte. |
| Sucursales | Filtro comun para reportes por sucursal. |
| Ventas | Fuente de reportes de ventas, productos, margen y detalle. |
| Inventario | Fuente de inventario, kardex, vencimientos, stock minimo y traslados. |
| Caja del dia | Fuente de flujo de efectivo, cierres y movimientos. |
| Caja y bancos | Fuente de conciliaciones y movimientos financieros cuando aplica. |
| Compras | Fuente de compras por proveedor. |
| Activos fijos | Fuente de activos y detalle de activos. |
| Nomina | Fuente de planilla. |
| Auditoria | Fuente de reportes de auditoria. |

### Catalogos y mantenimientos relacionados

| Catalogo/mantenimiento | Uso |
| --- | --- |
| Sucursales | Filtro y agrupacion. |
| Medicamentos | Nombres, codigos, categorias y costos. |
| Categorias de medicamentos | Filtro o agrupacion en reportes de inventario y venta. |
| Proveedores | Compras por proveedor. |
| Cajas y tipos de movimiento | Reportes de caja. |
| Usuarios, roles y permisos | Auditoria y control de acceso. |

## 7. Pantalla principal

La pantalla tiene una seccion de filtros y una tabla de resultados.

[img2, filtros de Reportes consolidados]

Filtros principales:

| Filtro | Uso |
| --- | --- |
| Reporte | Selecciona el reporte a consultar. |
| Sucursal | Filtra una sucursal o todas. |
| Desde | Fecha inicial. |
| Hasta | Fecha final. |
| Consultar | Ejecuta la busqueda. |
| XLSX | Descarga Excel. |
| PDF | Descarga PDF. |

Reglas:

- El reporte se carga al abrir la pantalla con el reporte predeterminado **Flujo de efectivo**.
- Cambiar filtros no consulta automaticamente; debe presionar **Consultar**.
- Si el reporte no tiene datos, la tabla muestra sin registros.
- Los archivos exportados incluyen titulo, fecha de generacion, filtros y cantidad de registros.

## 8. Reportes disponibles

### Ventas

| Reporte | Que muestra |
| --- | --- |
| Ventas por periodo | Ventas agrupadas con bruto, neto, costo, margen y ticket promedio. |
| Ventas por sucursal | Mismo calculo agrupado por sucursal. |
| Ventas por medicamento | Cantidad vendida, precio promedio, costo promedio, total vendido y margen. |
| Productos mas vendidos | Ranking por venta, cantidad o margen segun filtros internos. |
| Productos menos vendidos / sin movimiento | Productos con existencia y baja rotacion. |
| Detalle de venta | Lineas de venta, medicamento, cantidad, precio y total. |

Reglas de ventas:

- Solo toma ventas activas `E`.
- Solo toma detalles activos `E`.
- El costo se estima con precio de compra del medicamento.
- El margen es estimado, no utilidad neta contable.
- En reportes de ventas aparece accion **Detalle** para consultar lineas relacionadas.

[img3, reporte de ventas con detalle]

### Inventario

| Reporte | Que muestra |
| --- | --- |
| Inventario por sucursal | Existencia por sucursal, medicamento, lote, vencimiento, costo y valor. |
| Inventario consolidado | Existencia total por medicamento. |
| Medicamentos proximos a vencer | Lotes vigentes que vencen dentro del rango de dias configurado por backend. |
| Medicamentos vencidos | Lotes con existencia y fecha vencida. |
| Stock minimo | Medicamentos cuya existencia esta en o debajo del minimo. |
| Inventario / Kardex | Entradas, salidas, saldo y referencia de movimiento. |

Reglas de inventario:

- Los reportes por lote usan lotes activos con cantidad disponible.
- Medicamentos proximos a vencer usa un rango por defecto de 90 dias y maximo de 365 dias si se envia filtro tecnico `days`.
- Stock minimo muestra faltante calculado como minimo menos existencia, cuando aplica.
- Kardex se ordena por fecha de movimiento descendente.

[img4, reporte de inventario]

### Traslados

| Reporte | Que muestra |
| --- | --- |
| Traspasos | Fecha, origen, destino, items y unidades trasladadas. |

Reglas:

- Solo toma movimientos activos.
- El filtro de sucursal aplica si la sucursal fue origen o destino.
- Se basa en movimientos y detalles de inventario.

### Caja

| Reporte | Que muestra |
| --- | --- |
| Flujo de efectivo | Ingresos, egresos y neto por sucursal. |
| Cierre / diferencias de caja | Saldo inicial, esperado, contado y diferencia. |
| Movimientos detallados por caja | Movimientos por sesion, tipo, operacion, monto y referencia. |
| Conciliaciones de caja | Sistema, declarado, diferencia, metodo y notas. |
| Historial ingresos/egresos por sesion | Apertura, cierre, ingresos, egresos, esperado calculado, contado y diferencia. |

Reglas de caja:

- Flujo de efectivo toma movimientos activos.
- Ingreso se calcula con tipos de movimiento `I`.
- Egreso se calcula con tipos de movimiento `E`.
- Cierres usa sesiones cerradas.
- Reportes detallados son paginados para evitar cargas excesivas.

[img5, reporte de caja]

### Compras

| Reporte | Que muestra |
| --- | --- |
| Compras por proveedor | Ordenes, productos, unidades, subtotal, impuestos y total por proveedor. |

Reglas:

- Excluye compras canceladas.
- Puede filtrarse por sucursal, proveedor, medicamento y fechas.

### Margen

| Reporte | Que muestra |
| --- | --- |
| Margen por sucursal | Ventas netas, costo, margen estimado y porcentaje. |

Reglas:

- Usa la misma base del reporte de ventas.
- El margen es estimado porque toma costo disponible del medicamento.
- No incluye todos los gastos operativos, impuestos externos o costos administrativos.

### Activos fijos

| Reporte | Que muestra |
| --- | --- |
| Activos fijos | Cantidad de activos, costo, depreciacion y valor neto por sucursal. |
| Detalle de activos | Activo, categoria, responsable, ubicacion y valor. |

Reglas:

- Excluye activos dados de baja `D`.
- El detalle muestra valor con base en costo y depreciacion registrada.

### Nomina

| Reporte | Que muestra |
| --- | --- |
| Nomina | Pagos, salario base, bonificaciones, deducciones y total por sucursal. |

Reglas:

- Solo toma pagos activos `E`.
- Puede filtrarse por sucursal y rango de fecha de pago.

### Auditoria

| Reporte | Que muestra |
| --- | --- |
| Auditoria | Fecha, usuario, objeto, accion y registro afectado. |
| Detalle de auditoria | Valor anterior y valor nuevo del evento. |

Reglas:

- Permite filtrar por usuario, objeto, accion, registro e id de auditoria.
- La accion **Detalle** abre un modal con valores anteriores y nuevos.
- Los valores largos se recortan para evitar saturar la pantalla/exportacion.

[img6, reporte de auditoria]

## 9. Filtros adicionales

### Filtros de auditoria

| Filtro | Uso |
| --- | --- |
| Id auditoria | Busca un evento especifico. |
| Usuario | Filtra por usuario que ejecuto la accion. |
| Objeto | Tabla u objeto afectado. |
| Accion | Creacion, actualizacion o eliminacion. |
| Registro | Id del registro afectado. |
| Pagina | Pagina del resultado. |
| Limite | Cantidad por pagina, entre 1 y 200. |

### Filtros paginados

Los siguientes reportes tienen paginacion manual:

| Reporte |
| --- |
| Auditoria |
| Movimientos detallados por caja |
| Conciliaciones de caja |
| Historial ingresos/egresos por sesion |

Reglas:

- El limite maximo en backend es 200 registros por consulta.
- La pagina minima es 1.
- Use **Anterior** y **Siguiente** para navegar.

## 10. Detalle de ventas

Los reportes de ventas muestran accion **Detalle**.

[img7, modal detalle de ventas]

Al abrir detalle:

| Dato | Uso |
| --- | --- |
| Venta | Id de venta. |
| Fecha | Fecha de venta. |
| Sucursal | Donde se realizo. |
| Comprobante | Numero de comprobante si existe. |
| Cliente/NIT | Datos del recibo si existen. |
| Medicamento | Producto vendido. |
| Cantidad | Unidades vendidas. |
| Precio | Precio unitario. |
| Total | Total de linea. |

El detalle puede descargarse en PDF o XLSX desde el modal cuando corresponde.

## 11. Exportacion

Formatos disponibles:

| Formato | Uso |
| --- | --- |
| XLSX | Analisis detallado, filtros, ordenamiento y mayor volumen de datos. |
| PDF | Impresion, revision rapida o presentacion. |

Reglas de exportacion:

- El archivo usa el nombre del reporte y fecha/hora de generacion.
- Incluye filtros aplicados.
- Si el reporte no tiene datos, se exporta una fila con mensaje **Sin datos**.
- PDF muestra hasta 500 filas en reportes generales; para detalle completo use XLSX.
- Si no tiene permiso del reporte, la descarga falla.

## 12. Estados y codigos comunes

| Codigo | Significado comun |
| --- | --- |
| `E` | Activo o vigente. |
| `D` | Desactivado o dado de baja, segun el modulo. |
| `A` | Abierto, por ejemplo sesion de caja. |
| `C` | Cerrado o cancelado, segun contexto. |
| `INSERT` | Creacion en auditoria. |
| `UPDATE` | Actualizacion en auditoria. |
| `DELETE` | Eliminacion en auditoria. |

Los significados exactos dependen del reporte y del modulo origen.

## 13. Logica de negocio

- Reportes consulta datos ya registrados; no modifica informacion.
- Cada reporte exige permiso propio.
- Sucursal y fechas se aplican solo cuando el reporte tiene columnas compatibles.
- Los reportes de ventas consideran ventas y detalles activos.
- Los reportes de inventario por lote consideran lotes activos y cantidades disponibles.
- Los reportes de caja diferencian ingresos y egresos por el tipo de movimiento.
- Los reportes de margen son estimados y no representan utilidad contable completa.
- Auditoria permite revisar eventos, pero no revierte cambios.
- Exportar un reporte no altera datos del sistema.

## 14. Validaciones y limites

| Validacion o limite | Regla |
| --- | --- |
| Permiso | Debe tener permiso para el reporte solicitado. |
| Fecha desde/hasta | Se aplican como rango cuando el reporte soporta fechas. |
| Limite de filas | Los reportes paginados aceptan maximo 200 por consulta. |
| PDF general | Muestra hasta 500 filas. |
| XLSX | Recomendado para volumen mayor. |
| Auditoria detalle | Si no hay evento, no muestra detalle. |
| Reporte inexistente | Devuelve resultado vacio. |

## 15. Mensajes frecuentes

| Situacion | Mensaje o efecto |
| --- | --- |
| Sin permiso al descargar | No tienes permiso o no se pudo descargar el reporte. |
| Error al cargar | No se pudo cargar el reporte. |
| Error inesperado | Error inesperado al cargar reporte. |
| Sin detalle de ventas | No hay detalle de ventas para este registro. |
| Sin datos | La tabla aparece vacia o exporta mensaje sin datos. |

## 16. Flujo recomendado de uso

1. Seleccionar el reporte.
2. Elegir sucursal o dejar **Todas**.
3. Definir fechas si el reporte aplica.
4. Completar filtros adicionales si es auditoria o reporte paginado.
5. Presionar **Consultar**.
6. Revisar la tabla.
7. Abrir **Detalle** si el reporte lo permite.
8. Exportar en XLSX para analisis o PDF para presentacion.

## 17. Errores frecuentes y solucion

| Problema | Causa probable | Solucion |
| --- | --- | --- |
| No aparece informacion | No hay datos en el rango o filtros muy restrictivos. | Ampliar fechas o quitar filtros. |
| No permite descargar | Falta permiso para el reporte. | Revisar permisos del rol. |
| PDF incompleto | PDF limita filas para lectura. | Descargar XLSX. |
| Auditoria no muestra detalle | No se selecciono un registro valido o no existe detalle. | Revisar id de auditoria o filtros. |
| Margen no coincide con utilidad contable | El reporte usa costo de medicamento, no gastos completos. | Usarlo como margen estimado operativo. |

## 18. Alcance y limites actuales

- El modulo es de consulta y exportacion; no modifica datos.
- No todos los filtros aplican a todos los reportes.
- El margen es estimado y depende del costo disponible.
- PDF esta pensado para revision, no para exportacion masiva.
- Auditoria muestra informacion tecnica de objetos y registros.
- La seguridad se maneja por permiso individual de reporte, no solo por acceso general al menu.
