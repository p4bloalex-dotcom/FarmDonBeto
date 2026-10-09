# Manual de usuario final: Call Center

Fecha de revision: 8 de octubre de 2026.

Este manual explica el uso del modulo **Call Center** para el usuario final que toma pedidos por telefono o canal remoto. El contenido se basa en la pantalla, validaciones, modelos y reglas de negocio implementadas en el sistema.

## 1. Objetivo del modulo

El modulo **Call Center** permite registrar pedidos de clientes para entrega a domicilio, validar disponibilidad por sucursal, reservar inventario, dar seguimiento al despacho y convertir la orden entregada en venta.

El flujo evita duplicar cobros o descuentos de inventario porque una orden entregada genera una venta asociada y no puede volver a generarla.

[img1, pantalla principal del modulo Call Center]

## 2. Ubicacion en el sistema

Ruta funcional: **Operaciones > Call Center**.

Ruta tecnica de pantalla: `customer-order`.

Nombre de permiso/controlador: `CustomerOrder`.

Categoria de permisos: `Operation`.

## 3. Alcance funcional

El modulo cubre:

| Proceso | Uso |
| --- | --- |
| Buscar cliente | Consulta historial por telefono y reutiliza datos anteriores. |
| Capturar pedido | Selecciona medicamentos y cantidades. |
| Registrar entrega | Captura direccion, referencia y coordenadas. |
| Consultar disponibilidad | Evalua sucursales por stock, cobertura, distancia y carga de pedidos. |
| Confirmar pedido | Define pago, costo de envio, ETA y notas. |
| Reservar inventario | Al crear la orden, reserva stock en la sucursal seleccionada. |
| Seguimiento | Cambia estado pendiente, en ruta, entregada o cancelada. |
| Venta desde pedido | Al entregar, genera venta, detalle, pago, movimiento de caja e inventario. |

## 4. Usuarios que lo utilizan

Este modulo puede ser usado por operadores de call center, personal de sucursal, despacho, caja, administracion o gerencia.

El acceso no depende automaticamente del puesto laboral. El acceso depende del rol, menu y permisos configurados en seguridad.

## 5. Roles, puestos y matriz de permisos

### Roles sugeridos

| Rol sugerido | Uso esperado |
| --- | --- |
| Administrador | Acceso completo al modulo. |
| Operador Call Center | Buscar cliente, capturar pedido, consultar disponibilidad y crear orden. |
| Despacho | Marcar pedidos en ruta. |
| Repartidor o encargado de entrega | Marcar pedidos entregados. |
| Supervisor | Cancelar pedidos y revisar seguimiento. |
| Auditoria o gerencia | Consultar historial y estados. |

### Puestos relacionados

| Puesto | Relacion con el modulo |
| --- | --- |
| Operador telefonico | Atiende al cliente y registra el pedido. |
| Encargado de sucursal | Revisa disponibilidad y despacho desde la sucursal. |
| Repartidor | Ejecuta entrega y reporta estado. |
| Cajero | Requiere caja abierta para convertir entrega en venta. |
| Supervisor de operaciones | Da seguimiento a cancelaciones, demoras y pedidos activos. |

### Matriz de permisos

| Permiso | Accion que habilita | Uso dentro del modulo |
| --- | --- | --- |
| `CustomerOrder.Ver` | Consultar disponibilidad, buscar medicamentos, historial, listado y detalle. | Necesario para operar la pantalla. |
| `CustomerOrder.Crear` | Registrar nueva orden y reservar inventario. | Usado al confirmar pedido. |
| `CustomerOrder.Editar` | Permiso CRUD base. | El cambio de estado usa permisos especificos. |
| `CustomerOrder.Eliminar` | Permiso CRUD base. | No hay eliminacion fisica visible; se usa cancelacion. |
| `CustomerOrder.Enviar` | Marcar orden como en ruta. | Estado `S`. |
| `CustomerOrder.Entregar` | Marcar orden como entregada. | Estado `D`; genera venta. |
| `CustomerOrder.Cancelar` | Cancelar orden pendiente o en ruta. | Estado `C`; libera reserva. |

Si el usuario no tiene permiso para la accion, el sistema bloquea la operacion.

## 6. Dependencias con otros modulos

### Dependencias obligatorias

| Modulo o catalogo | Dependencia |
| --- | --- |
| Seguridad | Controla acceso por rol, menu y permisos. |
| Sucursales | La orden se asigna a una sucursal con stock y cobertura. |
| Medicamentos | El pedido se arma con medicamentos activos y precio de venta. |
| Inventario | Consulta disponibilidad, reserva stock, libera reserva o descuenta al entregar. |
| Lotes de inventario | Al entregar, consume lotes por FEFO. |
| Caja del dia | Para entregar y convertir a venta debe existir caja abierta en la sucursal. |
| Ventas | Al entregar, se genera venta de canal Call Center. |

### Dependencias funcionales

| Modulo | Relacion |
| --- | --- |
| Caja y bancos | Pagos por tarjeta o transferencia pueden estar confirmados antes de entrega, aunque la venta se crea al entregar. |
| Personal | Para registrar la venta se requiere empleado activo asociado a la sucursal. |
| Geolocalizacion | Permite calcular coordenadas, distancia, cobertura y ETA. |
| Auditoria | Las acciones pueden quedar registradas segun la configuracion general. |

### Catalogos y mantenimientos relacionados

| Catalogo/mantenimiento | Uso |
| --- | --- |
| Sucursales | Deben tener estado activo, cobertura, coordenadas y parametros de entrega cuando aplique. |
| Medicamentos | Deben estar activos y tener precio de venta. |
| Inventario por sucursal | Debe tener stock disponible suficiente. |
| Tipos de movimiento de caja | Debe existir el tipo `SALE` para registrar movimiento por venta en efectivo. |
| Empleados | Debe existir empleado activo en la sucursal para registrar la venta. |
| Usuarios, roles, menus y permisos | Controlan quien puede crear, enviar, entregar o cancelar. |

## 7. Pantalla principal

La pantalla esta organizada por pasos:

| Paso | Uso |
| --- | --- |
| Cliente | Buscar historial por telefono y confirmar datos. |
| Pedido | Seleccionar medicamentos y cantidades. |
| Entrega | Registrar direccion, referencia y coordenadas. |
| Disponibilidad | Seleccionar sucursal con stock y cobertura. |
| Confirmar | Confirmar forma de pago, envio, ETA y notas. |
| Seguimiento | Administrar estados de las ordenes. |

[img2, pasos del modulo Call Center]

Indicadores superiores:

| Indicador | Significado |
| --- | --- |
| Cliente | Cliente identificado o pendiente. |
| Entrega | Indica si la ubicacion esta lista. |
| Total estimado | Subtotal de productos mas envio. |
| ETA | Tiempo estimado de entrega en minutos. |

## 8. Paso Cliente

Permite identificar al cliente y buscar historial por telefono.

[img3, paso Cliente del Call Center]

Campos:

| Campo | Regla |
| --- | --- |
| Telefono del cliente | Para buscar historial debe tener al menos 6 caracteres. |
| Cliente | Obligatorio para continuar. |
| Telefono confirmado | Obligatorio para continuar. |

Reglas:

- Si se encuentra historial, el sistema puede cargar nombre, direccion, referencia, coordenadas y metodo de pago del ultimo pedido.
- Si el cliente no tiene historial, el operador debe capturar los datos manualmente.
- No se puede continuar al pedido sin cliente y telefono.

## 9. Paso Pedido

Permite capturar medicamentos y cantidades solicitadas.

[img4, paso Pedido del Call Center]

Campos:

| Campo | Regla |
| --- | --- |
| Medicamento | Debe seleccionar medicamento activo. |
| Cantidad | Debe ser mayor o igual a 0.01. |
| Subtotal | Se calcula con cantidad por precio de venta. |

Reglas:

- El pedido debe tener al menos un medicamento.
- Al cambiar medicamentos o cantidades se limpia la disponibilidad calculada previamente.
- El precio usado es el precio de venta del medicamento.

## 10. Paso Entrega

Permite registrar direccion, referencia y coordenadas.

[img5, paso Entrega del Call Center]

Campos:

| Campo | Regla |
| --- | --- |
| Direccion entrega | Obligatoria, minimo funcional de 5 caracteres en backend. |
| Coordenadas | Obligatorias para consultar disponibilidad y crear orden. |
| Referencia | Opcional, maximo 255 caracteres. |

Opciones de ubicacion:

| Accion | Uso |
| --- | --- |
| Geolocalizar direccion | Busca coordenadas desde la direccion. |
| Abrir mapa | Permite seleccionar ubicacion en mapa. |

Reglas:

- Si cambia la direccion, se limpian coordenadas y disponibilidad.
- Para consultar disponibilidad debe existir direccion y coordenadas.
- Las coordenadas deben ser validas: latitud entre -90 y 90, longitud entre -180 y 180.

## 11. Paso Disponibilidad

Permite seleccionar la sucursal que atendera el pedido.

[img6, paso Disponibilidad por sucursal]

El sistema evalua:

| Criterio | Uso |
| --- | --- |
| Stock disponible | Stock disponible menos reserva. |
| Cobertura | Distancia contra radio de cobertura de la sucursal. |
| Distancia | Distancia entre sucursal y direccion de entrega. |
| Carga activa | Pedidos pendientes o en ruta de la sucursal. |
| ETA | Tiempo estimado de entrega. |

Reglas:

- Solo se puede seleccionar una sucursal con stock suficiente y dentro de cobertura.
- El sistema sugiere la mejor sucursal disponible.
- Si ninguna sucursal puede cumplir, no se puede crear orden.
- Si no hay coordenadas, el sistema no puede consultar disponibilidad.
- La disponibilidad se calcula con la cantidad solicitada por cada medicamento.

## 12. Paso Confirmar

Permite confirmar la llamada antes de crear la orden.

[img7, paso Confirmacion del pedido]

Campos:

| Campo | Regla |
| --- | --- |
| Pago | Contra entrega, efectivo confirmado, tarjeta confirmada o transferencia confirmada. |
| Envio | Monto de envio, no puede ser negativo. |
| ETA minutos | Debe ser minimo 10 minutos y maximo 480 en backend. |
| Notas de llamada | Opcional, maximo 255 caracteres. |

Reglas de pago:

| Metodo | Estado de pago aplicado |
| --- | --- |
| Contra entrega (`COD`) | Pago pendiente. |
| Efectivo confirmado (`CASH`) | Pago confirmado. |
| Tarjeta confirmada (`CARD`) | Pago confirmado. |
| Transferencia confirmada (`TRANSFER`) | Pago confirmado. |

Reglas:

- Si el metodo no es contra entrega, el pago debe estar confirmado para crear la orden.
- La orden se crea solo si existe sucursal seleccionada con disponibilidad.
- Al crear la orden se reserva inventario.
- El total es subtotal de productos mas envio.

Mensaje esperado: **Orden registrada con inventario reservado.**

## 13. Seguimiento de ordenes

Permite administrar el estado operativo del pedido.

[img8, seguimiento de ordenes Call Center]

Columnas principales:

| Columna | Descripcion |
| --- | --- |
| Orden | Numero interno de orden. |
| Cliente | Nombre del cliente. |
| Sucursal | Sucursal que atiende. |
| Pago | Metodo de pago. |
| Total | Total del pedido. |
| ETA | Tiempo estimado. |
| Estado | Pendiente, en ruta, entregada o cancelada. |

Acciones:

| Accion | Cuando aplica | Resultado |
| --- | --- | --- |
| Enviar | Orden pendiente. | Cambia a en ruta. |
| Entregar | Orden en ruta. | Genera venta, descuenta inventario y registra pago. |
| Cancelar | Orden pendiente o en ruta. | Libera reserva y marca cancelada. |

## 14. Estados de la orden

| Estado visible | Codigo | Significado | Reglas |
| --- | --- | --- | --- |
| Pendiente | `P` | Orden creada y reservada. | Puede enviarse o cancelarse. |
| En ruta | `S` | Pedido enviado a entrega. | Puede entregarse o cancelarse. |
| Entregada | `D` | Pedido finalizado. | Genera venta y ya no se puede cambiar desde seguimiento. |
| Cancelada | `C` | Pedido cancelado. | Libera reserva si estaba pendiente o en ruta. |

Flujo permitido:

| Cambio | Permitido |
| --- | --- |
| Pendiente -> En ruta | Si. |
| En ruta -> Entregada | Si. |
| Pendiente -> Cancelada | Si, con motivo. |
| En ruta -> Cancelada | Si, con motivo. |
| Entregada -> Cancelada | No. |
| Cancelada -> Otro estado | No. |

## 15. Estados de pago

| Estado | Significado |
| --- | --- |
| `PENDING` | Pago pendiente. Normal en contra entrega. |
| `PAID` | Pago confirmado. Requerido para metodos no contra entrega. |
| `FAILED` | Pago fallido. Validado como estado posible. |
| `REFUNDED` | Pago reembolsado. Validado como estado posible. |

Regla clave: si la orden no es contra entrega, debe registrarse con pago confirmado.

## 16. Logica de negocio

### Creacion de orden

- Requiere cliente, telefono, direccion, coordenadas, metodo de pago, ETA, envio e items.
- Verifica disponibilidad por sucursal antes de crear.
- La sucursal seleccionada debe existir en la disponibilidad calculada.
- La sucursal debe poder cumplir por stock y cobertura.
- Los medicamentos deben existir y estar activos.
- El sistema calcula precio con el precio de venta del medicamento.
- Al crear, aumenta la reserva en inventario.
- La orden inicia con estado pendiente `P`.

### Envio

- Solo una orden pendiente puede marcarse en ruta.
- No descuenta inventario todavia.
- Mantiene la reserva hasta entrega o cancelacion.

### Entrega

- Solo una orden en ruta puede marcarse entregada.
- Consume lotes por FEFO.
- Reduce reserva y stock disponible.
- Registra kardex con movimiento `CUSTOMER_ORDER_DELIVERY`.
- Requiere caja abierta en la sucursal.
- Requiere empleado activo asociado a la sucursal.
- Genera venta con canal `CALL_CENTER`.
- Genera detalle de venta y pago.
- Si el pago es efectivo o contra entrega, registra movimiento de caja tipo `SALE`.
- Si la orden ya tiene venta asociada, no permite generar otra venta.

### Cancelacion

- Solo se pueden cancelar ordenes pendientes o en ruta.
- Requiere motivo minimo de 5 caracteres.
- Libera la reserva de inventario.
- Agrega el motivo a las notas de la orden.

## 17. Validaciones generales

| Validacion | Efecto |
| --- | --- |
| Telefono menor a 6 caracteres para historial | No consulta historial. |
| Cliente sin nombre o telefono | No permite continuar. |
| Medicamento sin seleccionar | No permite continuar. |
| Cantidad menor a 0.01 | No permite continuar. |
| Direccion sin coordenadas | No permite consultar disponibilidad. |
| Coordenadas invalidas | No permite crear orden. |
| Sucursal sin stock suficiente | No permite seleccionarla. |
| Sucursal fuera de cobertura | No permite seleccionarla. |
| Metodo no contra entrega sin pago confirmado | No permite crear orden. |
| Entrega sin caja abierta | No permite entregar. |
| Entrega sin empleado activo en sucursal | No permite registrar venta. |
| Entrega sin tipo de movimiento `SALE` | No permite registrar movimiento de caja. |
| Cancelacion sin motivo valido | No permite cancelar. |

## 18. Mensajes frecuentes

| Situacion | Mensaje |
| --- | --- |
| Telefono invalido | Ingrese un telefono valido para buscar historial. |
| Direccion sin geolocalizar | Seleccione coordenadas de entrega con Geolocalizar direccion o Abrir mapa. |
| Sin disponibilidad | Seleccione una sucursal con disponibilidad. |
| Stock insuficiente | La sucursal seleccionada no tiene stock suficiente. |
| Fuera de cobertura | La sucursal seleccionada esta fuera de cobertura para la entrega. |
| Orden sin pago confirmado | Las ordenes que no son contra entrega deben registrarse con pago confirmado. |
| Entrega sin caja | No hay caja abierta para convertir la orden entregada a venta. |
| Entrega sin empleado | No hay empleado activo asociado a la sucursal para registrar la venta. |
| Venta duplicada | La orden ya tiene una venta asociada. No se puede generar otra venta ni duplicar cobros o descuento de stock. |
| Reserva insuficiente | La reserva de inventario no cubre la entrega. |

## 19. Flujo recomendado de operacion

1. Buscar cliente por telefono.
2. Confirmar nombre y telefono.
3. Capturar medicamentos y cantidades.
4. Registrar direccion y referencia.
5. Geolocalizar direccion o seleccionar en mapa.
6. Consultar disponibilidad.
7. Seleccionar sucursal disponible sugerida o una disponible valida.
8. Confirmar metodo de pago, envio, ETA y notas.
9. Crear orden y reservar inventario.
10. Marcar **Enviar** cuando sale a ruta.
11. Marcar **Entregar** al completar entrega.
12. Cancelar solo si corresponde y registrar motivo.

## 20. Errores frecuentes y solucion

| Problema | Causa probable | Solucion |
| --- | --- | --- |
| No deja consultar disponibilidad | Falta direccion, coordenadas o items validos. | Geolocalizar direccion y revisar medicamentos/cantidades. |
| No aparece sucursal disponible | No hay stock, esta fuera de cobertura o sucursales sin coordenadas. | Revisar inventario, cobertura y datos de sucursal. |
| No deja crear orden | No hay sucursal seleccionada o no puede cumplir. | Seleccionar una sucursal disponible. |
| No deja entregar | La orden no esta en ruta. | Primero marcar **Enviar**. |
| No se convierte a venta | Falta caja abierta, empleado activo o tipo de movimiento `SALE`. | Abrir caja, revisar empleado de sucursal y catalogo de movimientos. |
| No deja cancelar | Motivo corto o estado no permitido. | Ingresar motivo de al menos 5 caracteres y validar que este pendiente/en ruta. |
| Se borra disponibilidad | Cambio direccion, medicamentos o cantidades. | Volver a consultar disponibilidad. |

## 21. Alcance y limites actuales

- El modulo registra pedidos remotos y los convierte en venta al entregar.
- No edita pedidos ya creados; el seguimiento se maneja por estados.
- La cancelacion libera reserva, pero no revierte ventas ya entregadas.
- La entrega requiere caja abierta aunque el pago no sea contra entrega, porque la venta se registra al entregar.
- La geolocalizacion puede usar estimacion local si no hay ruta externa disponible.
- El historial del cliente se consulta por telefono y muestra los ultimos pedidos disponibles.
- El modulo depende de inventario por sucursal y lotes para completar entregas correctamente.
