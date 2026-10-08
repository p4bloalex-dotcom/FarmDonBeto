# Manual de usuario final: Inventario

Fecha de revision: 8 de octubre de 2026.

Este manual explica el uso del modulo **Inventario** para el usuario que opera el sistema. El contenido se basa en las pantallas del frontend y en las reglas implementadas en el backend.

## 1. Objetivo del modulo

El modulo **Inventario** permite consultar existencias de medicamentos por sucursal, configurar minimos y maximos, revisar lotes, consultar kardex, validar disponibilidad para prometer, generar reservas, registrar ajustes y controlar el estado sanitario de los lotes.

Este modulo es base para otros procesos operativos. Compras incrementa inventario, ventas lo descuenta, pedidos lo reservan y traslados lo mueven entre sucursales.

[img1, pantalla principal de Inventario]

## 2. Ubicacion en el sistema

Ruta funcional: **Operaciones > Inventario**.

Ruta tecnica de pantalla: `inventory`.

Nombre de permiso/controlador: `Inventory`.

Categoria de permisos: `Operation`.

## 3. Usuarios que lo utilizan

Este modulo lo utilizan usuarios responsables de revisar existencias, controlar lotes, atender alertas de stock, reservar productos, ajustar diferencias y validar estados sanitarios.

El sistema no asigna acceso por puesto automaticamente. El acceso depende de la configuracion del modulo de seguridad: usuario, rol, menu y permisos.

## 4. Roles, puestos y matriz de permisos

### Roles

Roles sugeridos para operacion:

| Rol sugerido | Uso esperado |
| --- | --- |
| Administrador | Acceso completo al modulo. |
| Encargado de inventario | Consulta, configuracion, lotes, kardex, reservas y ajustes. |
| Responsable sanitario | Revision tecnica y cambio de estado sanitario de lotes. |
| Encargado de sucursal | Consulta de existencia, ATP y alertas de su operacion. |
| Auditor | Consulta de kardex, lotes y movimientos. |

Estos nombres son sugeridos. El sistema valida permisos por rol configurado, no por el nombre exacto del rol.

### Puestos

El puesto laboral sirve como referencia organizativa, pero no concede permisos por si mismo.

Ejemplos de puestos relacionados:

| Puesto | Relacion con el modulo |
| --- | --- |
| Encargado de bodega | Controla existencias, lotes y ajustes. |
| Dependiente de farmacia | Consulta disponibilidad para venta o reserva. |
| Regente o responsable tecnico | Revisa estado sanitario de lotes. |
| Administrador de sucursal | Revisa stock bajo, sobre maximo y reabastecimiento. |
| Auditor interno | Consulta kardex y trazabilidad. |

### Matriz de permisos del modulo

| Permiso | Accion que habilita | Observacion |
| --- | --- | --- |
| `Inventory.Ver` | Ver inventario, kardex, lotes, ATP, alertas y sugerencias. | Requerido para consultar la pantalla. |
| `Inventory.Crear` | Crear reservas, ajustes y lotes desde endpoints del modulo. | En la pantalla actual se usa para reservar y ajustar. |
| `Inventory.Editar` | Configurar reserva manual, stock minimo y stock maximo. | Requerido para **Configurar**. |
| `Inventory.Eliminar` | Cancelar reservas desde backend. | La pantalla actual no muestra una accion directa de cancelar reserva. |
| `Inventory.Validacion tecnica` | Cambiar estado sanitario del lote. | Requerido para aprobar, inmovilizar, poner en cuarentena o rechazar lotes. |

Si el usuario no tiene permiso para una accion, el sistema puede bloquear la operacion con el mensaje: **No tienes permiso para esta accion.**

## 5. Dependencias con otros modulos y catalogos

### Dependencias obligatorias

| Dependencia | Para que se usa |
| --- | --- |
| Seguridad | Controla acceso al menu y acciones permitidas. |
| Sucursales | Todo inventario pertenece a una sucursal. |
| Medicamentos | Todo registro de inventario corresponde a un medicamento. |

### Dependencias funcionales

| Modulo | Relacion |
| --- | --- |
| Compras | Puede generar recepciones, lotes y entradas de inventario. |
| Ventas | Puede descontar existencias y registrar salidas en kardex. |
| Traslados entre sucursales | Puede generar entradas y salidas por traspaso. |
| Call Center / pedidos | Puede reservar inventario para un pedido. |
| Reportes | Consulta saldos, kardex, alertas y movimientos. |
| Auditoria | Puede registrar trazabilidad de cambios segun configuracion general. |

### Catalogos y mantenimientos relacionados

| Catalogo o mantenimiento | Relacion con inventario |
| --- | --- |
| Medicamentos | Producto que se controla en inventario. |
| Categorias de medicina | Clasificacion para organizar medicamentos. |
| Laboratorios | Datos del medicamento. |
| Presentaciones | Forma o presentacion comercial del medicamento. |
| Unidades de medida | Base para cantidades de compra, venta o existencia. |
| Sucursales | Ubicacion operativa del stock. |
| Proveedores | Relacionados con lotes recibidos por compra. |
| Tipos de movimiento de inventario | Clasificacion de movimientos operativos. |
| Configuracion de producto por sucursal | Base para sugerencias de reabastecimiento. |

## 6. Pantalla principal

La pantalla principal muestra el inventario general por medicamento y sucursal.

[img2, listado principal de Inventario]

Columnas principales:

| Columna | Descripcion |
| --- | --- |
| Imagen | Imagen del medicamento, si existe. |
| Medicamento | Nombre del medicamento. |
| Sucursal | Sucursal donde se encuentra el stock. |
| Disponible | Cantidad agregada disponible. |
| Reserva | Cantidad reservada registrada en inventario agregado. |
| Min. | Stock minimo configurado. |
| Max. | Stock maximo configurado. |
| Estado | Situacion del inventario segun stock disponible, minimo y maximo. |

Indicadores superiores:

| Indicador | Significado |
| --- | --- |
| Disponible | Suma de stock disponible de los registros filtrados. |
| Reservado | Suma de reserva de los registros filtrados. |
| Bajo minimo | Cantidad de registros con stock en o debajo del minimo. |
| Sobre maximo | Cantidad de registros con stock por encima del maximo. |

## 7. Busqueda y filtros

Busqueda rapida:

El campo de busqueda permite localizar por medicamento, sucursal o estado.

Filtros avanzados:

| Filtro | Opciones |
| --- | --- |
| Sucursal | Todas o una sucursal especifica. |
| Estado | Todos, Disponible, Bajo minimo, Sobre maximo, Sin stock. |

Botones de analisis:

| Boton | Resultado |
| --- | --- |
| Stock bajo | Carga registros con stock disponible menor o igual al minimo. |
| Por vencer | Carga lotes con vencimiento dentro de 60 dias. |
| ATP global | Muestra disponibilidad para prometer por sucursal y medicamento. |
| Reabastecer | Muestra sugerencias de compra o traslado segun configuracion. |

El boton **Limpiar** borra filtros activos. El boton **Ver general** regresa al listado principal cuando hay una vista de detalle abierta.

## 8. Estados del inventario agregado

El estado mostrado en el listado principal se calcula con base en disponible, minimo y maximo.

| Estado visible | Regla |
| --- | --- |
| Sin stock | Disponible menor o igual a 0. |
| Bajo minimo | Disponible mayor a 0 y menor o igual al stock minimo. |
| Sobre maximo | Stock maximo mayor a 0 y disponible mayor al maximo. |
| Disponible | No cumple las condiciones anteriores. |

Reglas importantes:

- Si el minimo es 0, un producto con existencia positiva no queda bajo minimo por esa regla.
- Si el maximo es 0, no se evalua sobre maximo.
- El estado es una alerta operativa; no bloquea automaticamente ventas, compras o traslados.

## 9. Configurar inventario

La accion **Configurar** permite modificar valores administrativos del inventario agregado.

Para configurar:

1. Ubique el medicamento y sucursal.
2. Seleccione **Configurar**.
3. Ingrese reserva, stock minimo y stock maximo.
4. Presione **Guardar**.

[img3, dialogo Configurar inventario]

Campos configurables:

| Campo | Regla |
| --- | --- |
| Reserva | Numero mayor o igual a 0. |
| Stock minimo | Numero mayor o igual a 0. |
| Stock maximo | Numero mayor o igual a 0. |

Validacion backend:

| Validacion | Resultado |
| --- | --- |
| Stock minimo mayor que stock maximo cuando maximo es mayor que 0 | No permite guardar. |
| Valores negativos | No permite guardar. |

Mensaje esperado al guardar correctamente: **Inventario actualizado correctamente.**

## 10. Kardex

La accion **Kardex** muestra el historial de movimientos del medicamento en la sucursal seleccionada.

Para consultar kardex:

1. Ubique el medicamento.
2. Seleccione **Kardex**.
3. Revise entradas, salidas, saldo y motivo.

[img4, vista de Kardex de inventario]

Columnas del kardex:

| Columna | Descripcion |
| --- | --- |
| Fecha | Fecha del movimiento. |
| Tipo | Tipo de movimiento registrado. |
| Entrada | Cantidad que ingresa. |
| Salida | Cantidad que sale. |
| Saldo | Saldo posterior al movimiento. |
| Motivo | Justificacion o referencia. |

Tipos de movimiento visibles o posibles:

| Tipo interno | Significado |
| --- | --- |
| `PURCHASE_RECEIPT` | Recepcion de compra. |
| `SALE` | Venta. |
| `TRANSFER_IN` | Entrada por traspaso. |
| `TRANSFER_OUT` | Salida por traspaso. |
| `ADJUSTMENT` | Ajuste manual. |
| `RESERVATION` | Reserva de inventario. |
| `RESERVATION_RELEASE` | Liberacion de reserva. |
| `SANITARY_BLOCK` | Bloqueo sanitario de lote. |
| `SANITARY_RELEASE` | Liberacion sanitaria de lote. |

El kardex se muestra ordenado desde los movimientos mas recientes.

## 11. Lotes

La accion **Lotes** muestra los lotes activos del medicamento en la sucursal seleccionada.

Para consultar lotes:

1. Ubique el medicamento.
2. Seleccione **Lotes**.
3. Revise cantidades, vencimiento y estado sanitario.

[img5, vista de lotes de inventario]

Columnas de lotes:

| Columna | Descripcion |
| --- | --- |
| Sucursal | Sucursal del lote. |
| Medicamento | Medicamento del lote. |
| Lote | Numero de lote. |
| Vence | Fecha de vencimiento. |
| Fisico | Cantidad fisica registrada del lote. |
| Disponible | Cantidad disponible del lote. |
| Reservado | Cantidad reservada del lote. |
| ATP | Cantidad disponible para prometer. |
| Cuarentena | Cantidad retenida por control sanitario. |
| Estado sanitario | Estado tecnico/sanitario del lote. |
| Motivo sanitario | Motivo de bloqueo, si aplica. |

La pantalla principal permite consultar lotes y cambiar estado sanitario. El alta directa de lotes existe en backend, pero en la pantalla actual los lotes normalmente provienen de procesos operativos como recepciones de compra o integraciones internas.

## 12. Estados sanitarios del lote

El estado sanitario controla si el lote puede venderse o debe mantenerse bloqueado.

| Estado visible | Codigo | Significado |
| --- | --- | --- |
| Apto para venta | `APPROVED` | Lote disponible para venta o reserva. |
| Inmovilizado | `IMMOBILIZED` | Lote detenido por revision o decision operativa. |
| Cuarentena | `QUARANTINE` | Lote separado temporalmente por control sanitario. |
| No apto | `REJECTED` | Lote rechazado para venta. |

Reglas del cambio sanitario:

- Para aprobar un lote se debe completar todo el checklist sanitario.
- Para inmovilizar, poner en cuarentena o rechazar se debe indicar motivo sanitario.
- Un lote no aprobado mueve su cantidad disponible a cuarentena y reduce stock disponible agregado.
- Al aprobar nuevamente, la cantidad en cuarentena vuelve a disponible y aumenta el stock agregado.
- No se puede bloquear sanitariamente un lote con reservas activas si tiene disponibilidad reservada pendiente.
- Si el lote queda `REJECTED`, las compras relacionadas pueden marcarse con estado de discrepancia.

Checklist requerido para aprobar:

| Revision | Uso |
| --- | --- |
| Registro sanitario/documentos verificados | Confirma documentacion. |
| Lote coincide con factura/guia | Confirma trazabilidad documental. |
| Vencimiento valido para venta | Confirma que el lote no esta vencido. |
| Empaque y sello integros | Confirma condicion fisica. |
| Almacenamiento/cadena de frio conforme | Confirma condiciones de conservacion. |

[img6, dialogo Estado sanitario del lote]

## 13. ATP: disponible para prometer

ATP significa **available to promise** o disponible para prometer.

La accion **ATP** muestra cuanto puede comprometerse para venta, pedido o reserva sin contar cantidades ya reservadas, en transito o bloqueadas.

Para consultar ATP:

1. Seleccione la accion **ATP** en un medicamento.
2. Revise disponible, reservado, ATP, transito y cuarentena.

[img7, vista ATP de inventario]

Campos de ATP:

| Campo | Descripcion |
| --- | --- |
| Disponible | Cantidad disponible registrada. |
| Reservado | Cantidad ya apartada. |
| ATP | Disponible menos reservado. |
| Transito | Cantidad en movimiento. |
| Cuarentena | Cantidad bloqueada por revision sanitaria. |

Reglas de disponibilidad:

- Solo se consideran lotes activos.
- No se consideran lotes vencidos para disponibilidad por lote.
- No se consideran lotes en cuarentena, rechazados, danados o vencidos como disponibles para prometer.
- Si no hay lotes, el sistema puede usar el stock agregado siempre que tenga saldo disponible.

## 14. Reservar inventario

La accion **Reservar** aparta cantidad de un medicamento para evitar que otro proceso la prometa o utilice.

Para reservar:

1. Ubique el medicamento y sucursal.
2. Seleccione **Reservar**.
3. Ingrese la cantidad a reservar.
4. Presione **Reservar**.

[img8, dialogo Reservar inventario]

Reglas de reserva:

- La cantidad debe ser mayor a 0.
- La pantalla no permite reservar mas que el disponible mostrado.
- El backend valida la disponibilidad real por lotes aptos.
- El sistema reserva usando los lotes con vencimiento mas cercano primero.
- Solo se reservan lotes activos, aprobados, no vencidos, sin cuarentena, sin dano y sin vencimiento registrado como expirado.
- Si la disponibilidad real es insuficiente, no se crea la reserva.
- La reserva genera movimiento en kardex.

Mensaje esperado al guardar correctamente: **Reserva registrada correctamente.**

## 15. Ajustar inventario

La accion **Ajustar** registra un ajuste manual de la cantidad disponible agregada.

Para ajustar:

1. Ubique el medicamento y sucursal.
2. Seleccione **Ajustar**.
3. Ingrese el stock contado.
4. Ingrese motivo o autorizacion.
5. Confirme la operacion.

[img9, solicitud de ajuste de inventario]

Reglas de ajuste:

- La cantidad final debe ser numerica y mayor o igual a 0.
- El motivo es obligatorio.
- El motivo debe tener al menos 5 caracteres en backend.
- El sistema calcula diferencia entre cantidad anterior y cantidad final.
- El ajuste genera registro en `InventoryAdjustment`.
- El ajuste genera movimiento en kardex con tipo `ADJUSTMENT`.

Mensaje esperado al guardar correctamente: **Ajuste registrado y auditado correctamente.**

Uso recomendado:

- Utilizar ajustes solo por conteo fisico, correccion autorizada, merma documentada o regularizacion validada.
- No usar ajustes para reemplazar compras, ventas o traslados cuando esos procesos correspondan.

## 16. Alertas de stock bajo

El boton **Stock bajo** muestra productos cuya existencia disponible esta en o debajo del minimo configurado.

Regla:

| Condicion | Resultado |
| --- | --- |
| Stock minimo mayor a 0 y stock disponible menor o igual al minimo | Aparece en alerta de stock bajo. |

[img10, vista de alertas de stock bajo]

## 17. Lotes por vencer

El boton **Por vencer** muestra lotes activos con vencimiento dentro de los proximos 60 dias.

Regla:

| Condicion | Resultado |
| --- | --- |
| Lote activo y fecha de vencimiento menor o igual a hoy mas 60 dias | Aparece en lotes por vencer. |

[img11, vista de lotes por vencer]

## 18. Sugerencias de reabastecimiento

El boton **Reabastecer** muestra sugerencias basadas en configuracion por producto y sucursal.

[img12, vista de sugerencias de reabastecimiento]

Campos de la sugerencia:

| Campo | Descripcion |
| --- | --- |
| Sucursal | Sucursal que necesita abastecimiento. |
| Medicamento | Producto evaluado. |
| ATP actual | Disponible para prometer actual. |
| Reorden | Punto de reorden configurado. |
| Minimo | Stock minimo esperado. |
| Necesidad | Cantidad sugerida. |
| Accion | Compra o traslado. |
| Origen sugerido | Sucursal donante sugerida o compra a proveedor. |

Reglas:

- Solo se evalua configuracion con punto de reorden mayor a 0.
- Si el disponible esta en o debajo del punto de reorden, se genera sugerencia.
- Si hay otra sucursal con excedente y se permiten sugerencias de traslado, la accion sugerida puede ser `TRANSFER`.
- Si no hay origen de traslado, la accion sugerida puede ser `PURCHASE`.
- La sugerencia no ejecuta automaticamente una compra ni un traslado; solo orienta la decision.

## 19. Modelos de datos involucrados

| Modelo | Tabla | Uso en el modulo |
| --- | --- | --- |
| `Inventory` | `TB_INVENTORY` | Stock agregado por sucursal y medicamento. |
| `InventoryLot` | `TB_INVENTORY_LOT` | Lotes, vencimientos, cantidades y estado sanitario. |
| `InventoryKardex` | `TB_INVENTORY_KARDEX` | Historial de movimientos. |
| `InventoryReservation` | `TB_INVENTORY_RESERVATION` | Reservas activas o canceladas. |
| `InventoryAdjustment` | `TB_INVENTORY_ADJUSTMENT` | Ajustes manuales. |
| `BranchProductConfig` | `TB_BRANCH_PRODUCT_CONFIG` | Parametros para reabastecimiento. |
| `Medicine` | `TB_MEDICINE` | Medicamento controlado. |
| `Branch` | `TB_BRANCH` | Sucursal donde existe inventario. |

## 20. Validaciones generales

| Validacion | Resultado |
| --- | --- |
| Valores negativos en configuracion | No permite guardar. |
| Stock minimo mayor que maximo cuando maximo es mayor que 0 | No permite guardar. |
| Ajuste sin sucursal, medicamento o cantidad final | No permite guardar. |
| Ajuste con motivo menor a 5 caracteres | No permite guardar. |
| Lote sin sucursal, medicamento, numero de lote, vencimiento o cantidad | No permite registrar. |
| Reserva con cantidad menor o igual a 0 | No permite reservar. |
| Reserva con disponibilidad insuficiente | No permite reservar. |
| Aprobacion sanitaria sin checklist completo | No permite aprobar. |
| Bloqueo sanitario sin motivo | No permite guardar. |
| Bloqueo sanitario con reservas activas | No permite bloquear hasta liberar reservas. |

Mensajes posibles:

| Situacion | Mensaje |
| --- | --- |
| Configuracion guardada | Inventario actualizado correctamente. |
| Reserva exitosa | Reserva registrada correctamente. |
| Reserva sin disponibilidad | Disponibilidad insuficiente. Disponible para prometer: cantidad. |
| Ajuste exitoso | Ajuste registrado y auditado correctamente. |
| Cambio sanitario exitoso | Estado sanitario del lote actualizado. |
| Checklist incompleto | Debe completar el checklist sanitario para aprobar el lote. |
| Bloqueo sin motivo | Debe indicar el motivo sanitario para bloquear el lote. |
| Bloqueo con reservas | No se puede bloquear sanitariamente un lote con reservas activas. Libere las reservas primero. |

## 21. Logica de negocio resumida

- El inventario se controla por sucursal y medicamento.
- Los lotes permiten trazabilidad por numero de lote y fecha de vencimiento.
- La disponibilidad para prometer descuenta reservas y excluye lotes no aptos.
- Los lotes no aprobados quedan bloqueados y no deben utilizarse para venta o reserva.
- El kardex registra entradas, salidas, ajustes, reservas y cambios sanitarios que impactan stock.
- Las reservas se asignan priorizando lotes con vencimiento mas cercano.
- Los ajustes manuales deben usarse solo con motivo documentado.
- Las alertas de bajo minimo y sobre maximo dependen de la configuracion de minimo y maximo.
- Las sugerencias de reabastecimiento orientan la decision, pero no ejecutan automaticamente compras ni traslados.

## 22. Flujo recomendado de operacion

1. Revisar inventario general por sucursal.
2. Filtrar productos con stock bajo o sobre maximo.
3. Consultar lotes por vencer y revisar estado sanitario.
4. Consultar ATP antes de prometer unidades a venta o pedido.
5. Reservar inventario cuando exista una necesidad concreta.
6. Usar kardex para investigar diferencias o movimientos.
7. Registrar ajustes solo con conteo fisico y autorizacion.
8. Cambiar estado sanitario con checklist o motivo documentado.
9. Revisar sugerencias de reabastecimiento para decidir compra o traslado.

## 23. Errores frecuentes y solucion

| Problema | Causa probable | Solucion |
| --- | --- | --- |
| No aparece el modulo | Falta menu o permiso en seguridad. | Revisar rol, menu y permisos. |
| No se puede configurar | Falta permiso de editar o hay valores invalidos. | Revisar permisos y que los valores sean mayores o iguales a 0. |
| El producto aparece bajo minimo | El disponible esta en o debajo del minimo configurado. | Revisar reabastecimiento o ajustar minimo si esta mal configurado. |
| No se puede reservar | No hay disponibilidad real por lote apto. | Revisar ATP, lotes, vencimientos y reservas. |
| No se puede aprobar lote | Falta checklist sanitario completo. | Marcar todas las verificaciones requeridas. |
| No se puede bloquear lote | Tiene reservas activas o falta motivo. | Liberar reservas y registrar motivo sanitario. |
| Kardex no muestra movimientos esperados | El movimiento puede no haber afectado inventario o no corresponde a ese medicamento/sucursal. | Revisar filtros, lote, sucursal y proceso origen. |

## 24. Alcance y limites actuales

- La pantalla actual no muestra una accion directa para crear lotes manualmente, aunque el backend tiene endpoint para registrarlos.
- La pantalla actual no muestra una accion directa para cancelar reservas, aunque el backend tiene endpoint para hacerlo.
- El ajuste manual modifica inventario agregado; debe usarse con control interno porque no reemplaza ventas, compras o traslados.
- El estado sanitario afecta disponibilidad y stock agregado cuando mueve cantidades entre disponible y cuarentena.
- Las sugerencias de reabastecimiento son recomendaciones; no crean automaticamente compras ni traslados.
- La configuracion de categorias, medicamentos, unidades, sucursales y proveedores se realiza en catalogos o mantenimientos relacionados, no dentro de este modulo.
