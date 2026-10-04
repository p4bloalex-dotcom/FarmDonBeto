# Manual de usuario del modulo de compras y traslados

Este manual explica como usar los modulos de `Compras` y `Traslados entre sucursales`. Esta dirigido a usuarios finales de sucursales y de sucursal matriz.

El modulo de compras controla el abastecimiento desde que una sucursal detecta una necesidad hasta que la matriz compra, aprueba, recibe, factura y, si corresponde, registra devoluciones. Tambien se relaciona con traslados, porque antes de comprar al proveedor el sistema permite revisar si otra sucursal puede abastecer internamente y, cuando matriz recibe una compra consolidada, puede generar automaticamente las solicitudes para repartir el producto a las sucursales solicitantes.

Flujo general:

```text
Necesidad > Solicitud de traslado o compra a matriz > Orden > Aprobacion > Recepcion > Traslado a sucursales > Factura > Devolucion opcional
```

## Antes de empezar

Antes de operar el modulo, confirme lo siguiente:

- Tiene permisos para la accion que necesita realizar.
- Su usuario pertenece a la sucursal correcta.
- Los medicamentos estan activos en catalogo.
- Los proveedores estan activos.
- Los medicamentos tienen relacion con proveedor cuando se va a crear una orden.
- Si va a registrar una compra directa con pago desde caja, existe una caja abierta.

Si el sistema no permite continuar, lea el mensaje mostrado. El mensaje indica el motivo, por ejemplo: proveedor desactivado, orden sin aprobar, cantidad mayor a la disponible o factura antes de recibir mercaderia.

## 1. Conceptos principales

| Concepto | Significado |
| --- | --- |
| Sucursal no matriz | Sucursal que puede solicitar abastecimiento, pero no compra directamente al proveedor si la regla del sistema lo restringe. |
| Sucursal matriz | Sucursal central que revisa solicitudes, crea ordenes de compra y aprueba compras. |
| Necesidad | Producto que una sucursal necesita reponer. |
| Solicitud de traslado | Pedido para mover producto desde una sucursal con stock hacia otra sucursal que lo necesita. |
| Movimiento de traslado | Movimiento final que descuenta inventario de la sucursal origen y suma inventario en la sucursal destino. |
| Solicitud de compra a matriz | Pedido enviado a matriz cuando no hay stock suficiente para traslado interno. |
| Orden de compra | Documento usado por matriz para comprar al proveedor. |
| Recepcion | Registro de lo que llego fisicamente del proveedor. |
| Reparto automatico | Solicitudes de traslado que el sistema crea desde matriz hacia las sucursales que originaron la compra. |
| Factura | Documento del proveedor que se compara contra lo recibido en buen estado. |
| Devolucion | Registro de producto devuelto o reclamado al proveedor. |

## 2. Que puede hacer cada tipo de usuario

### 2.1 Usuario de sucursal no matriz

Puede:

- Registrar una necesidad de abastecimiento.
- Revisar si otra sucursal tiene stock disponible.
- Solicitar traslado interno si hay stock transferible.
- Solicitar compra a matriz si no hay stock suficiente.
- Consultar informacion que corresponda a su sucursal, segun permisos.

No debe:

- Crear ordenes de compra a proveedor si no pertenece a matriz.
- Aprobar ordenes de compra.
- Solicitar abastecimiento para otra sucursal distinta a la suya.

### 2.2 Usuario de sucursal matriz

Puede:

- Ver solicitudes de compra pendientes de sucursales.
- Consolidar solicitudes de varias sucursales.
- Crear ordenes de compra a proveedor.
- Aprobar ordenes.
- Recibir mercaderia.
- Registrar facturas.
- Registrar devoluciones.
- Consultar traslados y solicitudes segun permisos.

## 3. Pantalla principal de compras

Al entrar a `Compras`, la pantalla se organiza por fases.

| Elemento | Uso |
| --- | --- |
| Fases | Permiten moverse por Necesidad, Orden, Aprobacion, Recepcion, Factura y Devolucion. |
| Area principal | Muestra solo el formulario de la fase activa. |
| Contexto | Aparece solo cuando hay informacion relevante, como una orden seleccionada, resultado de disponibilidad o validacion. |
| Indicadores superiores | Accesos rapidos a aprobaciones, recepciones parciales, discrepancias y cuarentena. |
| Ordenes y compras registradas | Seccion desplegable para consultar historial y acciones de tabla. |
| Compra directa | Accion secundaria para registrar una compra directa si el usuario tiene permiso. |

[agregar img: pantalla principal de compras]

## 4. Fases del modulo de compras

| Fase | Nombre | Para que sirve |
| --- | --- | --- |
| 1 | Necesidad | Revisar stock interno y solicitar traslado o compra a matriz. |
| 2 | Orden | Crear ordenes de compra, manuales o consolidadas desde solicitudes. |
| 3 | Aprobacion | Revisar y autorizar una orden antes de recibir. |
| 4 | Recepcion | Registrar mercaderia recibida total o parcialmente. |
| 5 | Factura | Registrar factura y validar diferencia contra lo recibido. El reparto a sucursales se genera al completar la recepcion de una compra consolidada. |
| 6 | Devolucion | Registrar devolucion o reclamo al proveedor cuando aplique. |

Reglas importantes:

- No se puede recibir mercaderia si la orden no esta aprobada.
- No se debe facturar una orden sin mercaderia recibida.
- La factura debe compararse contra lo recibido en buen estado.
- La devolucion es opcional y solo aplica si hay producto recibido o rechazado.
- Si una fase aparece bloqueada, revise que exista una orden en el estado correcto.
- En compras consolidadas, la mercaderia entra primero a matriz y luego se reparte mediante solicitudes de traslado.

## 5. Flujo para sucursal no matriz

Este flujo aplica cuando una sucursal necesita producto, pero la compra externa la gestiona matriz.

### 5.1 Crear necesidad

1. Entre a `Compras`.
2. Seleccione la fase `Necesidad`.
3. Busque el medicamento por nombre o codigo.
4. Seleccione el medicamento.
5. Seleccione la sucursal que necesita el producto.
6. Ingrese la cantidad necesaria.
7. Presione `Revisar disponibilidad`.

[agregar img: fase necesidad]

### 5.2 Resultado de disponibilidad

El sistema puede mostrar tres escenarios.

| Escenario | Que significa | Accion |
| --- | --- | --- |
| Hay traslado interno disponible | Otra sucursal tiene stock transferible. | Solicitar traslado. |
| No hay stock interno suficiente | Ninguna sucursal puede cubrir la necesidad. | Solicitar compra a matriz. |
| Hay disponibilidad parcial | Una parte puede cubrirse por traslado y otra requiere compra. | Solicitar traslado por una parte y compra a matriz por el faltante. |

### 5.3 Solicitar traslado interno

Si el sistema muestra sucursales con stock disponible:

1. Revise la sucursal origen sugerida.
2. Revise la cantidad sugerida.
3. Presione `Agregar a solicitud de traspaso`.
4. Verifique la lista de productos agregados.
5. Presione `Registrar solicitud`.

Al registrar:

- Se crea una solicitud de traslado interno.
- No se modifica inventario todavia.
- El traslado se continua en el modulo `Traslados entre sucursales`.

### 5.4 Solicitar compra a matriz

Si el sistema indica que falta stock para compra:

1. Presione `Solicitar compra a matriz`.
2. El sistema registra una solicitud de compra pendiente.
3. Matriz podra verla en la fase `Orden`.

Notas:

- La solicitud queda asociada a la sucursal que necesita el producto.
- Una sucursal no matriz solo puede solicitar para su propia sucursal.
- La solicitud no crea inventario ni orden de compra por si sola.

[agregar img: solicitud de compra a matriz]

## 6. Traslados entre sucursales

El traslado entre sucursales inicia como una solicitud. El inventario no cambia al crear la solicitud; cambia hasta que la entrega se confirma.

Principio y final del flujo:

```text
Solicitud pendiente > Aceptada > Enviada > Entregada > Inventario actualizado
```

Compras puede originar la solicitud cuando detecta que otra sucursal puede abastecer. Tambien puede originar solicitudes de traslado automaticamente cuando matriz recibe una compra que fue creada desde solicitudes de sucursales. El seguimiento se realiza en la pantalla de traslados o solicitudes de entrega, segun el menu disponible para su rol.

### 6.1 Estados del traslado

| Estado | Significado | Siguiente accion |
| --- | --- | --- |
| Pendiente | La solicitud fue creada y espera revision. | Aceptar o rechazar. |
| Aceptada | La sucursal abastecedora acepto preparar el traslado. | Enviar. |
| Enviada | El producto esta en proceso de entrega. | Marcar como entregada. |
| Entregada | El traslado fue completado y se aplica movimiento de inventario. | Consulta. |
| Rechazada | La solicitud fue rechazada. | Consulta. |
| Cancelada | La solicitud fue cancelada. | Consulta. |

### 6.2 Como operar una solicitud de traslado

1. Entre a `Traslados entre sucursales` o `Solicitudes de entrega`.
2. Revise la solicitud pendiente.
3. Valide sucursal solicitante, sucursal que entrega y productos.
4. Si procede, cambie el estado a `Aceptada`.
5. Cuando el producto salga, cambie el estado a `Enviada`.
6. Cuando se confirme la entrega, cambie el estado a `Entregada`.

Al marcar como `Entregada`:

- El sistema genera el movimiento de inventario.
- Disminuye stock en la sucursal que entrega.
- Aumenta stock en la sucursal solicitante.

[agregar img: pantalla de traslados entre sucursales]

Notas:

- Una sucursal no matriz ve solicitudes donde participa como solicitante o abastecedora, segun permisos.
- Matriz o usuarios con permiso global pueden ver mas solicitudes.
- Si el producto ya no tiene stock suficiente al entregar, el sistema puede impedir completar el traslado.
- Si el traslado se completa correctamente, no debe registrarse una compra por esa misma necesidad.

### 6.3 Consulta de movimientos de stock

La pantalla de movimientos de stock muestra traslados ya aplicados al inventario.

Use esta consulta para revisar:

- Fecha aplicada.
- Sucursal origen.
- Sucursal destino.
- Cantidad de productos.
- Estado del movimiento.
- Detalle de medicamentos trasladados.

Importante: un movimiento aplicado ya afecto inventario. Si necesita corregirlo, consulte con un usuario autorizado antes de realizar una anulacion o ajuste.

### 6.4 Reparto automatico despues de recibir una compra

Cuando matriz crea una orden desde solicitudes de compra de sucursales, la compra externa llega primero a matriz. Al completar la recepcion de esa orden, el sistema crea automaticamente solicitudes de traslado desde matriz hacia cada sucursal solicitante.

Ejemplo:

| Sucursal solicitante | Medicamento | Cantidad solicitada |
| --- | --- | --- |
| Sucursal A | Amoxicilina | 10 |
| Sucursal B | Amoxicilina | 15 |

Si matriz recibe 25 unidades en buen estado, el sistema genera:

| Solicitud de traslado | Origen | Destino | Cantidad |
| --- | --- | --- | --- |
| Traslado 1 | Matriz | Sucursal A | 10 |
| Traslado 2 | Matriz | Sucursal B | 15 |

Importante:

- El reparto automatico crea solicitudes de traslado, no aplica inventario en las sucursales de inmediato.
- El inventario de matriz ya aumento al recibir la compra.
- El inventario de cada sucursal aumenta hasta que su solicitud de traslado se marque como `Entregada`.
- Si se recibio menos producto en buen estado que lo solicitado, el sistema reparte hasta donde alcance la cantidad aceptada.
- Las solicitudes usadas cambian a estado `Traslado generado` para indicar que ya tienen seguimiento por traslado.

## 7. Flujo para sucursal matriz: consolidar solicitudes

La matriz revisa solicitudes de compra pendientes y puede consolidarlas en una sola orden.

### 7.1 Ver solicitudes pendientes

1. Entre a `Compras`.
2. Seleccione la fase `Orden`.
3. Si existen solicitudes pendientes, vera la seccion `Solicitudes pendientes de compra`.
4. Presione `Ver` para desplegarlas.

[agregar img: solicitudes pendientes de compra]

Cada solicitud muestra:

- Sucursal solicitante.
- Medicamento.
- Cantidad requerida.
- Numero de solicitud.

### 7.2 Consolidar solicitudes por proveedor

1. Seleccione el proveedor.
2. El sistema muestra solicitudes compatibles con ese proveedor.
3. Seleccione una o varias solicitudes.
4. Presione `Consolidar`.
5. El sistema agrupa automaticamente las solicitudes por medicamento.

Ejemplo:

| Sucursal | Medicamento | Cantidad |
| --- | --- | --- |
| Sucursal A | Amoxicilina | 10 |
| Sucursal B | Amoxicilina | 15 |

Resultado en la orden:

| Medicamento | Cantidad ordenada |
| --- | --- |
| Amoxicilina | 25 |

La linea consolidada muestra el origen de la necesidad, por ejemplo:

```text
Sucursal A: 10, Sucursal B: 15
```

Notas:

- No se mezclan proveedores.
- La consolidacion se hace por medicamento dentro del proveedor seleccionado.
- La orden queda dirigida a la sucursal matriz.
- Al crear la orden, las solicitudes usadas pasan a estado `Orden generada`.

## 8. Crear orden de compra

La orden de compra puede crearse manualmente o desde solicitudes consolidadas.

Una orden tiene inicio y final dentro del flujo normal:

```text
Orden pendiente de aprobacion > Aprobada > Recibida parcial o total > Solicitudes de traslado generadas > Facturada o con discrepancia
```

### 8.1 Crear orden manual

1. Seleccione la fase `Orden`.
2. Seleccione sucursal destino.
3. Seleccione proveedor.
4. Busque y seleccione medicamento del proveedor.
5. Ingrese cantidad.
6. Revise o ingrese precio unitario de compra.
7. Presione `Agregar medicamento`.
8. Repita si necesita mas productos.
9. Presione `Crear orden completa`.

### 8.2 Crear orden consolidada

1. Seleccione proveedor.
2. Abra `Solicitudes pendientes de compra`.
3. Seleccione solicitudes compatibles.
4. Presione `Consolidar`.
5. Revise cantidades y precios.
6. Presione `Crear orden completa`.

Al crear la orden:

- La orden queda en estado `Pendiente de aprobacion`.
- No afecta inventario.
- No registra factura.
- Se habilita la fase `Aprobacion`.

El sistema no permite crear la orden si:

- El proveedor no existe o esta desactivado.
- La sucursal destino no corresponde a matriz.
- Falta medicamento en alguna linea.
- La cantidad es cero o negativa.
- El precio es negativo.
- El medicamento no existe o esta desactivado.

[agregar img: orden consolidada]

## 9. Aprobar orden

La aprobacion confirma que la compra fue revisada y autorizada.

Para aprobar:

1. Seleccione la fase `Aprobacion`.
2. Seleccione una orden pendiente.
3. Revise proveedor, sucursal, total, items y cantidades.
4. Presione `Aprobar orden`.

Al aprobar:

- La orden pasa a estado `Aprobada`.
- Se habilita la recepcion.
- El inventario aun no cambia.

Notas:

- Solo se aprueban ordenes en estado `Pendiente de aprobacion`.
- Solo matriz o usuarios autorizados pueden aprobar.

[agregar img: aprobacion de orden]

## 10. Recibir mercaderia

La recepcion registra lo que llego fisicamente del proveedor. Puede ser total o parcial.

Para recibir:

1. Seleccione la fase `Recepcion`.
2. Seleccione la orden aprobada.
3. Seleccione la linea que va a recibir.
4. Ingrese `Cantidad que llego`.
5. Ingrese `Cantidad en buen estado`.
6. Ingrese lote.
7. Ingrese vencimiento.
8. Revise la cantidad `No aceptada`.
9. Presione `Recepcion`.

El sistema mantiene la fase de recepcion si quedan lineas pendientes. Solo cuando todas las lineas estan completas se puede continuar hacia factura.

Si la orden fue creada desde solicitudes de sucursales, al completar la recepcion el sistema genera automaticamente las solicitudes de traslado para repartir el producto desde matriz.

[agregar img: recepcion de mercaderia]

### 10.1 Recepcion parcial

Use recepcion parcial cuando el proveedor no entrega todo.

Ejemplo:

| Ordenado | Llego | Buen estado | Pendiente |
| --- | --- | --- | --- |
| 20 | 8 | 8 | 12 |

Resultado:

- La orden queda como `Recepcion parcial`.
- El inventario aumenta solo por la cantidad en buen estado.
- Puede continuar recibiendo el resto despues.
- El reparto automatico a sucursales se genera cuando la orden queda completamente recibida.

### 10.2 Producto no aceptado

Si parte del producto llega danado, vencido o incorrecto:

| Cantidad que llego | Cantidad en buen estado | No aceptada |
| --- | --- | --- |
| 10 | 8 | 2 |

Resultado:

- Solo 8 entran al inventario.
- 2 quedan como producto no aceptado para reclamo o devolucion.
- Para reparto a sucursales, el sistema usa solo la cantidad en buen estado.

Reglas:

- La cantidad que llego no puede superar lo pendiente.
- La cantidad en buen estado no puede superar lo que llego.
- Lote y vencimiento son obligatorios al recibir.
- La orden debe estar aprobada para poder recibir.
- La linea seleccionada debe pertenecer a la orden.

Si alguna regla no se cumple, el sistema muestra el motivo y no guarda la recepcion.

## 11. Registrar factura

La factura se registra despues de recibir mercaderia.

Para registrar factura:

1. Seleccione la fase `Factura`.
2. Seleccione la orden recibida o parcialmente recibida.
3. Ingrese numero de factura.
4. Revise el total pagable sugerido.
5. Ingrese total de factura.
6. Use `Usar total pagable` si desea copiar el total aceptado.
7. Revise el mensaje de validacion.
8. Presione `Factura`.

El panel de validacion muestra:

| Dato | Explicacion |
| --- | --- |
| Total ordenado | Valor original de la orden. |
| En buen estado / pagable | Valor recibido y aceptado. |
| No aceptado | Valor recibido pero rechazado. |
| Pendiente por recibir | Valor que aun no llega. |
| Total factura | Monto ingresado de la factura. |

Si la factura coincide, la orden puede quedar `Facturada`.

Si no coincide, puede quedar `Con discrepancia` y debe revisarse.

El sistema no permite registrar factura si:

- La orden no existe.
- El proveedor de la factura no coincide con el proveedor de la orden.
- La orden aun no tiene mercaderia recibida.
- El total de factura es cero o negativo.

Cuando exista discrepancia, no significa necesariamente que el registro este mal. Significa que el total facturado no coincide con lo recibido en buen estado. Revise descuentos, bonificaciones, productos rechazados o factura incompleta.

[agregar img: validacion de factura]

## 12. Registrar devolucion a proveedor

La devolucion es opcional. Se usa si hay producto aceptado que se devolvera o producto no aceptado que debe reclamarse.

Tipos de devolucion:

| Tipo | Uso | Efecto |
| --- | --- | --- |
| Producto en buen estado que entro a inventario | Se devuelve producto que ya fue aceptado. | Descuenta inventario. |
| Producto no aceptado al recibir | Se reclama producto rechazado. | No descuenta inventario porque nunca entro como aceptado. |

Para registrar devolucion:

1. Seleccione la fase `Devolucion`.
2. Seleccione la orden.
3. Seleccione la linea.
4. Seleccione que se va a devolver.
5. Ingrese cantidad.
6. Ingrese lote si aplica.
7. Ingrese motivo.
8. Presione `Devolucion`.

Notas:

- No puede devolver mas de lo permitido por el sistema.
- El motivo es obligatorio.
- Si devuelve producto aceptado, se reduce el inventario.
- Si devuelve producto no aceptado, no se reduce inventario porque ese producto no ingreso como disponible.
- El sistema valida que la compra exista, que el proveedor coincida y que haya cantidad suficiente para devolver.
- Si no hay stock disponible para una devolucion de producto aceptado, el sistema no permite guardar la devolucion.

[agregar img: devolucion a proveedor]

## 13. Ordenes y compras registradas

La seccion `Ordenes y compras registradas` esta plegada por defecto para no saturar la pantalla.

Para consultar historial:

1. Abra `Ordenes y compras registradas`.
2. Use el buscador si necesita filtrar por proveedor, factura u otro dato visible.
3. Use las acciones disponibles en la tabla.

Acciones comunes:

| Accion | Uso |
| --- | --- |
| Ver detalle | Consultar una orden o compra. |
| Editar borrador | Modificar un registro editable. |
| Aprobar orden | Aprobar una orden pendiente desde la tabla. |
| Eliminar borrador | Eliminar una orden que aun no avanza. |

[agregar img: tabla de ordenes y compras]

## 14. Compra directa

La accion `Compra directa` permite registrar una compra tradicional fuera del flujo de orden, si su rol lo permite.

Use compra directa solo cuando el proceso operativo lo permita.

Notas:

- Si la compra directa registra pago desde `Caja de turno`, debe existir caja abierta.
- Crear orden, aprobar, recibir y facturar en el flujo normal no requiere caja abierta.
- La compra directa puede afectar inventario inmediatamente, segun configuracion del formulario.

## 15. Errores comunes

| Situacion | Causa probable | Solucion |
| --- | --- | --- |
| No puedo crear orden desde sucursal no matriz | Solo matriz crea ordenes a proveedor. | Use `Solicitar compra a matriz`. |
| No aparece una orden para recibir | La orden no esta aprobada. | Apruebe la orden primero. |
| No aparece una orden para facturar | No hay mercaderia recibida. | Registre recepcion parcial o total. |
| No puedo consolidar solicitudes | No selecciono proveedor o solicitudes compatibles. | Seleccione proveedor y marque solicitudes. |
| Un medicamento no aparece para el proveedor | No existe relacion medicamento-proveedor. | Solicite registrar la relacion en catalogos. |
| La factura muestra discrepancia | El total factura no coincide con lo recibido en buen estado. | Revise cantidades, precios, descuentos o producto rechazado. |
| No puedo completar traslado | Puede faltar stock o permiso. | Revise stock, estado y permisos del traslado. |
| No veo stock en la sucursal solicitante despues de recibir compra | El sistema creo solicitud de traslado, pero aun no fue entregada. | Complete el flujo de traslado hasta `Entregada`. |
| La orden no se puede recibir | La orden no esta aprobada o ya esta en otro estado. | Revise el estado de la orden y apruebela si corresponde. |
| La factura no se puede registrar | La orden no tiene recepcion o el proveedor no coincide. | Reciba mercaderia primero y confirme que el proveedor sea correcto. |
| No puedo devolver producto | La cantidad supera lo recibido, lo rechazado o el stock actual. | Revise el maximo permitido y el inventario disponible. |

## 16. Mensajes de validacion

El sistema muestra mensajes para explicar por que no permite continuar. Algunos ejemplos:

| Mensaje | Que significa | Que hacer |
| --- | --- | --- |
| `El proveedor seleccionado no existe o esta desactivado.` | El proveedor no esta disponible para operar. | Seleccione otro proveedor o solicite activar el proveedor. |
| `La cantidad de la linea debe ser mayor a cero.` | La orden tiene una linea con cantidad invalida. | Corrija la cantidad. |
| `La orden no puede recibirse porque esta en estado...` | La orden no esta lista para recepcion. | Apruebe la orden o seleccione una orden aprobada. |
| `Primero debe recibir mercaderia.` | Intenta facturar antes de registrar recepcion. | Registre recepcion parcial o total. |
| `El proveedor de la factura no coincide...` | La factura se esta asociando a una orden de otro proveedor. | Seleccione la orden o proveedor correcto. |
| `Stock insuficiente para devolver...` | Quiere devolver mas producto aceptado del stock disponible. | Verifique inventario o reduzca la cantidad. |
| `La cantidad a devolver no puede superar...` | La cantidad ingresada supera el maximo permitido. | Use una cantidad menor o revise la linea seleccionada. |
| `Traslado generado` | La solicitud de compra ya fue convertida en solicitud de traslado desde matriz. | Dar seguimiento en traslados hasta marcar entrega. |

Si el mensaje no es claro, tome nota del texto y consulte con soporte o con un supervisor autorizado.

## 17. Resumen rapido por rol

### Sucursal no matriz

1. Entrar a `Compras`.
2. Ir a `Necesidad`.
3. Seleccionar medicamento, sucursal y cantidad.
4. Presionar `Revisar disponibilidad`.
5. Si hay stock interno, solicitar traslado.
6. Si no hay stock interno, presionar `Solicitar compra a matriz`.
7. Dar seguimiento en traslados o esperar gestion de matriz.

### Sucursal matriz

1. Entrar a `Compras`.
2. Ir a `Orden`.
3. Revisar `Solicitudes pendientes de compra`.
4. Seleccionar proveedor.
5. Seleccionar y consolidar solicitudes.
6. Crear orden completa.
7. Aprobar orden.
8. Recibir mercaderia.
9. Dar seguimiento a los traslados generados hacia sucursales.
10. Registrar factura.
11. Registrar devolucion si aplica.

### Traslado entre sucursales

1. Entrar a `Traslados entre sucursales`.
2. Revisar solicitud pendiente.
3. Aceptar o rechazar.
4. Marcar como enviada cuando salga producto.
5. Marcar como entregada al confirmar recepcion.
6. El sistema aplica el movimiento de inventario al entregar.

## 18. Recomendaciones operativas

- Revise traslado interno antes de solicitar compra a matriz.
- Matriz debe consolidar solicitudes similares para reducir compras duplicadas.
- No apruebe ordenes sin revisar proveedor, cantidades y total.
- Registre recepciones el mismo dia que llega la mercaderia.
- Despues de recibir una compra consolidada, revise las solicitudes de traslado generadas para completar el reparto.
- Complete siempre lote y vencimiento.
- Facture contra lo recibido en buen estado.
- Use devolucion solo cuando exista producto a reclamar.
- Mantenga actualizada la relacion medicamento-proveedor para facilitar consolidacion.
