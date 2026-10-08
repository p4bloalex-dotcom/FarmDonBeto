# Manual de usuario - Modulo Empresa

Fecha: 2026-10-08

## 1. Objetivo del modulo

El modulo Empresa, mostrado en el sistema como Compañía, permite registrar y actualizar los datos generales de la empresa propietaria de la farmacia o cadena de farmacias.

Esta informacion se usa como base administrativa para sucursales, reportes, identificacion institucional y configuracion general del sistema.

[img1, pantalla principal de Compañía]

## 2. Importancia dentro del sistema

Empresa es uno de los primeros modulos que deben configurarse despues de Seguridad, porque guarda la informacion principal de la organizacion.

Antes de operar sucursales, personal, inventario, compras, ventas o reportes, la empresa debe tener datos correctos.

## 3. Quienes deben usar este modulo

Este modulo debe ser usado por personal administrativo autorizado, por ejemplo:

1. Administrador del sistema.
2. Gerencia general.
3. Encargado administrativo.
4. Usuario responsable de la configuracion inicial.

No es una pantalla de uso diario para cajeros, vendedores, bodega o compras.

## 4. Informacion que administra

La pantalla Compañía administra los siguientes datos:

| Dato | Para que sirve |
| --- | --- |
| Nombre | Identifica oficialmente a la empresa dentro del sistema. |
| Departamento | Ubica geograficamente a la empresa. |
| Municipio | Completa la ubicacion segun el departamento elegido. |
| Zona especifica | Permite registrar direccion o zona de referencia. |
| Numero de telefono | Medio de contacto principal. |
| Correo electronico | Medio de contacto administrativo. |
| Logo | Imagen institucional que identifica a la empresa. |

## 5. Flujo general

El flujo normal del modulo es el siguiente:

1. El usuario ingresa a Catalogos > Compañía.
2. El sistema carga la informacion existente de la empresa, si ya fue registrada.
3. El usuario revisa o completa los campos requeridos.
4. El usuario selecciona departamento.
5. El sistema carga los municipios disponibles para ese departamento.
6. El usuario selecciona municipio.
7. El usuario completa datos de contacto.
8. El usuario carga el logo institucional.
9. El usuario presiona Guardar.
10. El sistema muestra un mensaje de operacion exitosa si la informacion fue registrada correctamente.

## 6. Acceso a la pantalla

1. Inicie sesion con un usuario autorizado.
2. Abra el menu principal.
3. Ingrese a Catalogos.
4. Seleccione Compañía.
5. Revise la informacion mostrada en pantalla.

[img2, acceso a Catalogos > Compañía]

Si el usuario no tiene permiso para ver esta pantalla, el sistema no debe permitir el acceso y mostrara un mensaje de falta de permiso.

## 7. Descripcion de la pantalla

La pantalla se presenta como un formulario unico. No contiene una tabla de registros porque normalmente la empresa se configura como una entidad principal.

La pantalla esta organizada en bloques:

| Bloque | Contenido |
| --- | --- |
| Datos generales | Nombre de la empresa. |
| Ubicacion | Departamento, municipio y zona especifica. |
| Contacto | Telefono y correo electronico. |
| Imagen | Logo de la empresa. |
| Accion final | Boton Guardar. |

## 8. Registro o actualizacion de datos

### Paso 1: revisar el nombre

1. Ubique el campo Nombre.
2. Escriba el nombre de la empresa.
3. Use el nombre con el que la organizacion sera identificada internamente.

[img3, campo Nombre de Compañía]

Regla: el nombre es obligatorio. Si queda vacio, el sistema no permite guardar.

### Paso 2: seleccionar departamento

1. Ubique el campo Departamento.
2. Abra la lista desplegable.
3. Seleccione el departamento correspondiente.
4. Espere a que el sistema cargue los municipios relacionados.

[img4, seleccion de Departamento]

Regla: el departamento es obligatorio. Sin departamento no se puede completar correctamente la ubicacion.

### Paso 3: seleccionar municipio

1. Despues de seleccionar departamento, ubique el campo Municipio.
2. Abra la lista desplegable.
3. Seleccione el municipio correspondiente.

[img5, seleccion de Municipio]

Regla: el municipio depende del departamento seleccionado. Si cambia el departamento, debe revisar que el municipio siga siendo correcto.

### Paso 4: ingresar zona especifica

1. Ubique el campo Zona especifica.
2. Escriba la direccion, zona, referencia o ubicacion administrativa de la empresa.
3. Revise que sea clara para uso interno.

[img6, campo Zona especifica]

Nota: este campo permite completar la referencia de ubicacion. Aunque la pantalla muestra validacion visual para este campo, en el comportamiento actual no bloquea el guardado como campo obligatorio.

### Paso 5: ingresar numero de telefono

1. Ubique el campo Numero de telefono.
2. Escriba solo numeros.
3. Verifique que tenga entre 8 y 11 digitos.

[img7, campo Numero de telefono]

Reglas:

| Regla | Resultado |
| --- | --- |
| Campo obligatorio | No permite guardar si esta vacio. |
| Solo numeros | No acepta letras ni simbolos como formato valido. |
| Longitud permitida | Debe tener de 8 a 11 digitos. |

Si el telefono no cumple el formato, el sistema muestra el mensaje Formato incorrecto.

### Paso 6: ingresar correo electronico

1. Ubique el campo Correo electronico.
2. Escriba el correo administrativo de la empresa.
3. Revise que tenga formato de correo valido, por ejemplo `administracion@empresa.com`.

[img8, campo Correo electronico]

Reglas:

| Regla | Resultado |
| --- | --- |
| Campo obligatorio | No permite guardar si esta vacio. |
| Formato de correo | Debe escribirse como direccion de correo valida. |

### Paso 7: cargar logo

1. Ubique el boton con icono de imagen.
2. Presione el boton para seleccionar un archivo.
3. Elija una imagen en formato JPG o PNG.
4. Confirme la seleccion.
5. Revise la vista previa que aparece debajo del boton.

[img9, carga de logo de Compañía]

Reglas:

| Regla | Resultado |
| --- | --- |
| Campo obligatorio | No permite guardar si no hay logo cargado. |
| Formatos aceptados | Solo imagen JPEG/JPG o PNG. |
| Un solo archivo | La pantalla permite seleccionar una imagen a la vez. |
| Vista previa | Al cargar correctamente, el logo se muestra en pantalla. |

Si selecciona un archivo que no es JPG o PNG, el sistema no lo carga como logo.

### Paso 8: guardar cambios

1. Revise todos los campos.
2. Confirme que no haya mensajes de error en el formulario.
3. Presione Guardar.
4. Espere el mensaje Operacion exitosa.

[img10, boton Guardar de Compañía]

El boton Guardar permanece deshabilitado mientras exista un campo obligatorio vacio o con formato incorrecto.

## 9. Validaciones del modulo

| Campo | Validacion | Mensaje o efecto |
| --- | --- | --- |
| Nombre | Obligatorio | El campo es requerido. |
| Departamento | Obligatorio | No debe quedar sin seleccion. |
| Municipio | Obligatorio | No debe quedar sin seleccion. |
| Telefono | Obligatorio | El campo es requerido. |
| Telefono | Debe tener de 8 a 11 numeros | Formato incorrecto. |
| Correo electronico | Obligatorio | El campo es requerido. |
| Correo electronico | Debe tener formato valido | El formulario no permite guardar si el formato no es valido. |
| Logo | Obligatorio | El boton Guardar permanece deshabilitado si no se carga. |
| Logo | Solo JPG o PNG | Otros formatos no son aceptados. |

## 10. Estados y comportamiento

Este modulo no maneja estados como Activo o Desactivado en la pantalla. La informacion de la empresa se guarda como configuracion general.

Comportamientos importantes:

| Situacion | Comportamiento |
| --- | --- |
| Ya existe informacion de empresa | El sistema la carga automaticamente al abrir la pantalla. |
| Se cambia el departamento | El sistema vuelve a consultar los municipios relacionados. |
| Se selecciona un departamento vacio | El sistema limpia la lista de municipios. |
| Se carga logo valido | El sistema muestra vista previa. |
| Se intenta guardar formulario incompleto | El boton Guardar permanece deshabilitado. |
| Error inesperado | El sistema muestra un mensaje indicando que se intente mas tarde. |

## 11. Reglas de negocio

1. La empresa es informacion base para la administracion general del sistema.
2. Normalmente debe existir una empresa principal configurada.
3. La informacion debe mantenerse actualizada para que sucursales y reportes se relacionen con datos correctos.
4. El departamento determina la lista de municipios disponibles.
5. El logo debe ser una imagen institucional valida en formato JPG o PNG.
6. El telefono debe ingresarse solamente con numeros.
7. El correo debe ser un correo administrativo valido.
8. Solo usuarios con permiso deben modificar esta informacion.

## 12. Errores frecuentes y solucion

### No puedo presionar Guardar

1. Revise que el nombre este completo.
2. Revise que haya seleccionado departamento.
3. Revise que haya seleccionado municipio.
4. Revise que el telefono tenga de 8 a 11 numeros.
5. Revise que el correo tenga formato correcto.
6. Revise que haya cargado un logo.

### No aparece el municipio que necesito

1. Revise que el departamento seleccionado sea correcto.
2. Cambie el departamento y vuelva a seleccionarlo si es necesario.
3. Si el municipio no existe en la lista, contacte al administrador para revisar el catalogo de ubicaciones.

### El logo no se muestra

1. Confirme que el archivo sea JPG o PNG.
2. Seleccione nuevamente el archivo.
3. Use una imagen clara y no dañada.
4. Si sigue sin mostrarse, pruebe con otra imagen.

### El telefono muestra Formato incorrecto

1. Elimine espacios, guiones, parentesis o simbolos.
2. Escriba solo numeros.
3. Verifique que tenga entre 8 y 11 digitos.

### El correo no permite guardar

1. Revise que tenga usuario, arroba y dominio.
2. Ejemplo valido: `contacto@farmacia.com`.
3. Evite espacios antes o despues del correo.

## 13. Buenas practicas

1. Use el nombre oficial o comercial definido por la empresa.
2. Mantenga actualizado el telefono administrativo.
3. Use un correo institucional, no un correo personal.
4. Use un logo limpio, legible y en buena calidad.
5. Revise la ubicacion antes de guardar.
6. No modifique estos datos sin autorizacion administrativa.
7. Despues de guardar, revise que el mensaje confirme la operacion exitosa.

## 14. Relacion con otros modulos

| Modulo relacionado | Relacion |
| --- | --- |
| Seguridad | Controla quien puede acceder y modificar Compañía. |
| Sucursales | Las sucursales pertenecen a la empresa configurada. |
| Personal | Los empleados trabajan dentro de la estructura de la empresa. |
| Reportes | La informacion administrativa puede usarse como referencia en reportes. |
| Configuracion inicial | Empresa debe configurarse antes de una operacion completa del sistema. |

## 15. Resumen secuencial

1. Entrar a Catalogos > Compañía.
2. Revisar si ya hay informacion cargada.
3. Completar nombre.
4. Seleccionar departamento.
5. Seleccionar municipio.
6. Completar zona especifica si corresponde.
7. Ingresar telefono valido.
8. Ingresar correo valido.
9. Cargar logo JPG o PNG.
10. Presionar Guardar.
11. Confirmar mensaje de operacion exitosa.
