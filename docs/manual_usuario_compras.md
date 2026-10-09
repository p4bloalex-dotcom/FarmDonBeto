# Manual de usuario final: Compras

Fecha de revision: 8 de octubre de 2026.

Este manual explica el uso del modulo **Compras** para el usuario final que opera el sistema. El contenido se basa en la pantalla de compras, validaciones del backend, modelos de datos y reglas de negocio implementadas.

## 1. Objetivo del modulo

El modulo **Compras** permite gestionar el abastecimiento de medicamentos desde la deteccion de necesidad hasta la orden, aprobacion, recepcion, validacion tecnica, factura y devolucion al proveedor.

Tambien permite registrar una **compra directa**, que afecta inventario y registra el pago segun el origen seleccionado.

[img1, pantalla principal del modulo Compras]

## 2. Ubicacion en el sistema

Ruta funcional: **Operaciones > Compras**.

Ruta tecnica de pantalla: `purchase`.

Nombre de permiso/controlador: `Purchase`.

Categoria de permisos: `Operation`.

## 3. Alcance funcional

El modulo cubre estos procesos:

| Proceso | Uso |
| --- | --- |
| Necesidad | Revisar disponibilidad de inventario en la red y decidir si corresponde traslado interno o compra. |
| Orden | Crear orden de compra a proveedor desde solicitudes o de forma manual. |
| Aprobacion | Autorizar una orden antes de recibir mercaderia. |
| Recepcion | Registrar cantidades que llegaron, cantidades aceptadas, lote y vencimiento. |
| Validacion tecnica | Revisar documentacion sanitaria, lote, vencimiento, empaque y condiciones de almacenamiento. |
| Factura | Registrar y conciliar factura del proveedor contra lo recibido en buen estado. |
| Devolucion | Registrar devolucion o reclamo al proveedor. |
| Compra directa | Registrar compra con factura, detalle, inventario y pago en una sola operacion. |

## 4. Usuarios que lo utilizan

Este modulo puede ser usado por personal de compras, bodega, responsable sanitario, administracion, gerencia o usuarios autorizados de sucursal.

El acceso no depende automaticamente del puesto laboral. El acceso depende del rol, menu y permisos configurados en seguridad.

## 5. Roles, puestos y matriz de permisos

### Roles sugeridos

| Rol sugerido | Uso esperado |
| --- | --- |
| Administrador | Acceso completo al flujo de compras. |
| Encargado de compras | Crear solicitudes, ordenes, registrar facturas y devoluciones. |
| Aprobador de compras | Aprobar ordenes pendientes. |
| Bodega o recepcion | Registrar mercaderia recibida, lote y vencimiento. |
| Responsable sanitario | Ejecutar validacion tecnica de recepciones. |
| Tesoreria | Registrar o confirmar pagos cuando aplique. |
| Auditoria o gerencia | Consultar compras, estados y discrepancias. |

### Puestos relacionados

| Puesto | Relacion con el modulo |
| --- | --- |
| Encargado de sucursal | Puede detectar necesidad y solicitar abastecimiento. |
| Encargado de compras | Puede crear ordenes y dar seguimiento al proveedor. |
| Auxiliar de bodega | Puede registrar recepcion fisica. |
| Responsable tecnico o sanitario | Puede validar lote, empaque, vencimiento y documentacion. |
| Contabilidad o tesoreria | Puede revisar factura, origen de pago y discrepancias. |
| Gerencia | Puede aprobar compras o revisar indicadores. |

### Matriz de permisos

| Permiso | Accion que habilita | Uso dentro del modulo |
| --- | --- | --- |
| `Purchase.Ver` | Consultar compras, dashboard, detalle y solicitudes. | Necesario para abrir y revisar el modulo. |
| `Purchase.Crear` | Registrar compra directa. | Afecta inventario y puede registrar pago. |
| `Purchase.Editar` | Editar compras directas o borradores permitidos. | No aplica a ordenes ya aprobadas o con flujo financiero. |
| `Purchase.Eliminar` | Eliminar compra directa, borrador u orden pendiente permitida. | No elimina ordenes aprobadas, recibidas o facturadas. |
| `Purchase.Solicitar` | Crear solicitud de compra. | Usado en el paso **Necesidad**. |
| `Purchase.Ordenar` | Crear orden de compra. | Usado en el paso **Orden**. |
| `Purchase.Aprobar` | Aprobar ordenes pendientes. | Usado en el paso **Aprobacion**. |
| `Purchase.Recibir` | Registrar recepcion de mercaderia. | Usado en el paso **Recepcion**. |
| `Purchase.Validacion tecnica` | Validar tecnicamente una recepcion. | Usado antes de liberar inventario. |
| `Purchase.Facturar` | Registrar factura de proveedor. | Usado para conciliar factura contra recepcion. |
| `Purchase.Pagar` | Pagar factura de proveedor. | Disponible como permiso del backend; en pantalla actual la compra directa registra origen de pago. |
| `Purchase.Devolver` | Registrar devolucion a proveedor. | Usado en el paso **Devolucion**. |

Si el usuario no tiene el permiso requerido, el sistema bloquea la accion.

## 6. Dependencias con otros modulos

### Dependencias obligatorias

| Modulo o catalogo | Dependencia |
| --- | --- |
| Seguridad | Controla acceso por rol, menu y permisos. |
| Sucursales | Toda compra, solicitud u orden se relaciona con una sucursal. |
| Medicamentos | Los productos comprados deben existir y estar activos. |
| Proveedores | Toda compra u orden requiere proveedor activo. |
| Medicamentos por proveedor | Filtra medicamentos disponibles al crear ordenes por proveedor. |
| Inventario | Las compras directas, recepciones validadas y devoluciones afectan existencias. |

### Dependencias funcionales

| Modulo | Relacion |
| --- | --- |
| Traslados entre sucursales | En necesidad, si otra sucursal tiene stock transferible, se genera solicitud de traslado en vez de compra externa. |
| Caja del dia | Si el origen de pago es caja de turno, debe existir una sesion abierta y valida. |
| Caja y bancos | Si el origen de pago es banco o fondo, requiere cuenta financiera activa. |
| Auditoria | Las acciones pueden quedar registradas segun la configuracion general del sistema. |

### Catalogos y mantenimientos relacionados

| Catalogo/mantenimiento | Uso |
| --- | --- |
| Empresa | Estructura general donde existen las sucursales. |
| Sucursales | Define matriz y sucursales solicitantes. |
| Medicamentos | Producto, codigo, precio de compra y estado. |
| Proveedores | Datos del proveedor. |
| Medicamentos por proveedor | Relaciona proveedor con medicamentos que puede abastecer. |
| Unidades de medida | Soporte del medicamento y cantidades. |
| Cajas, tipos de movimiento de caja y cuentas financieras | Soporte para pagos y movimientos de dinero. |

## 7. Pantalla principal

La pantalla principal esta dividida en dos zonas:

| Zona | Descripcion |
| --- | --- |
| Flujo de compra | Permite operar los pasos: necesidad, orden, aprobacion, recepcion, validacion tecnica, factura y devolucion. |
| Ordenes y compras registradas | Permite buscar, consultar, editar, aprobar o eliminar registros permitidos. |

[img2, pantalla de flujo de compras]

Indicadores superiores:

| Indicador | Uso |
| --- | --- |
| Aprobar | Cantidad de ordenes pendientes de aprobacion. |
| Recibir | Ordenes con recepcion pendiente o parcial. |
| Discrepancias | Ordenes con diferencias entre factura y mercaderia aceptada. |
| Cuarentena | Recepciones o lotes pendientes de decision tecnica. |

## 8. Flujo completo de compras

### Paso 1: Necesidad

Este paso permite revisar si una sucursal necesita un medicamento y si puede abastecerse desde otra sucursal o si debe solicitar compra externa.

[img3, paso Necesidad en Compras]

Campos principales:

| Campo | Regla |
| --- | --- |
| Medicamento | Debe seleccionar un medicamento activo. |
| Sucursal que necesita | Debe seleccionar la sucursal solicitante. |
| Cantidad necesaria | Debe ser mayor a 0. |
| Motivo | Describe la razon de la solicitud. |

Acciones posibles:

| Accion | Resultado |
| --- | --- |
| Revisar disponibilidad | Consulta inventario de red. |
| Agregar a solicitud de traspaso | Si hay stock interno disponible, prepara solicitud de traslado. |
| Agregar a solicitud de compra | Si falta stock externo, prepara solicitud de compra hacia matriz. |
| Crear orden de compra | Si corresponde y existe matriz activa, pasa a crear orden. |

Reglas:

- Debe seleccionar medicamento, sucursal y cantidad para revisar la red.
- Si hay disponibilidad interna, el sistema sugiere traslado entre sucursales.
- Si no hay disponibilidad interna suficiente, se solicita compra externa.
- Una solicitud a matriz debe contener medicamentos de una misma sucursal.
- Si el usuario pertenece a una sucursal no matriz, solo puede solicitar abastecimiento para su propia sucursal.

### Paso 2: Orden

Este paso crea la orden de compra a proveedor.

[img4, paso Orden en Compras]

Formas de crear orden:

| Forma | Descripcion |
| --- | --- |
| Desde solicitudes pendientes | Consolida solicitudes de compra generadas por sucursales. |
| Manual | Permite agregar medicamentos directamente a la orden. |

Campos principales:

| Campo | Regla |
| --- | --- |
| Sucursal destino | La orden debe registrarse para la sucursal matriz. |
| Proveedor | Debe existir y estar activo. |
| Medicamento | Debe estar activo y relacionado con el proveedor. |
| Cantidad | Debe ser mayor a 0. |
| Precio unitario de compra | No puede ser negativo. |

Reglas:

- La orden requiere proveedor, destino y al menos un producto.
- Solo la sucursal matriz puede crear ordenes de compra a proveedor.
- Las sucursales no matriz deben crear solicitudes de abastecimiento.
- Si el proveedor no tiene medicamentos relacionados, debe configurarse en **Catalogos > Medicamentos por proveedor**.
- Crear una orden no afecta inventario.
- La orden queda pendiente de aprobacion.

### Paso 3: Aprobacion

Este paso autoriza una orden antes de recibir mercaderia.

[img5, paso Aprobacion en Compras]

Reglas:

- Solo se pueden aprobar ordenes con estado **Pendiente de aprobacion**.
- Solo la sucursal matriz puede aprobar ordenes.
- Al aprobar, la orden queda disponible para recepcion.
- La aprobacion no ingresa mercaderia al inventario.

### Paso 4: Recepcion

Este paso registra la llegada fisica de productos.

[img6, paso Recepcion en Compras]

Campos principales:

| Campo | Regla |
| --- | --- |
| Orden de compra | Debe estar aprobada o parcialmente recibida. |
| Linea de orden | Producto pendiente de recibir. |
| Cantidad que llego | Debe ser mayor a 0. |
| Cantidad en buen estado | No puede ser negativa ni mayor a lo que llego. |
| Lote | Obligatorio para recibir. |
| Vencimiento | Obligatorio para recibir. |

Reglas:

- La cantidad que llego no puede superar lo pendiente por recibir.
- La cantidad en buen estado no puede superar la cantidad que llego.
- La cantidad no aceptada se calcula como: cantidad que llego menos cantidad en buen estado.
- La recepcion registra lotes en espera de validacion tecnica.
- La recepcion por si sola no libera completamente el producto para inventario vendible; requiere validacion tecnica.

### Paso 5: Validacion tecnica

Este paso valida sanitariamente la recepcion antes de liberar stock.

[img7, paso Validacion tecnica en Compras]

Checklist sanitario:

| Verificacion | Uso |
| --- | --- |
| Registro sanitario/documentacion verificados | Confirma documentacion del producto. |
| Lote coincide con factura/guia | Confirma trazabilidad documental. |
| Vencimiento valido | Evita ingresar producto vencido o no apto. |
| Empaque y sello integros | Verifica integridad fisica. |
| Almacenamiento/cadena de frio conforme | Verifica condiciones de conservacion. |

Decisiones sanitarias:

| Decision | Resultado esperado |
| --- | --- |
| Aprobar y liberar | Lotes aceptados ingresan al inventario. |
| Mantener en cuarentena | El producto queda retenido para decision posterior. |
| Inmovilizar | El producto queda bloqueado. |
| Rechazar / reclamo proveedor | El producto no se libera y puede generar reclamo/devolucion. |

Reglas:

- Para aprobar, debe completar todo el checklist sanitario.
- Si la decision no es aprobar, debe indicar observaciones tecnicas.
- Las observaciones tecnicas no deben exceder el limite permitido por el sistema.
- Al aprobar, los lotes aceptados ingresan al inventario.

### Paso 6: Factura

Este paso registra la factura del proveedor y la compara contra lo recibido en buen estado.

[img8, paso Factura en Compras]

Campos principales:

| Campo | Regla |
| --- | --- |
| Orden de compra | Debe tener mercaderia recibida. |
| Proveedor | Debe coincidir con el proveedor de la orden. |
| Numero de factura | Obligatorio. |
| Total factura | Debe ser mayor a 0. |

Reglas:

- Solo puede facturarse una orden con estado **Recepcion parcial**, **Recibida** o **Con discrepancia**.
- Primero debe existir recepcion de mercaderia.
- El proveedor de la factura debe coincidir con el proveedor de la orden.
- El sistema calcula el total pagable con base en la cantidad recibida en buen estado.
- Si el total de factura coincide con lo pagable, la factura queda conciliada.
- Si el total de factura es mayor o menor, la orden puede quedar con discrepancia.

Mensajes de conciliacion:

| Caso | Mensaje funcional |
| --- | --- |
| Factura coincide | Factura coincide con lo recibido en buen estado. |
| Factura mayor | Solicitar correccion o nota de credito. |
| Factura menor | Revisar descuentos, faltante de factura o bonificaciones. |

### Paso 7: Devolucion

Este paso registra devoluciones o reclamos al proveedor.

[img9, paso Devolucion en Compras]

Tipos de devolucion:

| Tipo | Uso |
| --- | --- |
| Producto en buen estado que entro a inventario | Descuenta inventario al devolver. |
| Producto no aceptado al recibir | Registra reclamo/documentacion contra proveedor. |

Campos principales:

| Campo | Regla |
| --- | --- |
| Orden de compra | Debe estar recibida, facturada, con discrepancia o pagada. |
| Producto | Debe pertenecer a la compra. |
| Cantidad a devolver | Debe ser mayor a 0 y no superar lo disponible para devolver. |
| Motivo | Obligatorio. |
| Lote | Se usa cuando aplica. |

Reglas:

- El proveedor de la devolucion debe coincidir con el proveedor de la compra.
- No se puede devolver si la compra no esta en estado permitido.
- La cantidad no puede superar el maximo permitido segun el tipo seleccionado.
- Si se devuelve producto en buen estado, se afecta inventario.
- Si se devuelve producto no aceptado, queda como reclamo/documentacion.

## 9. Compra directa

La compra directa se abre desde el boton **Compra directa** en la seccion **Ordenes y compras registradas**.

[img10, formulario de compra directa]

Campos del encabezado:

| Campo | Requerido | Regla |
| --- | --- | --- |
| Proveedor | Si | Debe existir y estar activo. |
| Sucursal | Si | Para compra nueva, se filtra a sucursal matriz. |
| Numero de factura | Si | No puede repetirse para el mismo proveedor. Maximo 50 caracteres. |
| Fecha de compra | Si | No puede estar en el futuro. |
| Impuesto (%) | Si | Debe estar entre 0 y 100. |
| Origen de pago | Si | Caja de turno, banco o fondo efectivo. |
| Cuenta/Fondo | Condicional | Obligatorio si el origen no es caja de turno. |
| Sesion de caja especifica | No | Solo aplica si origen es caja de turno. |

Campos del detalle:

| Campo | Requerido | Regla |
| --- | --- | --- |
| Medicamento | Si | Debe existir, estar activo y estar relacionado con el proveedor. |
| Cantidad | Si | Debe ser mayor o igual a 0.001. |
| Precio unitario | Si | No puede ser negativo. |
| Lote | Condicional | Si ingresa lote, debe ingresar vencimiento. |
| Vencimiento | Condicional | Si ingresa vencimiento, debe ingresar lote. |

Reglas de compra directa:

- Debe tener al menos un medicamento.
- Al guardar, aumenta inventario automaticamente.
- Si el origen de pago es caja de turno, debe existir una sesion de caja abierta y valida.
- Si se usa caja de turno, la fecha de compra debe estar entre la apertura de caja y el momento actual.
- Si no existe tipo de movimiento de caja para pago a proveedor, no se puede registrar movimiento de caja.
- Si el origen es banco o fondo efectivo, debe seleccionar cuenta financiera activa.

Mensaje esperado al guardar correctamente: **Compra registrada correctamente. El inventario fue actualizado.**

## 10. Consulta, edicion y eliminacion

En **Ordenes y compras registradas** se muestran fecha, proveedor, factura, items, total y estado.

[img11, tabla de ordenes y compras registradas]

Acciones visibles:

| Accion | Regla |
| --- | --- |
| Ver detalle | Disponible para revisar informacion, totales, pagable, no aceptado y factura. |
| Editar borrador | Disponible solo para compras directas o borradores permitidos. |
| Aprobar orden | Disponible si la orden esta pendiente de aprobacion. |
| Eliminar borrador | Disponible solo para estados permitidos. |

Reglas de edicion:

- No se puede editar una compra anulada.
- Solo se pueden editar compras directas o borradores.
- Una orden aprobada debe continuar con recepcion, factura o devolucion.
- Si la compra ya fue registrada en caja o flujo financiero, no se puede modificar.
- Al editar, la sucursal queda bloqueada en pantalla.

Reglas de eliminacion:

- Se puede eliminar una compra directa, borrador u orden pendiente de aprobacion si no tiene movimiento financiero.
- No se puede eliminar una orden aprobada, recibida o facturada.
- Si es borrador o pendiente de aprobacion, se elimina sin afectar inventario.
- Si es compra directa permitida, se revierte el inventario.
- Si corresponde producto ya recibido, debe usarse devolucion a proveedor.

## 11. Estados del flujo

### Estados de compra u orden

| Estado | Significado | Regla principal |
| --- | --- | --- |
| `E` | Registrada | Compra directa registrada. |
| `I` | Anulada | No puede editarse. |
| `DRAFT` | Borrador | Puede editarse o eliminarse si no tiene efectos financieros. |
| `PENDING_APPROVAL` | Pendiente de aprobacion | Espera autorizacion. |
| `APPROVED` | Aprobada | Puede recibirse. |
| `PARTIALLY_RECEIVED` | Recepcion parcial | Aun tiene cantidades pendientes. |
| `RECEIVED` | Recibida | Mercaderia recibida. |
| `INVOICED` | Facturada | Factura registrada y conciliada. |
| `DISCREPANCY` | Con discrepancia | Hay diferencia entre factura y lo pagable. |
| `PAID` | Pagada | Estado usado por reglas de devolucion/pago cuando aplica. |

### Estados de solicitud de compra

| Estado | Significado |
| --- | --- |
| `DRAFT` | Borrador. |
| `SUBMITTED` | Pendiente. |
| `PENDING` | Pendiente. |
| `ORDERED` | Orden generada. |
| `FULFILLMENT_REQUESTED` | Traslado generado. |
| `CANCELLED` | Cancelada. |

### Estados sanitarios o tecnicos

| Estado/decision | Significado |
| --- | --- |
| `APPROVED` | Aprobado y liberado. |
| `QUARANTINE` | En cuarentena. |
| `IMMOBILIZED` | Inmovilizado. |
| `REJECTED` | Rechazado o sujeto a reclamo. |
| `AVAILABLE` | Calidad inicial disponible en recepcion. |

### Estados de factura

| Estado | Significado |
| --- | --- |
| `REGISTERED` | Factura registrada. |
| `MATCHED` | Factura conciliada con lo recibido en buen estado. |
| `DISCREPANCY` | Factura con diferencia contra lo pagable. |
| `PAID` | Factura pagada cuando el flujo de pago se ejecuta. |

## 12. Reglas de negocio principales

- La sucursal matriz concentra las compras a proveedor.
- Las sucursales no matriz deben solicitar abastecimiento; si hay stock interno, se genera traslado.
- La orden de compra no afecta inventario hasta que exista recepcion y validacion tecnica.
- La recepcion registra lo que llego y separa lo aceptado de lo no aceptado.
- La validacion tecnica libera o bloquea el producto segun checklist y decision sanitaria.
- La factura se compara contra lo recibido en buen estado, no contra todo lo ordenado.
- Una diferencia entre factura y pagable genera discrepancia.
- La devolucion de producto en buen estado afecta inventario.
- La devolucion de producto no aceptado funciona como reclamo/documentacion.
- La compra directa afecta inventario inmediatamente y puede registrar pago.
- No se editan ni eliminan compras con efectos financieros.
- No se elimina una orden aprobada, recibida o facturada; se debe continuar el flujo o registrar devolucion.

## 13. Validaciones generales

| Validacion | Mensaje o efecto |
| --- | --- |
| Proveedor inexistente o desactivado | No permite guardar. |
| Sucursal inexistente o desactivada | No permite guardar. |
| Compra para sucursal no matriz cuando se exige matriz | No permite registrar. |
| Fecha de compra futura | No permite guardar. |
| Factura duplicada por proveedor | No permite guardar. |
| Medicamento inexistente o desactivado | No permite guardar. |
| Orden sin productos | No permite guardar. |
| Cantidad menor o igual a 0 | No permite guardar. |
| Precio negativo | No permite guardar. |
| Lote sin vencimiento o vencimiento sin lote | No permite guardar. |
| Recepcion mayor a pendiente | No permite recibir. |
| Cantidad en buen estado mayor a recibida | No permite recibir. |
| Validacion tecnica aprobada sin checklist completo | No permite aprobar. |
| Factura sin orden, proveedor o numero | No permite registrar. |
| Total de factura menor o igual a 0 | No permite registrar. |
| Devolucion sin proveedor, compra, producto, cantidad o motivo | No permite registrar. |
| Devolucion mayor a lo disponible | No permite registrar. |

## 14. Mensajes frecuentes

| Situacion | Mensaje |
| --- | --- |
| Proveedor invalido | El proveedor seleccionado no existe o esta desactivado. |
| Sucursal invalida | La sucursal seleccionada no existe o esta desactivada. |
| Compra en sucursal no matriz | Solo la sucursal matriz puede registrar compras. Las demas sucursales reciben stock por traspasos. |
| Fecha futura | La fecha de la compra no puede estar en el futuro. |
| Factura repetida | El numero de factura ya fue registrado para este proveedor. |
| Sin caja abierta | Debe existir una sesion de caja abierta y valida para registrar el pago a proveedor. |
| Orden sin productos | La orden requiere al menos un producto. |
| Orden sin aprobacion | Solo se pueden aprobar ordenes pendientes de aprobacion. |
| Recepcion en estado incorrecto | La orden debe estar aprobada o parcialmente recibida. |
| Factura antes de recibir | Primero debe recibir mercaderia. |
| Devolucion en estado incorrecto | Debe estar recibida, facturada o con discrepancia. |

## 15. Flujo recomendado de operacion

1. Revisar necesidad desde el paso **Necesidad**.
2. Si hay stock interno, generar solicitud de traslado.
3. Si falta stock externo, crear solicitud de compra o pasar a orden.
4. Crear orden para sucursal matriz y proveedor correcto.
5. Aprobar la orden.
6. Recibir mercaderia con lote, vencimiento y cantidades reales.
7. Ejecutar validacion tecnica antes de liberar inventario.
8. Registrar factura y revisar discrepancias.
9. Registrar devolucion si hay producto no aceptado o reclamo al proveedor.
10. Consultar detalle para revisar totales, pagable, no aceptado y factura.

## 16. Errores frecuentes y solucion

| Problema | Causa probable | Solucion |
| --- | --- | --- |
| No aparecen medicamentos al seleccionar proveedor | No existe relacion proveedor-medicamento. | Registrar en **Catalogos > Medicamentos por proveedor**. |
| No deja crear orden | Falta proveedor, sucursal matriz o productos. | Completar datos y agregar al menos una linea. |
| No deja aprobar | La orden no esta pendiente de aprobacion o el usuario no es matriz/global. | Revisar estado, sucursal y permisos. |
| No deja recibir | La orden no esta aprobada o ya no tiene pendiente. | Seleccionar una orden aprobada o parcialmente recibida. |
| No deja aprobar validacion tecnica | Checklist incompleto. | Marcar todas las verificaciones o cambiar decision e ingresar observacion. |
| La factura queda con discrepancia | Total factura no coincide con lo recibido en buen estado. | Revisar cantidades, descuentos, notas de credito o correccion del proveedor. |
| No deja eliminar compra | Ya tiene flujo financiero o estado no permitido. | Usar devolucion o continuar el flujo. |
| No deja registrar compra directa con caja | No hay sesion de caja abierta valida. | Abrir caja o seleccionar otro origen de pago permitido. |

## 17. Alcance y limites actuales

- La pantalla prioriza el flujo operativo de compra y recepcion; no reemplaza una contabilidad completa.
- La compra directa afecta inventario inmediatamente.
- La orden normal no afecta inventario hasta recepcion y validacion tecnica.
- La relacion proveedor-medicamento es necesaria para filtrar productos por proveedor.
- El responsable sanitario debe completar checklist para liberar producto.
- El pago de factura existe como permiso y endpoint, pero la pantalla actual se enfoca en registro/conciliacion de factura y pago en compra directa.
- Las sucursales no matriz no compran directamente a proveedor dentro del flujo normal; solicitan abastecimiento.
