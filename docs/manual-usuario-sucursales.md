# Manual de usuario - Modulo Sucursales

Fecha: 2026-10-08

## 1. Objetivo del modulo

El modulo Sucursales permite registrar, consultar, editar y eliminar los puntos operativos de la empresa, como farmacias, sedes o puntos de atencion.

En el sistema, las sucursales son necesarias para asociar operaciones posteriores como personal, inventario, ventas, caja, compras, traslados y reportes.

[img1, pantalla principal de Sucursales]

## 2. Importancia dentro del sistema

Sucursales sigue despues de Empresa porque cada punto operativo pertenece a la estructura general de la organizacion.

Antes de registrar empleados, cajas, inventario o ventas por ubicacion, deben existir las sucursales correspondientes.

## 3. Quienes deben usar este modulo

Este modulo debe ser usado por usuarios autorizados para administracion o configuracion, por ejemplo:

1. Administrador del sistema.
2. Gerencia o encargado administrativo.
3. Usuario responsable de configuracion de catalogos.
4. Personal autorizado para mantener informacion sanitaria y ubicacion de sucursales.

No es una pantalla de operacion diaria de caja o venta.

## 4. Pantalla principal

La pantalla principal muestra una lista de sucursales registradas.

| Columna | Explicacion |
| --- | --- |
| Nombre | Nombre de la sucursal. |
| Tipo de sucursal | Clasificacion de la sucursal. |
| Matriz | Indica si la sucursal esta marcada como matriz. |
| Telefono | Numero telefonico registrado. |
| Estado | Estado actual de la sucursal. |

[img2, tabla de sucursales]

## 5. Acciones disponibles

| Accion | Para que sirve |
| --- | --- |
| Buscar | Filtrar la lista por nombre de sucursal. |
| Crear | Registrar una nueva sucursal. |
| Editar | Actualizar datos de una sucursal existente. |
| Eliminar | Eliminar la sucursal seleccionada. |

Las acciones disponibles pueden depender de los permisos asignados al usuario.

## 6. Estados

La sucursal maneja los siguientes estados:

| Estado | Significado |
| --- | --- |
| Activo | La sucursal esta habilitada para uso normal en el sistema. |
| Desactivado | La sucursal queda marcada como no activa. |

En la pantalla el usuario selecciona Activo o Desactivado. Internamente el sistema guarda estos valores como `E` y `D`.

## 7. Tipos de sucursal

El sistema permite elegir uno de estos tipos:

| Tipo | Significado |
| --- | --- |
| Centro comercial | Sucursal registrada como punto dentro de centro comercial. |
| Stand en gasolinera | Sucursal registrada como stand o punto en gasolinera. |

Si no se cambia el tipo al crear, el sistema usa Centro comercial como valor inicial.

## 8. Flujo general del modulo

1. El usuario ingresa a Catalogos > Sucursales.
2. El sistema muestra la lista paginada de sucursales.
3. El usuario puede buscar por nombre.
4. El usuario crea, edita o elimina una sucursal segun su permiso.
5. Al guardar correctamente, el sistema muestra el mensaje Operacion exitosa.
6. La lista se actualiza con los cambios realizados.

## 9. Buscar una sucursal

1. Ingrese a Catalogos > Sucursales.
2. Ubique el campo Buscar.
3. Escriba parte del nombre de la sucursal.
4. El sistema filtra la lista por coincidencias en el nombre.

[img3, busqueda de sucursal]

Regla: la busqueda se realiza por nombre de sucursal. No filtra por telefono, estado o tipo.

## 10. Crear una sucursal

[img4, formulario Crear sucursal]

### Paso 1: abrir el formulario

1. Ingrese a Catalogos > Sucursales.
2. Presione Crear.
3. El sistema abre la ventana Crear sucursal.

### Paso 2: completar datos generales

Complete los campos principales:

| Campo | Obligatorio | Explicacion |
| --- | --- | --- |
| Nombre | Si | Nombre de la sucursal. |
| Telefono | No | Numero de contacto. |
| Correo | No | Correo de la sucursal. Debe tener formato valido si se ingresa. |
| Direccion | No | Direccion o referencia fisica. |

Reglas:

1. El nombre es obligatorio.
2. El correo no es obligatorio, pero si se llena debe tener formato de correo valido.
3. Telefono y direccion no bloquean el guardado si quedan vacios.

### Paso 3: geolocalizar la sucursal

La pantalla permite ubicar la sucursal mediante direccion o mapa.

Opcion A: Geolocalizar por direccion

1. Escriba una direccion en el campo Direccion.
2. Presione Geolocalizar sucursal.
3. Si el sistema encuentra una ubicacion, asigna latitud y longitud automaticamente.
4. Si encuentra varias coincidencias, muestra opciones para seleccionar la correcta.
5. Seleccione la coincidencia adecuada si aplica.

[img5, resultados de geolocalizacion de sucursal]

Reglas de geolocalizacion por direccion:

| Regla | Resultado |
| --- | --- |
| Direccion menor a 5 caracteres | El sistema muestra Ingrese una direccion para geolocalizar. |
| No se encuentran coordenadas | El sistema muestra que no se encontraron coordenadas. |
| Se encuentra una ubicacion | El sistema actualiza direccion, latitud y longitud. |
| Se encuentran varias opciones | El usuario puede elegir una de las coincidencias. |

Opcion B: Abrir mapa

1. Presione Abrir mapa.
2. El sistema muestra el mapa de ubicacion.
3. Seleccione un punto en el mapa o arrastre el marcador.
4. Tambien puede presionar Mi ubicacion si el navegador permite obtenerla.
5. Presione Usar para seleccionar la ubicacion en el mapa.
6. Presione Aplicar ubicacion.
7. El sistema coloca la latitud, longitud y direccion normalizada si esta disponible.

[img6, mapa de ubicacion de sucursal]

Si el mapa no esta disponible, el sistema permite ingresar latitud y longitud manualmente.

### Paso 4: seleccionar tipo de sucursal

1. Ubique el campo Tipo de sucursal.
2. Seleccione Centro comercial o Stand en gasolinera.

[img7, seleccion de tipo de sucursal]

Regla: el tipo de sucursal es obligatorio.

### Paso 5: seleccionar ubicacion administrativa

1. Seleccione Departamento.
2. El sistema carga los municipios del departamento seleccionado.
3. Seleccione Municipio.

[img8, departamento y municipio de sucursal]

Reglas:

1. Departamento y municipio pueden quedar vacios segun el comportamiento actual del formulario.
2. Si se selecciona departamento, el sistema busca los municipios relacionados.
3. El municipio disponible depende del departamento seleccionado.

### Paso 6: seleccionar estado

1. Ubique el campo Estado.
2. Seleccione Activo o Desactivado.

Regla: el estado es obligatorio. Por defecto, al crear una sucursal se inicia como Activo.

### Paso 7: marcar si es matriz

1. Ubique la casilla Es la sucursal matriz.
2. Marquela si esta sucursal debe identificarse como matriz.
3. Dejela sin marcar si es una sucursal normal.

[img9, casilla Es la sucursal matriz]

Regla importante: marcar una sucursal como matriz solo identifica esa sucursal como principal. No concede permisos globales a los usuarios. Los permisos globales se configuran en Seguridad.

### Paso 8: completar responsabilidad sanitaria

El formulario incluye una seccion llamada Responsabilidad sanitaria.

| Campo | Obligatorio | Explicacion |
| --- | --- | --- |
| Director tecnico farmaceutico | No | Empleado responsable seleccionado desde Personal. |
| Licencia sanitaria | No | Numero de licencia sanitaria. |
| Vence licencia | No | Fecha de vencimiento de la licencia sanitaria. |

[img10, seccion Responsabilidad sanitaria]

Reglas:

1. El director tecnico se selecciona desde empleados registrados en Personal.
2. Puede dejarse como Sin asignar.
3. Licencia sanitaria y vencimiento no bloquean el guardado si quedan vacios.

### Paso 9: guardar

1. Revise que los campos obligatorios esten completos.
2. Presione Guardar.
3. Si el sistema guarda correctamente, se cierra el formulario.
4. La sucursal aparece en la tabla.
5. El sistema muestra Operacion exitosa.

El boton Guardar permanece deshabilitado si el formulario tiene datos obligatorios incompletos o correo con formato incorrecto.

## 11. Editar una sucursal

[img11, formulario Editar sucursal]

1. Ingrese a Catalogos > Sucursales.
2. Busque la sucursal.
3. Presione Editar.
4. El sistema abre la ventana Editar sucursal con los datos actuales.
5. Modifique los campos necesarios.
6. Si cambia departamento, revise el municipio.
7. Si cambia direccion, puede volver a usar Geolocalizar sucursal o Abrir mapa.
8. Presione Guardar.
9. Espere el mensaje Operacion exitosa.

Reglas al editar:

1. El formulario conserva los datos actuales de la sucursal.
2. Si la sucursal ya esta marcada como matriz, la casilla se muestra protegida visualmente para evitar cambios accidentales.
3. La fecha de vencimiento de licencia se muestra en formato de fecha cuando existe informacion guardada.
4. El correo debe tener formato valido si se ingresa.

## 12. Eliminar una sucursal

[img12, formulario Eliminar sucursal]

1. Ingrese a Catalogos > Sucursales.
2. Busque la sucursal.
3. Presione Eliminar.
4. El sistema abre la ventana Eliminar sucursal.
5. Revise que sea la sucursal correcta.
6. Los campos aparecen bloqueados para evitar cambios.
7. Presione Eliminar.
8. Si el sistema confirma la operacion, la sucursal se quita de la lista.
9. El sistema muestra Operacion exitosa.

Regla de uso: antes de eliminar una sucursal, confirme que no afectara operaciones relacionadas como empleados, cajas, inventario, ventas, compras o reportes.

## 13. Validaciones del formulario

| Campo o accion | Validacion real en pantalla | Resultado |
| --- | --- | --- |
| Nombre | Obligatorio | No permite guardar si esta vacio. |
| Tipo de sucursal | Obligatorio | No permite guardar si esta vacio. |
| Estado | Obligatorio | No permite guardar si esta vacio. |
| Correo | Formato de correo | No permite guardar si el formato es invalido. |
| Direccion para geolocalizar | Minimo 5 caracteres para buscar | Muestra mensaje si es muy corta. |
| Mapa | Requiere seleccion o coordenadas | No permite aplicar ubicacion si no hay seleccion. |

Campos sin validacion obligatoria en el formulario actual:

| Campo | Comportamiento |
| --- | --- |
| Telefono | Puede quedar vacio. |
| Direccion | Puede quedar vacia. |
| Departamento | Puede quedar vacio. |
| Municipio | Puede quedar vacio. |
| Latitud y longitud | Pueden quedar vacias si no se usa mapa o geolocalizacion. |
| Director tecnico farmaceutico | Puede quedar sin asignar. |
| Licencia sanitaria | Puede quedar vacia. |
| Vence licencia | Puede quedar vacia. |

## 14. Datos de cobertura y entrega

El formulario maneja internamente estos datos con valores iniciales:

| Dato | Valor inicial |
| --- | --- |
| Radio de cobertura | 8 km. |
| Tiempo promedio de entrega | 25 minutos. |

En la pantalla actual estos valores no se muestran como campos editables para el usuario, pero forman parte de la informacion enviada al guardar.

## 15. Mensajes del sistema

| Mensaje | Cuando aparece |
| --- | --- |
| Operacion exitosa | La sucursal fue creada, editada o eliminada correctamente. |
| Error inesperado. Intenta mas tarde. | Ocurrio un error al cargar o guardar informacion. |
| Error inesperado al cargar empleados. | No se pudo cargar la lista de empleados para director tecnico. |
| Ingrese una direccion para geolocalizar. | La direccion es demasiado corta para buscar ubicacion. |
| No se encontraron coordenadas para esa direccion. | No hubo resultado de geolocalizacion. |
| Ubicacion encontrada. | El sistema encontro coordenadas y las aplico. |
| El navegador no soporta geolocalizacion. | El navegador no permite obtener ubicacion actual. |
| No se pudo obtener la ubicacion actual. | No se pudo usar Mi ubicacion. |
| Seleccione una ubicacion en el mapa. | Se intento usar ubicacion sin seleccionar punto. |

## 16. Relacion con otros modulos

| Modulo | Relacion |
| --- | --- |
| Empresa | La sucursal forma parte de la estructura de la empresa. |
| Personal | Los empleados pueden asignarse a sucursales y el director tecnico se selecciona desde Personal. |
| Seguridad | Controla quien puede ver, crear, editar o eliminar sucursales. |
| Inventario | Las existencias se administran por sucursal. |
| Caja y ventas | Las cajas y ventas operan por sucursal. |
| Compras y traslados | Las solicitudes y movimientos pueden relacionarse con sucursales. |
| Reportes | Muchos reportes se filtran o agrupan por sucursal. |

## 17. Errores frecuentes y solucion

### No puedo guardar la sucursal

1. Revise que Nombre este completo.
2. Revise que Tipo de sucursal tenga una opcion seleccionada.
3. Revise que Estado tenga Activo o Desactivado.
4. Si ingreso correo, revise que tenga formato valido.

### No aparece el municipio correcto

1. Verifique que selecciono el departamento correcto.
2. Vuelva a seleccionar el departamento para recargar municipios.
3. Si el municipio no existe en la lista, contacte al administrador para revisar catalogos de ubicacion.

### La geolocalizacion no encuentra la direccion

1. Escriba una direccion mas completa.
2. Incluya referencias como municipio, zona o ciudad.
3. Use Abrir mapa y seleccione el punto manualmente.

### El mapa no esta disponible

1. Verifique conexion a internet.
2. Use los campos manuales de latitud y longitud si aparecen.
3. Cancele y vuelva a intentar mas tarde si no cuenta con coordenadas.

### No aparece un empleado como director tecnico

1. Revise que el empleado exista en Personal.
2. Verifique que la lista de empleados haya cargado correctamente.
3. Si no aparece, contacte al administrador.

## 18. Buenas practicas

1. Use nombres claros y consistentes para cada sucursal.
2. Verifique telefono y correo antes de guardar.
3. Use geolocalizacion o mapa para ubicar sucursales con precision.
4. No marque matriz si la sucursal no cumple esa funcion administrativa.
5. Mantenga actualizada la informacion sanitaria cuando aplique.
6. Antes de eliminar, confirme que la sucursal no se usa en operaciones.
7. Revise que departamento y municipio coincidan con la direccion.

## 19. Resumen secuencial

1. Entrar a Catalogos > Sucursales.
2. Buscar si la sucursal ya existe.
3. Presionar Crear si no existe.
4. Completar nombre.
5. Completar telefono, correo y direccion si aplica.
6. Geolocalizar por direccion o seleccionar en mapa si se requiere ubicacion.
7. Seleccionar tipo de sucursal.
8. Seleccionar departamento y municipio si aplica.
9. Seleccionar estado.
10. Marcar matriz solo si corresponde.
11. Completar responsabilidad sanitaria si aplica.
12. Presionar Guardar.
13. Confirmar que aparezca Operacion exitosa.
