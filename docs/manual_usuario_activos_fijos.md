# Manual de usuario final: Activos fijos

Fecha de revision: 8 de octubre de 2026.

Este manual explica el uso del modulo **Activos fijos** para el usuario que opera el sistema. El contenido se basa en las pantallas del frontend y en las reglas implementadas en el backend.

## 1. Objetivo del modulo

El modulo **Activos fijos** permite registrar, consultar, editar, trasladar y dar de baja los bienes de uso de la empresa, por ejemplo equipo de computo, vehiculos, refrigeradores, mobiliario, lectores u otros activos.

El modulo conserva informacion de identificacion, asignacion, compra, valor en libros, condicion, estado e historial de movimientos del activo.

[img1, pantalla principal de Activos fijos]

## 2. Ubicacion en el sistema

Ruta funcional: **Operaciones > Activos fijos**.

Ruta tecnica de pantalla: `fixed-asset`.

Nombre de permiso/controlador: `FixedAsset`.

Categoria de permisos: `Operation`.

## 3. Usuarios que lo utilizan

Este modulo puede ser utilizado por usuarios responsables del control de bienes, administracion, gerencia, inventario interno o personal autorizado por la empresa.

El sistema no asigna acceso por puesto automaticamente. El acceso depende de la configuracion del modulo de seguridad: usuario, rol, menu y permisos.

## 4. Roles, puestos y matriz de permisos

### Roles

Los roles se configuran en seguridad. Para usar este modulo, el rol del usuario debe tener acceso al menu **Activos fijos** y a las acciones necesarias.

Roles sugeridos para operacion:

| Rol sugerido | Uso esperado |
| --- | --- |
| Administrador | Acceso completo al modulo. |
| Encargado de activos | Registro, edicion, traslado y baja de activos. |
| Gerencia o auditoria | Consulta y revision de activos e historial. |
| Usuario de sucursal | Consulta limitada o registro operativo, segun politica interna. |

Estos nombres son sugeridos. El sistema valida permisos por rol configurado, no por el nombre exacto del rol.

### Puestos

El puesto laboral del empleado sirve como referencia organizativa, pero no concede permisos por si mismo.

Ejemplos de puestos relacionados:

| Puesto | Relacion con el modulo |
| --- | --- |
| Administrador de sucursal | Puede reportar o consultar activos asignados a su sucursal. |
| Encargado administrativo | Puede registrar bienes, responsables y ubicaciones. |
| Gerente | Puede revisar costo, valor en libros, bajas e historial. |
| Auditor | Puede consultar informacion e historial. |

### Matriz de permisos del modulo

| Permiso | Accion que habilita | Observacion |
| --- | --- | --- |
| `FixedAsset.Ver` | Ver listado, detalle e historial. | Requerido para consultar activos. |
| `FixedAsset.Crear` | Registrar nuevos activos. | Requerido para el boton **Nuevo**. |
| `FixedAsset.Editar` | Editar, cambiar estado permitido, trasladar y dar de baja. | La baja usa una accion controlada, no una eliminacion directa. |
| `FixedAsset.Eliminar` | Permiso CRUD registrado por seguridad. | En la pantalla actual no hay eliminacion fisica directa; la accion visible es **Dar de baja**. |

Si el usuario no tiene permiso para una accion, el sistema puede bloquear la operacion con el mensaje: **No tienes permiso para esta accion.**

## 5. Dependencias con otros modulos y catalogos

### Dependencias obligatorias

| Dependencia | Para que se usa |
| --- | --- |
| Seguridad | Controla acceso al menu y permisos de ver, crear y editar. |
| Sucursales | Todo activo debe estar asignado a una sucursal activa. |
| Usuarios | El sistema guarda el usuario que ejecuta cambios cuando esta disponible. |

### Dependencias funcionales

| Dependencia | Relacion |
| --- | --- |
| Empresa | La sucursal pertenece a la estructura de la empresa. |
| Personal | El campo responsable se registra como texto; no esta obligado a seleccionar un empleado del catalogo. |
| Auditoria | Las acciones del sistema pueden registrarse segun la configuracion general de auditoria. |

### Catalogos y mantenimientos relacionados

| Catalogo o mantenimiento | Relacion con activos fijos |
| --- | --- |
| Sucursales | Necesario para asignar y trasladar activos. |
| Usuarios y roles | Necesarios para definir quien puede operar el modulo. |
| Menus y permisos | Necesarios para mostrar el acceso y permitir acciones. |

El modulo no depende de ventas, compras, inventario de medicamentos, caja ni nomina para registrar un activo fijo.

## 6. Pantalla principal

La pantalla principal muestra el listado de activos y accesos a las acciones disponibles.

[img2, listado de activos fijos]

Columnas principales:

| Columna | Descripcion |
| --- | --- |
| Codigo | Identificador interno, codigo o placa del activo. |
| Activo | Nombre del activo. |
| Sucursal | Sucursal donde esta asignado. |
| Categoria | Tipo general del activo. |
| Costo | Costo de compra registrado. |
| Valor libros | Costo menos depreciacion calculada. |
| Estado | Activo, mantenimiento o baja. |

Indicadores superiores:

| Indicador | Significado |
| --- | --- |
| Activos | Cantidad de activos con estado activo dentro de los datos filtrados. |
| Costo | Suma del costo de compra de los activos filtrados. |
| Valor libros | Suma del valor actual en libros de los activos filtrados. |
| Bajas | Cantidad de activos dados de baja dentro de los datos filtrados. |

## 7. Busqueda y filtros

La pantalla permite buscar activos por texto y aplicar filtros.

Busqueda rapida:

El campo de busqueda permite localizar por codigo, activo, sucursal, categoria, marca, modelo, numero de serie, ubicacion o responsable.

Filtros disponibles:

| Filtro | Opciones |
| --- | --- |
| Sucursal | Todas o una sucursal especifica. |
| Categoria | Todas o una categoria detectada en los datos. |
| Estado | Todos, activo, mantenimiento o dado de baja. |

Botones rapidos de estado:

| Boton | Resultado |
| --- | --- |
| Activos | Muestra activos con estado `E`. |
| Mantenimiento | Muestra activos con estado `M`. |
| Bajas | Muestra activos con estado `D`. |

El boton **Limpiar** borra filtros y busqueda.

## 8. Registrar un nuevo activo fijo

Para registrar un activo:

1. Ingrese a **Operaciones > Activos fijos**.
2. Presione **Nuevo**.
3. Complete los datos requeridos.
4. Revise el valor calculado.
5. Presione **Guardar**.

[img3, formulario de nuevo activo fijo]

### Seccion Identificacion

| Campo | Requerido | Regla |
| --- | --- | --- |
| Codigo / placa | Si | Maximo 40 caracteres. No puede repetirse en otro activo vigente. |
| Categoria | Si | Debe seleccionar una categoria disponible. |
| Nombre | Si | Maximo 120 caracteres. |
| Marca | No | Maximo 80 caracteres. |
| Modelo | No | Maximo 80 caracteres. |
| Numero de serie | No | Maximo 80 caracteres. |

Categorias disponibles en pantalla:

| Categoria |
| --- |
| Equipo de computo |
| Vehiculo |
| Refrigeracion |
| Mobiliario |
| Lector |
| Otro |

Reglas automaticas de la pantalla:

- Si el nombre esta vacio, puede sugerirse con categoria, marca y modelo.
- Si el codigo esta vacio y se ingresa numero de serie, el sistema puede sugerir el codigo usando el numero de serie en mayusculas.

### Seccion Asignacion

| Campo | Requerido | Regla |
| --- | --- | --- |
| Sucursal | Si | Debe existir y estar activa. |
| Ubicacion | No | Maximo 120 caracteres. |
| Responsable | No | Maximo 120 caracteres. |

La sucursal es obligatoria. Si solo existe una sucursal disponible, la pantalla puede seleccionarla automaticamente.

### Seccion Compra

| Campo | Requerido | Regla |
| --- | --- | --- |
| Fecha compra | Si | Debe ser una fecha valida. |
| Costo compra | Si | Debe ser numerico y mayor o igual a 0. |
| Proveedor | No | Maximo 120 caracteres. |
| Vida util (meses) | No | Si se ingresa, debe ser entero y mayor o igual a 1. |

El boton **Usar fecha de hoy** coloca la fecha actual como fecha de compra.

Vida util sugerida por categoria:

| Categoria | Vida util sugerida |
| --- | --- |
| Equipo de computo | 36 meses |
| Vehiculo | 60 meses |
| Refrigeracion | 60 meses |
| Mobiliario | 60 meses |
| Lector | 36 meses |
| Otro | 36 meses |

La vida util se sugiere cuando el campo esta vacio. El usuario puede modificarla antes de guardar.

### Datos adicionales por categoria

Algunas categorias muestran campos adicionales.

| Categoria | Campos adicionales |
| --- | --- |
| Vehiculo | Placa, anio, kilometraje. |
| Equipo de computo | Procesador, RAM, almacenamiento. |
| Refrigeracion | Capacidad, temperatura minima, temperatura maxima. |

Estos datos se guardan como atributos adicionales del activo.

### Estado y condicion inicial

| Campo | Valores |
| --- | --- |
| Estado | Activo, En mantenimiento. |
| Condicion | Bueno, Regular, Malo. |

Al crear un activo, no se permite registrar directamente el estado **Dado de baja**. Para eso se debe usar la baja controlada desde el listado.

## 9. Ver detalle de un activo

Para consultar un activo:

1. Ubique el activo en el listado.
2. Abra la accion **Ver detalle**.
3. Revise los datos registrados.

[img4, detalle de activo fijo]

En modo detalle los campos se muestran solo para lectura. Si el activo esta dado de baja, el detalle puede mostrar el estado **Dado de baja**.

## 10. Editar un activo

Para editar:

1. Ubique el activo.
2. Seleccione **Editar**.
3. Modifique los datos permitidos.
4. Presione **Guardar**.

Reglas de edicion:

- No se puede editar un activo dado de baja.
- No se puede cambiar el estado a **Dado de baja** desde edicion normal.
- Si se cambia sucursal, ubicacion o responsable, el sistema registra un historial de asignacion.
- El codigo no puede duplicarse con otro activo vigente.
- La sucursal debe existir y estar activa.

Mensaje esperado al guardar correctamente: **Activo fijo actualizado correctamente.**

## 11. Trasladar un activo

El traslado permite cambiar sucursal, ubicacion o responsable de un activo activo.

Para trasladar:

1. Ubique el activo.
2. Seleccione **Trasladar**.
3. Indique sucursal destino, ubicacion, responsable y motivo.
4. Presione **Guardar**.

[img5, dialogo de traslado de activo fijo]

Reglas de traslado:

- Solo se pueden trasladar activos con estado **Activo**.
- La sucursal destino debe existir y estar activa.
- El motivo es obligatorio y debe tener al menos 5 caracteres.
- Si sucursal, ubicacion y responsable son iguales a los actuales, el sistema no registra el traslado.

Motivos rapidos disponibles:

| Boton | Motivo aplicado |
| --- | --- |
| Necesidad operativa | Reasignacion por necesidad operativa. |
| Reubicacion | Reubicacion por inventario de activos. |

Mensaje esperado al guardar correctamente: **Traslado registrado correctamente.**

## 12. Dar de baja un activo

La baja controlada retira un activo de la operacion sin eliminar su historial.

Para dar de baja:

1. Ubique el activo.
2. Seleccione **Dar de baja**.
3. Ingrese el motivo.
4. Presione **Dar de baja**.

[img6, dialogo para dar de baja activo fijo]

Reglas de baja:

- No se elimina fisicamente el activo.
- El estado cambia a **Dado de baja**.
- Se registra fecha de baja.
- Se registra motivo de baja.
- Se crea historial con accion de baja.
- Si el activo ya fue dado de baja, no puede darse de baja nuevamente.
- El motivo es obligatorio y debe tener al menos 5 caracteres.

Motivos rapidos disponibles:

| Boton | Motivo aplicado |
| --- | --- |
| Obsoleto | Activo obsoleto, no apto para operacion. |
| Danado | Activo danado, reparacion no rentable. |
| Extraviado | Activo extraviado segun revision de inventario. |

Mensaje esperado al guardar correctamente: **Activo dado de baja correctamente.**

## 13. Historial del activo

El historial registra eventos relevantes del activo.

Para visualizarlo:

1. Ubique el activo en el listado.
2. Seleccione la accion **Historial**.
3. Revise el modal con las asignaciones, traslados o bajas registradas.

Acciones de historial implementadas:

| Accion interna | Como se muestra | Cuando se genera |
| --- | --- | --- |
| `ASSIGNMENT` | Asignacion | Cuando al editar cambia sucursal, ubicacion o responsable. |
| `TRANSFERRED` | Asignacion | Cuando se usa la accion trasladar. |
| `RETIRED` | Baja | Cuando se da de baja el activo. |

Datos visibles en historial:

| Dato | Descripcion |
| --- | --- |
| Fecha | Fecha en que se registro la accion. |
| Accion | Tipo de movimiento del activo. |
| Origen | Sucursal anterior, si aplica. |
| Destino | Sucursal nueva, si aplica. |
| Responsable | Responsable nuevo, si aplica. |
| Motivo | Justificacion registrada. |

[img7, historial de activo fijo]

## 14. Estados del activo

| Estado visible | Codigo | Significado | Reglas principales |
| --- | --- | --- | --- |
| Activo | `E` | Activo disponible para uso operativo. | Puede editarse, trasladarse y darse de baja. |
| En mantenimiento | `M` | Activo temporalmente fuera de uso normal por mantenimiento. | Puede editarse, pero no puede trasladarse mediante la accion de traslado si no esta activo. |
| Dado de baja | `D` | Activo retirado de la operacion. | No puede editarse ni darse de baja otra vez. |

Regla importante: el estado **Dado de baja** no se asigna desde el formulario normal. Debe usarse la opcion **Dar de baja** para obligar a registrar fecha y motivo.

## 15. Condicion del activo

La condicion describe el estado fisico o funcional del activo.

| Condicion | Uso sugerido |
| --- | --- |
| Bueno | El activo funciona correctamente. |
| Regular | El activo funciona, pero presenta desgaste o requiere seguimiento. |
| Malo | El activo esta deteriorado o tiene problemas importantes. |

La condicion no reemplaza al estado. Un activo puede estar activo y en condicion regular, o estar en mantenimiento por revision.

## 16. Calculo de depreciacion y valor en libros

El sistema calcula una depreciacion acumulada estimada con estos datos:

| Dato | Uso |
| --- | --- |
| Costo compra | Base del calculo. |
| Fecha compra | Fecha desde la que se cuentan los meses transcurridos. |
| Vida util en meses | Periodo para distribuir el costo. |

Regla de calculo:

- Si falta costo, vida util o fecha de compra valida, la depreciacion es 0.
- La depreciacion se calcula por meses transcurridos desde la fecha de compra.
- La depreciacion no puede superar el costo de compra.
- El valor en libros es: costo de compra menos depreciacion acumulada.
- El valor en libros nunca baja de 0.

Este calculo es operativo dentro del sistema. Si la empresa requiere reglas contables especificas, debe validarlas con su area contable.

## 17. Validaciones generales

| Validacion | Mensaje o efecto |
| --- | --- |
| Sucursal inexistente o desactivada | No permite guardar. |
| Codigo duplicado | No permite guardar. |
| Intentar crear activo dado de baja | Solicita usar baja controlada. |
| Intentar editar activo dado de baja | No permite editar. |
| Intentar cambiar estado a baja desde edicion | Solicita usar baja controlada. |
| Intentar trasladar activo no activo | No permite trasladar. |
| Traslado sin cambios reales | No registra movimiento. |
| Motivo de baja corto o vacio | No permite confirmar baja. |
| Motivo de traslado corto o vacio | No permite confirmar traslado. |

Mensajes posibles:

| Situacion | Mensaje |
| --- | --- |
| Sucursal invalida | La sucursal seleccionada no existe o esta desactivada. |
| Codigo repetido | El codigo del activo ya existe. |
| Baja desde formulario normal | Use la baja controlada para registrar fecha y motivo de baja. |
| Edicion de activo dado de baja | No se puede editar un activo dado de baja. |
| Estado repetido | El activo ya tiene ese estado. |
| Traslado de activo no activo | Solo se pueden trasladar activos activos. |
| Sin cambios en traslado | No hay cambios de traslado para registrar. |

## 18. Logica de negocio resumida

- Todo activo debe pertenecer a una sucursal activa.
- Todo activo debe tener codigo, nombre, categoria, fecha de compra y costo de compra.
- El codigo identifica al activo y no debe repetirse entre activos vigentes.
- La baja no elimina el activo; lo marca como retirado y conserva historial.
- Los cambios de asignacion quedan registrados cuando cambia sucursal, ubicacion o responsable.
- Los traslados requieren motivo y solo aplican a activos activos.
- La depreciacion y valor en libros se calculan automaticamente a partir de costo, fecha y vida util.
- El responsable se registra como texto operativo; no valida obligatoriamente contra el catalogo de empleados.
- La seguridad del modulo depende de rol, menu y permisos configurados en seguridad.

## 19. Flujo recomendado de operacion

1. Verificar que la sucursal exista y este activa.
2. Registrar el activo con codigo unico y datos de compra.
3. Asignar ubicacion y responsable.
4. Mantener actualizada la condicion.
5. Usar **Trasladar** cuando cambie de sucursal, ubicacion o responsable por movimiento operativo.
6. Usar **Dar de baja** cuando el activo ya no sea utilizable, este obsoleto, danado o extraviado.
7. Revisar el historial para auditoria o control interno.

## 20. Errores frecuentes y solucion

| Problema | Causa probable | Solucion |
| --- | --- | --- |
| No aparece el modulo | Falta menu o permiso en seguridad. | Revisar rol, menu y permisos. |
| No permite guardar | Faltan campos requeridos. | Completar codigo, nombre, categoria, sucursal, fecha y costo. |
| Dice que el codigo ya existe | Ya hay un activo vigente con el mismo codigo. | Usar un codigo unico o revisar el activo existente. |
| No se puede trasladar | El activo no esta en estado activo. | Cambiar estado si corresponde o revisar si debe darse de baja. |
| No se puede dar de baja | Motivo vacio o muy corto. | Ingresar motivo de al menos 5 caracteres. |
| No se puede editar | El activo ya esta dado de baja. | Consultar detalle e historial; no modificar activos retirados. |

## 21. Alcance y limites actuales

- No existe eliminacion fisica visible desde la pantalla; la salida operativa es la baja controlada.
- No hay seleccion obligatoria de empleado para responsable; el responsable se escribe manualmente.
- No hay catalogo independiente de categorias de activos; las categorias estan definidas en la pantalla.
- No se identifico dependencia directa con compras para crear activos a partir de una factura.
- El calculo de depreciacion es automatico y general; no sustituye una politica contable formal si la empresa necesita reglas especificas.
