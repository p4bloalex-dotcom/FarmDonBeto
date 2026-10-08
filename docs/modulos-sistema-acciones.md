# Modulos del sistema y acciones funcionales

Fecha: 2026-10-07

Este documento describe los modulos visibles del sistema de farmacia desde el punto de vista operativo. No enumera componentes internos como modulos separados. Cuando una funcion tecnica existe dentro del sistema, se explica dentro de la pantalla donde realmente afecta al usuario.

## Seguridad

Seguridad controla quien entra al sistema, que pantallas puede ver, que acciones puede ejecutar y si puede trabajar solo con su sucursal o con varias sucursales. Es el modulo que sostiene la separacion de responsabilidades entre administrador, gerente, encargado de sucursal, cajero, compras, bodega, auditoria y responsable tecnico farmaceutico.

### Usuarios

La pantalla de usuarios administra las cuentas de acceso. Un usuario normalmente se vincula con un empleado y con un rol. Esa relacion permite que el sistema identifique quien hizo una venta, quien abrio caja, quien recibio una compra o quien cambio un permiso.

Flujo normal:

1. Primero se registra el empleado en Personal.
2. Luego se crea el usuario.
3. Se asigna un rol.
4. El usuario entra al sistema y solo ve las opciones permitidas para su rol.

Estados comunes:

| Estado | Significado |
| --- | --- |
| Activo | El usuario puede ingresar y operar. |
| Desactivado/Inactivo | El usuario ya no debe ingresar o queda temporalmente bloqueado. |

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar usuarios, estado y rol asignado. |
| Crear | Crear una cuenta para un empleado. |
| Editar | Cambiar rol, empleado vinculado, estado o datos de acceso. |
| Eliminar | Desactivar un usuario que ya no debe operar. |

Depende de: Personal y Roles.

### Roles

La pantalla de roles define perfiles de acceso. Un rol no es exactamente un puesto laboral; es un conjunto de permisos. Por ejemplo, un empleado puede tener puesto laboral de cajero, pero un rol de encargado si la empresa decide darle mas responsabilidades en el sistema.

Logica de negocio:

- El rol agrupa permisos.
- El rol debe tener menus asignados para que el usuario vea las pantallas.
- El rol debe tener acciones asignadas para que el usuario pueda operar dentro de esas pantallas.
- El rol puede tener permisos locales o globales.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar roles existentes. |
| Crear | Crear un nuevo perfil de acceso. |
| Editar | Cambiar nombre o estado del rol. |
| Eliminar | Desactivar un rol que ya no se usa. |

Depende de: Menus por rol y Permisos.

### Menus

La pantalla de menus administra la navegacion del sistema. Un menu es una opcion visual que aparece en el panel lateral o dentro de una categoria.

Logica de negocio:

- El menu permite que el usuario encuentre la pantalla.
- El menu no concede permiso por si solo.
- Aunque un usuario vea un menu, cada accion se valida por permisos.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar menus disponibles. |
| Crear | Crear una nueva opcion de navegacion. |
| Editar | Cambiar nombre, icono, ruta, orden o categoria. |
| Eliminar | Desactivar una opcion que ya no debe verse. |

### Menus por rol

Esta pantalla define que menus puede visualizar cada rol. Sirve para limpiar la experiencia del usuario y evitar que vea pantallas que no corresponden a su trabajo.

Flujo normal:

1. Se selecciona un rol.
2. Se marcan los menus visibles.
3. Se guardan los cambios.
4. Luego se asignan permisos de accion en la pantalla Permisos.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar menus asignados al rol. |
| Crear/Editar | Marcar o desmarcar menus visibles para el rol. |
| Eliminar | Quitar un menu del rol. |

### Permisos

La pantalla de permisos define que acciones puede ejecutar un rol dentro de cada pantalla. Aqui tambien se marca si una accion tiene alcance local o global.

Conceptos importantes:

| Concepto | Explicacion funcional |
| --- | --- |
| Acceso | Permite que el rol ejecute una accion, por ejemplo Ver, Crear, Editar, Aprobar, Recibir o Pagar. |
| Global | Permite que esa accion trabaje con datos de todas las sucursales cuando el modulo lo permite. |
| Local | Restringe la accion al alcance de la sucursal del usuario o a operaciones donde participa su sucursal. |
| Matriz | Identifica una sucursal principal, pero no significa permiso global. |

Regla importante: una sucursal marcada como matriz no da acceso automatico a todas las sucursales. El alcance global se controla en permisos, marcando la accion como Global.

Ejemplos:

| Situacion | Resultado esperado |
| --- | --- |
| Encargado local con Inventario Ver local | Ve inventario de su sucursal. |
| Auditor con Reportes Ver global | Ve reportes consolidados. |
| Usuario en sucursal matriz sin permiso global | No debe tener alcance global solo por estar en matriz. |
| Compras con permiso global | Puede revisar solicitudes o informacion de varias sucursales segun el flujo. |

Cuando se actualizan permisos, el sistema limpia la informacion guardada temporalmente para que el cambio aplique de inmediato. Esto evita que el usuario vea datos antiguos despues de guardar.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar acciones disponibles por pantalla. |
| Editar | Activar/desactivar acciones y marcar/desmarcar alcance global. |

Depende de: Roles, Menus por rol y usuarios.

## Empresa

Empresa guarda informacion general de la compania propietaria de la cadena de farmacias. Es informacion de referencia para administracion, reportes y configuracion inicial.

Logica de negocio:

- Normalmente existe una empresa principal.
- Las sucursales, empleados y reportes se relacionan con esta informacion.
- No es un modulo operativo diario, sino de configuracion.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar datos generales de la empresa. |
| Crear | Registrar la empresa cuando el sistema se configura por primera vez. |
| Editar | Actualizar informacion administrativa. |

Depende de: Administracion general.

## Sucursales

Sucursales administra farmacias, bodegas o puntos operativos. Es uno de los modulos mas importantes porque ventas, caja, inventario, compras, empleados, traslados y reportes se registran por sucursal.

Logica de negocio:

- Una sucursal puede funcionar como matriz o centro principal.
- La matriz se usa para reglas del negocio, por ejemplo compras centralizadas.
- La matriz no da permiso global por si sola.
- Cada sucursal puede tener direccion, ubicacion, coordenadas, cobertura y tiempo promedio de entrega.
- Cada sucursal puede registrar responsable tecnico farmaceutico y datos de licencia sanitaria.

Datos sanitarios en sucursal:

| Dato | Uso en el sistema |
| --- | --- |
| Director tecnico farmaceutico | Empleado responsable del establecimiento. Puede repetirse en varias sucursales si la empresa y la autorizacion lo permiten. |
| Licencia sanitaria | Numero de referencia administrativa del establecimiento. |
| Vencimiento de licencia | Sirve para control interno y revision administrativa. |

Flujo normal:

1. Se crea la sucursal.
2. Se registra direccion y ubicacion.
3. Se define si es matriz.
4. Se asigna responsable tecnico si aplica.
5. Se usa la sucursal en empleados, inventario, caja, ventas y reportes.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar sucursales activas, matriz, ubicacion y datos sanitarios. |
| Crear | Registrar una farmacia, bodega o punto operativo. |
| Editar | Actualizar contacto, direccion, ubicacion, cobertura o datos sanitarios. |
| Eliminar | Desactivar una sucursal que ya no opera. |

Depende de: Empresa, Personal, Departamentos y municipios.

Alimenta: Inventario, Caja, Ventas, Compras, Traslados, Call Center, Reportes.

## Personal

Personal administra empleados. Estos empleados pueden ser cajeros, encargados, compradores, bodegueros, repartidores, responsables tecnicos, administradores u otros puestos internos.

Logica de negocio:

- Un empleado puede estar asignado a una sucursal.
- Un empleado puede tener usuario para ingresar al sistema.
- Un empleado puede ser responsable tecnico de una o varias sucursales.
- Personal alimenta nomina, ventas, caja, seguridad y reportes.

Flujo normal:

1. Se registra el empleado.
2. Se asigna sucursal y datos personales.
3. Si necesita acceso, se crea usuario en Seguridad.
4. Si aplica, se usa en nomina o como responsable de sucursal/caja/venta.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar empleados registrados. |
| Crear | Registrar un nuevo empleado. |
| Editar | Actualizar datos personales, contacto, empresa o sucursal. |
| Eliminar | Desactivar empleado que ya no labora. |

Depende de: Sucursales.

Alimenta: Usuarios, Nomina, Caja, Ventas, Sucursales.

## Catalogos farmaceuticos

Los catalogos farmaceuticos ordenan la informacion base de productos. No generan operaciones por si solos, pero son necesarios para comprar, vender, almacenar y reportar medicamentos.

### Medicamentos

Medicamentos es el catalogo principal de productos. Cada medicamento puede usarse en compras, inventario, ventas, traslados, reportes y pedidos.

Logica de negocio:

- Un medicamento activo puede comprarse y venderse.
- Si se desactiva, no deberia usarse en nuevas operaciones.
- El precio, categoria, presentacion y laboratorio deben mantenerse correctos para evitar errores operativos.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar medicamentos. |
| Crear | Registrar un medicamento. |
| Editar | Actualizar datos comerciales o farmaceuticos. |
| Eliminar | Desactivar medicamento. |

Depende de: Categorias, Presentaciones, Laboratorios, Unidades.

Alimenta: Compras, Inventario, Ventas, Call Center, Reportes.

### Categorias de medicina

Clasifica medicamentos por tipo o familia. Ayuda a buscar, ordenar y reportar productos.

Acciones: Ver, Crear, Editar, Eliminar.

### Laboratorios

Registra fabricantes o laboratorios relacionados con medicamentos. Ayuda a identificar productos y analizar compras o inventario por laboratorio.

Acciones: Ver, Crear, Editar, Eliminar.

### Presentaciones

Define la forma comercial del medicamento: tableta, jarabe, ampolla, crema, frasco, caja, entre otros.

Acciones: Ver, Crear, Editar, Eliminar.

### Unidades de medida

Estandariza cantidades usadas en compra, inventario y venta.

Acciones: Ver, Crear, Editar, Eliminar.

## Proveedores

Proveedores administra las empresas o personas que abastecen medicamentos y productos.

Logica de negocio:

- Un proveedor activo puede recibir ordenes de compra.
- Las facturas de proveedor deben coincidir con compras registradas.
- Las devoluciones al proveedor se relacionan con compras y productos recibidos.

Flujo normal:

1. Se registra proveedor.
2. Se relaciona con medicamentos si aplica.
3. Compras genera ordenes al proveedor.
4. Se registra factura y pago.
5. Si hay errores o producto no aceptado, se registra devolucion.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar proveedores. |
| Crear | Registrar proveedor. |
| Editar | Actualizar datos comerciales. |
| Eliminar | Desactivar proveedor. |

Depende de: Catalogos farmaceuticos.

Alimenta: Compras, Cuentas por pagar, Reportes.

### Medicamentos por proveedor

Relaciona que medicamentos puede suministrar cada proveedor. Ayuda a compras a elegir proveedor y mantener informacion de abastecimiento.

Acciones: Ver, Crear, Editar, Eliminar.

## Inventario

Inventario controla existencias por sucursal y medicamento. Incluye consulta general, lotes, kardex, reservas, alertas, disponibilidad y ajustes.

Logica de negocio:

- El inventario se administra por sucursal.
- La existencia disponible se usa para ventas y pedidos.
- Los lotes tienen vencimiento y estado sanitario.
- Kardex registra entradas, salidas y saldo.
- Las reservas apartan producto para pedidos o compromisos.
- Los ajustes corrigen diferencias con motivo obligatorio.
- La liberacion o bloqueo sanitario exige revision tecnica con checklist minimo y queda auditada por usuario.

Estados y controles de lote:

| Estado sanitario | Significado | Efecto en venta |
| --- | --- | --- |
| Apto para venta | El lote puede venderse si no esta vencido y tiene existencia. | Permitido. |
| Inmovilizado | El lote fue bloqueado por decision sanitaria o administrativa. | No permitido. |
| Cuarentena | El lote queda separado para revision. | No permitido. |
| No apto | El lote no debe venderse. | No permitido. |

Flujo de control sanitario de lote:

1. El usuario abre Inventario.
2. Consulta los lotes de un medicamento.
3. Selecciona cambiar estado sanitario.
4. Completa checklist sanitario si va a aprobar el lote.
5. Si el estado bloquea el lote, registra motivo obligatorio.
6. El sistema impide que ese lote sea vendido o reservado.
7. Si se vuelve a marcar como apto, el lote puede volver a entrar al flujo de venta si cumple las demas condiciones.
8. Si se marca como no apto y el sistema identifica compra/recepcion origen, genera reclamo/devolucion a proveedor.

Checklist sanitario minimo para aprobar:

| Criterio | Proposito |
| --- | --- |
| Registro sanitario/documentacion verificados | Confirmar que el producto cuenta con soporte regulatorio y documental. |
| Lote coincide con factura/guia | Evitar liberar un lote distinto al documentado por proveedor. |
| Vencimiento valido | Confirmar que el lote tiene vida util suficiente para venta. |
| Empaque y sello integros | Detectar dano, manipulacion o deterioro fisico. |
| Almacenamiento/cadena de frio conforme | Validar condiciones de conservacion, especialmente productos sensibles. |

Flujo de ajuste de inventario:

1. Se selecciona producto y sucursal.
2. Se registra nueva cantidad.
3. Se ingresa motivo.
4. El sistema actualiza inventario y deja rastro en kardex.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar existencias, lotes, kardex, alertas y disponibilidad. |
| Crear | Registrar lotes, reservas o registros iniciales segun permiso. |
| Editar | Configurar stock minimo, maximo y parametros de inventario. |
| Eliminar | Cancelar o retirar registros permitidos. |
| Ajustar | Corregir stock con motivo. |
| Reservar | Apartar cantidad disponible. |
| Validacion tecnica | Cambiar estado sanitario de lote con checklist, motivo y trazabilidad. |

Depende de: Medicamentos, Sucursales, Compras, Traslados.

Alimenta: Ventas, Call Center, Reportes, Compras.

## Compras

Compras administra el abastecimiento desde solicitudes hasta pago a proveedor. Incluye solicitudes de sucursal, ordenes, aprobaciones, recepciones, validacion tecnica, facturas, pagos y devoluciones.

Logica de negocio:

- Las sucursales pueden solicitar abastecimiento.
- Compras o matriz revisa si se abastece por traslado interno o compra al proveedor.
- Las ordenes a proveedor se manejan centralizadamente segun la regla actual de matriz.
- Que una sucursal sea matriz no significa que el usuario tenga acceso global; eso depende de permisos.
- La recepcion fisica no convierte automaticamente el lote en vendible.
- La recepcion fisica crea lotes en cuarentena.
- La validacion tecnica la debe ejecutar un rol sanitario, por ejemplo Responsable Tecnico Farmaceutico o Director Tecnico.
- La validacion tecnica libera lotes aceptados al inventario o mantiene/rechaza lotes no conformes.
- Una factura puede capturarse mientras existe validacion tecnica pendiente, pero no queda aprobada ni pagable hasta resolverla.
- Un rechazo sanitario genera discrepancia y reclamo/devolucion a proveedor cuando se puede rastrear la compra origen.

Estados comunes:

| Estado | Significado |
| --- | --- |
| Borrador | Registro en preparacion. |
| Pendiente de aprobacion | Orden lista para revisar. |
| Aprobada | Orden autorizada para recepcion. |
| Parcialmente recibida | Solo parte del pedido llego o fue aceptado. |
| Recibida | La recepcion fisica se completo. |
| Validada tecnicamente | Responsable sanitario aprobo o bloqueo la recepcion. |
| Con discrepancia | Hay diferencia entre orden, recepcion o factura. |
| Facturada | Existe factura registrada. |
| Pagada | La factura fue pagada. |

Flujo completo:

1. Sucursal crea solicitud de abastecimiento.
2. Compras revisa necesidad y disponibilidad de la red.
3. Si otra sucursal puede abastecer, se puede usar traslado.
4. Si se requiere proveedor, se crea orden de compra.
5. La orden se aprueba.
6. Se recibe producto fisicamente con lote, vencimiento, cantidades aceptadas y rechazadas.
7. Los lotes aceptados fisicamente quedan en cuarentena.
8. Responsable tecnico valida checklist sanitario y decide aprobar, mantener en cuarentena, inmovilizar o rechazar.
9. Si aprueba, el lote pasa a inventario disponible; si rechaza, se genera reclamo/devolucion al proveedor cuando aplica.
10. Se registra factura y se concilia contra lo realmente aceptado y no devuelto.
11. Se paga la factura solo si quedo aprobada/conciliada.
12. Si hay producto no aceptado, rechazado o error, se registra devolucion o reclamo.

Validacion tecnica sanitaria:

| Decision | Efecto |
| --- | --- |
| Aprobar y liberar | El lote pasa de cuarentena a apto para venta y aumenta stock disponible. |
| Mantener en cuarentena | El lote queda bloqueado hasta completar investigacion o documentos. |
| Inmovilizar | El lote queda bloqueado por decision sanitaria o administrativa. |
| Rechazar | El lote queda no apto y se genera reclamo/devolucion a proveedor si se identifica origen. |

Separacion de responsabilidades:

| Rol operativo | Accion esperada |
| --- | --- |
| Bodega/recepcion | Recibir mercaderia, registrar lote, vencimiento y cantidades fisicas. |
| Responsable tecnico farmaceutico | Ejecutar validacion tecnica sanitaria y liberar o bloquear lotes. |
| Compras/administracion | Gestionar ordenes, proveedores y reclamos/devoluciones. |
| Contabilidad/tesoreria | Registrar factura y pagar solo documentos aprobados/conciliados. |

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar compras, solicitudes, ordenes y estados. |
| Crear | Registrar compra directa cuando aplique. |
| Editar | Modificar registros permitidos por estado. |
| Eliminar | Eliminar borradores o registros sin impacto irreversible. |
| Solicitar | Registrar necesidad de abastecimiento. |
| Ordenar | Crear orden al proveedor. |
| Aprobar | Autorizar orden. |
| Recibir | Registrar recepcion fisica, lote y vencimiento. |
| Validacion tecnica | Revisar checklist sanitario y liberar, inmovilizar, mantener en cuarentena o rechazar lotes. |
| Facturar | Registrar factura de proveedor. |
| Pagar | Registrar pago. |
| Devolver | Registrar devolucion al proveedor. |

Depende de: Proveedores, Medicamentos, Sucursales, Inventario.

Alimenta: Inventario, Kardex, Caja y bancos, Reportes.

## Traslados entre sucursales

Traslados mueve producto entre sucursales o entre bodega central y sucursal. Sirve para abastecer sin comprar al proveedor cuando existe producto disponible dentro de la red.

Logica de negocio:

- Todo traslado tiene origen y destino.
- La sucursal origen entrega producto.
- La sucursal destino recibe producto.
- El traslado debe respetar estados para no descontar o ingresar producto antes de tiempo.
- Usuarios locales solo deben operar traslados donde participa su sucursal, salvo permiso global.

Estados comunes:

| Estado | Significado |
| --- | --- |
| Pendiente | Solicitud creada. |
| Aceptado | Origen acepta atender. |
| Enviado | Producto salio del origen. |
| Entregado | Producto llego al destino. |
| Rechazado | Origen no atendera. |
| Cancelado | La solicitud ya no se realizara. |

Flujo:

1. Se crea solicitud de traslado.
2. Origen revisa disponibilidad.
3. Origen acepta o rechaza.
4. Si acepta, se envia producto.
5. Destino confirma entrega.
6. Inventario y kardex reflejan el movimiento.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar traslados. |
| Crear | Registrar solicitud. |
| Editar | Corregir mientras el estado lo permita. |
| Eliminar | Eliminar solicitudes permitidas. |
| Aceptar | Confirmar atencion desde origen. |
| Enviar | Marcar salida del origen. |
| Entregar | Confirmar recepcion en destino. |
| Rechazar | Negar solicitud. |
| Cancelar | Cancelar traslado. |

Depende de: Inventario, Sucursales, Compras.

Alimenta: Inventario, Kardex, Reportes.

## Ventas

Ventas registra operaciones de venta en sucursal. Requiere caja abierta, producto disponible y lotes aptos para venta.

Logica de negocio:

- La caja debe estar abierta.
- La caja debe pertenecer a la sucursal de la venta.
- El sistema valida stock suficiente.
- El sistema descuenta lotes por vencimiento mas proximo primero.
- No se venden lotes vencidos, en cuarentena, inmovilizados, no aptos, danados o sin disponibilidad.
- La venta registra pagos, recibo, detalle, kardex y movimiento de caja.

Flujo:

1. Cajero selecciona productos.
2. Sistema valida stock y lotes aptos.
3. Se calcula total.
4. Se registran pagos.
5. Se descuenta inventario.
6. Se registra kardex.
7. Se genera recibo.
8. Se actualiza caja.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar ventas y detalle. |
| Crear | Registrar venta. |
| Editar | Modificar si el estado lo permite. |
| Eliminar | Anular o eliminar si reglas lo permiten. |

Depende de: Caja del dia, Inventario, Medicamentos, Sucursales.

Alimenta: Caja, Kardex, Reportes.

## Call Center

Call Center administra pedidos recibidos por telefono u otros canales remotos. Usa disponibilidad de inventario, historial de cliente, ubicacion y entrega.

Logica de negocio:

- El pedido puede reservar inventario.
- La direccion puede validarse con geolocalizacion.
- La disponibilidad depende de sucursal y stock apto.
- Si se cancela un pedido, debe liberarse la reserva cuando aplique.

Estados comunes:

| Estado | Significado |
| --- | --- |
| Pendiente | Pedido registrado pero no completado. |
| Confirmado | Pedido validado. |
| Reservado | Producto apartado. |
| Enviado | Pedido salio a entrega. |
| Entregado | Cliente recibio pedido. |
| Cancelado | Pedido no se completara. |

Flujo:

1. Se busca o registra cliente.
2. Se busca medicamento.
3. Se consulta disponibilidad.
4. Se valida direccion/cobertura.
5. Se crea pedido.
6. Se reserva producto si aplica.
7. Se envia.
8. Se entrega o cancela.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar pedidos, disponibilidad e historial. |
| Crear | Registrar pedido. |
| Editar | Corregir datos antes del avance. |
| Eliminar | Eliminar pedido permitido. |
| Enviar | Marcar despacho. |
| Entregar | Confirmar entrega. |
| Cancelar | Cancelar pedido y liberar reservas. |

Depende de: Inventario, Sucursales, Geolocalizacion, Ventas.

## Caja del dia

Caja del dia administra la operacion diaria de efectivo por caja y sucursal. Incluye apertura, movimientos, ventas, alertas, devoluciones, conciliacion y cierre. Las funciones avanzadas de caja se entienden como parte de este modulo, no como un modulo separado.

Logica de negocio:

- Una venta presencial necesita caja abierta.
- Los ingresos por venta se acumulan en la sesion.
- Los movimientos manuales registran entradas o salidas que no vienen directamente de una venta.
- El cierre compara el dinero esperado contra el dinero contado.
- Las diferencias deben quedar registradas.
- Las alertas ayudan a detectar limite de efectivo, diferencias o movimientos pendientes.

Estados comunes:

| Estado | Significado |
| --- | --- |
| Abierta | Puede recibir ventas y movimientos. |
| Cerrada | Ya no permite nuevas operaciones. |
| Conciliada | Fue revisada contra efectivo contado. |

Flujo:

1. Se abre caja con monto inicial.
2. Se registran ventas y movimientos.
3. Se monitorean alertas y limites.
4. Se registran devoluciones si aplica.
5. Se cierra caja con monto contado.
6. Se registra diferencia si existe.
7. Se concilia o revisa en reportes.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar sesiones de caja. |
| Crear | Abrir caja. |
| Editar | Ajustar datos permitidos. |
| Eliminar | Eliminar sesiones permitidas sin movimientos. |
| Cerrar | Cerrar caja con conteo. |
| Movimiento | Registrar ingreso o egreso manual. |
| Autorizar | Autorizar diferencias o devoluciones sensibles. |
| Conciliar | Comparar esperado contra contado. |
| Reportes | Consultar resumenes de caja. |
| Auditoria | Revisar trazabilidad. |

Depende de: Cajas, Sucursales, Ventas.

Alimenta: Reportes, Auditoria, Caja y bancos.

## Cajas

Cajas administra los puntos fisicos de cobro de cada sucursal. Una caja fisica puede tener muchas sesiones de caja a lo largo del tiempo.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar cajas. |
| Crear | Registrar caja. |
| Editar | Modificar datos o limite de efectivo. |
| Eliminar | Desactivar caja. |

Depende de: Sucursales.

Alimenta: Caja del dia, Ventas.

## Tipos de movimiento de caja

Catalogo que clasifica ingresos y egresos de caja, por ejemplo venta, retiro, gasto, ajuste o pago.

Acciones: Ver, Crear, Editar, Eliminar.

## Caja y bancos

Caja y bancos administra cuentas financieras y movimientos fuera de la caja operativa diaria. Se relaciona con pagos a proveedores, movimientos financieros y control administrativo del dinero.

Logica de negocio:

- Las cuentas financieras representan bancos, cajas generales u otras fuentes.
- Los pagos a proveedores pueden registrarse desde caja o cuenta financiera.
- Los movimientos financieros deben conservar trazabilidad.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar cuentas y movimientos. |
| Crear | Registrar cuenta o movimiento. |
| Editar | Modificar datos permitidos. |
| Eliminar | Desactivar registros permitidos. |

Depende de: Compras, Caja del dia.

Alimenta: Reportes financieros.

## Nomina

Nomina administra periodos, salarios, conceptos, ajustes y pagos de empleados.

Logica de negocio:

- El empleado debe existir en Personal.
- Los conceptos definen ingresos, descuentos o ajustes.
- Los periodos ordenan el calculo por fechas.
- Los pagos registran lo que se liquida al empleado.

Flujo:

1. Se configuran puestos y conceptos.
2. Se asignan salarios.
3. Se crea periodo.
4. Se registran o calculan detalles.
5. Se aplican ajustes.
6. Se registra pago.
7. Se revisa en reportes.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar periodos, pagos y detalles. |
| Crear | Crear periodos, pagos o ajustes. |
| Editar | Modificar mientras el estado lo permita. |
| Eliminar | Eliminar registros permitidos. |

Depende de: Personal, Puestos de nomina, Conceptos de nomina.

## Puestos de nomina

Catalogo de cargos laborales usados por Recursos Humanos y planilla. No es lo mismo que roles de seguridad.

Acciones: Ver, Crear, Editar, Eliminar.

## Conceptos de nomina

Catalogo de rubros de planilla como salario, bonos, descuentos, ajustes o prestaciones.

Acciones: Ver, Crear, Editar, Eliminar.

## Activos fijos

Activos fijos controla bienes de la empresa, como mobiliario, equipo de computo, refrigeradores, estanterias o equipo asignado a sucursales.

Logica de negocio:

- Un activo puede pertenecer a una sucursal.
- Puede tener responsable, ubicacion, valor y estado.
- Los cambios importantes deben conservar historial para auditoria.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar activos. |
| Crear | Registrar activo. |
| Editar | Cambiar ubicacion, estado, responsable o valor. |
| Eliminar | Desactivar activo. |

Depende de: Sucursales, Personal.

Alimenta: Reportes.

## Reportes

Reportes permite revisar informacion consolidada o local para gerencia, encargados, auditoria, compras, inventario, caja y administracion.

Logica de negocio:

- Un usuario local consulta informacion de su alcance.
- Un usuario con permiso global consulta informacion consolidada.
- Ser usuario de matriz no da acceso global automaticamente.
- Los reportes ayudan a detectar vencimientos, bajo stock, diferencias de caja, compras, ventas y rentabilidad.

Reportes disponibles:

| Reporte | Para que sirve |
| --- | --- |
| Ventas por periodo | Analizar ventas en fechas especificas. |
| Ventas por sucursal | Comparar rendimiento entre sucursales. |
| Detalle de venta | Revisar productos, pagos y recibos. |
| Ventas por medicamento | Identificar productos vendidos. |
| Productos mas vendidos | Ver alta rotacion. |
| Productos con baja rotacion | Detectar inventario lento. |
| Inventario por sucursal | Consultar existencia local. |
| Inventario consolidado | Consultar existencia de la cadena con permiso global. |
| Medicamentos proximos a vencer | Detectar lotes con riesgo de vencimiento. |
| Medicamentos vencidos | Identificar producto que no debe venderse. |
| Stock minimo | Detectar necesidades de abastecimiento. |
| Kardex de inventario | Revisar entradas, salidas y saldos. |
| Traslados entre sucursales | Analizar movimientos internos. |
| Flujo de efectivo | Revisar entradas y salidas. |
| Cierre y diferencias de caja | Revisar cierres. |
| Compras por proveedor | Analizar abastecimiento externo. |
| Rentabilidad por sucursal | Evaluar resultados. |
| Activos fijos | Revisar bienes de la empresa. |
| Planilla | Consultar informacion de nomina. |
| Auditoria | Revisar actividad del sistema. |

Depende de: Todos los modulos operativos.

## Auditoria

Auditoria permite revisar acciones realizadas en el sistema: quien hizo algo, cuando y sobre que informacion. Sirve para control interno, investigacion de diferencias y revision de cambios sensibles.

Logica de negocio:

- No es una pantalla para operacion diaria general.
- Debe ser usada por administradores, auditoria o gerencia.
- Ayuda a revisar cambios en caja, inventario, permisos y datos criticos.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver | Consultar registros de auditoria. |
| Ver detalle | Revisar accion especifica. |
| Exportar | Descargar informacion para revision. |

## Dashboard

Dashboard muestra indicadores rapidos para supervision. Sirve para tener una vista inicial del estado del negocio sin entrar a cada pantalla.

Puede incluir informacion de ventas, inventario, vencimientos, caja, compras o alertas segun el rol.

Acciones:

| Accion | Para que sirve |
| --- | --- |
| Ver resumen | Consultar indicadores generales. |

## Funciones internas documentadas dentro de modulos

Estas funciones existen, pero no deben tratarse como modulos separados si no tienen pantalla propia.

| Funcion | Donde se explica | Motivo |
| --- | --- | --- |
| Alcance local/global | Seguridad / Permisos | Forma parte de la configuracion de permisos. |
| Cache de datos | Seguridad / Permisos | Se menciona como efecto al guardar cambios. |
| Control sanitario | Sucursales, Inventario y Compras | Se usa dentro de pantallas existentes. |
| Geolocalizacion | Sucursales y Call Center | Apoya direcciones, cobertura y entregas. |
| Movimientos de caja | Caja del dia | Son parte de la sesion de caja. |
| Alertas y conciliacion avanzada de caja | Caja del dia | Son controles del mismo flujo de caja. |
| Kardex | Inventario, Compras, Ventas y Traslados | Es trazabilidad de movimientos, no pantalla aislada de negocio. |

## Resumen de dependencias principales

| Modulo | Depende de | Alimenta |
| --- | --- | --- |
| Seguridad | Personal, roles, menus | Acceso de todo el sistema |
| Sucursales | Empresa, ubicacion, personal tecnico | Inventario, caja, ventas, compras, reportes |
| Personal | Sucursales | Usuarios, nomina, caja, ventas |
| Medicamentos | Categorias, laboratorios, presentaciones, unidades | Compras, inventario, ventas, reportes |
| Proveedores | Medicamentos por proveedor | Compras, pagos, reportes |
| Inventario | Medicamentos, sucursales, compras, traslados | Ventas, call center, reportes |
| Compras | Proveedores, medicamentos, sucursales | Inventario, pagos, reportes |
| Traslados | Inventario, sucursales | Inventario, kardex, reportes |
| Ventas | Caja abierta, inventario, medicamentos | Caja, kardex, reportes |
| Caja del dia | Cajas, sucursales, ventas | Reportes, auditoria |
| Nomina | Personal, puestos, conceptos | Reportes administrativos |
| Reportes | Todos los modulos | Gerencia, auditoria, supervision |
