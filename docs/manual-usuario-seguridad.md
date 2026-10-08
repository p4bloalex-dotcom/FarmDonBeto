# Manual de usuario - Modulo Seguridad

Fecha: 2026-10-08

## 1. Objetivo del modulo

El modulo Seguridad permite administrar quienes pueden ingresar al sistema, que opciones ven en el menu y que acciones pueden realizar dentro de cada pantalla.

Este modulo debe configurarse antes de entregar acceso a los usuarios operativos, porque de el dependen los permisos para compras, inventario, ventas, caja, reportes y administracion.

[img1, pantalla principal del modulo Seguridad]

## 2. Opciones del modulo

El modulo Seguridad incluye estas pantallas:

| Pantalla | Para que sirve |
| --- | --- |
| Roles | Crear y mantener perfiles de acceso. |
| Menus | Consultar y administrar opciones visibles del sistema. |
| Asignar menus | Definir que menus puede ver cada rol. |
| Asignar permisos | Definir que acciones puede realizar cada rol dentro de cada menu. |
| Usuarios | Crear cuentas de acceso y vincularlas con empleados y roles. |

## 3. Conceptos importantes

### Usuario

Es la cuenta que usa una persona para entrar al sistema. Cada usuario se relaciona con un empleado registrado en Personal y con un rol.

### Rol

Es un perfil de acceso. El rol agrupa menus y permisos. Ejemplos: Administrador, Cajero, Encargado de sucursal, Compras, Auditoria o Responsable tecnico.

### Menu

Es una opcion de navegacion. Si un menu no esta asignado al rol, el usuario no lo vera en el sistema.

### Permiso

Es una accion permitida dentro de una pantalla. Por ejemplo: Ver, Crear, Editar, Eliminar, Aprobar, Recibir, Pagar o Validacion tecnica.

### Acceso local y global

El permiso local limita la informacion al alcance normal del usuario, normalmente su sucursal o las operaciones donde participa su sucursal.

El permiso global permite trabajar con informacion consolidada o de varias sucursales cuando la pantalla lo permite.

Importante: trabajar en una sucursal matriz no significa tener acceso global. El acceso global se concede desde permisos.

## 4. Estados utilizados

| Estado | Significado para el usuario |
| --- | --- |
| Activo | El registro puede usarse normalmente. En usuarios, permite operar si las demas condiciones de acceso son correctas. |
| Desactivado | El registro queda inhabilitado para uso normal. En usuarios, impide que la cuenta sea utilizada segun las reglas del sistema. |

En la pantalla se muestran internamente como `E` para Activo y `D` para Desactivado, pero el usuario debe interpretarlos como Activo y Desactivado.

## 5. Flujo recomendado de configuracion

El orden recomendado para configurar Seguridad es el siguiente:

1. Registrar o revisar los empleados en el modulo Personal.
2. Crear los roles necesarios en Seguridad > Roles.
3. Revisar que los menus existan en Seguridad > Menus.
4. Asignar menus a cada rol en Seguridad > Asignar menus.
5. Asignar acciones permitidas en Seguridad > Asignar permisos.
6. Crear usuarios en Seguridad > Usuarios.
7. Probar el ingreso con un usuario del rol configurado.
8. Ajustar menus o permisos si el usuario ve menos o mas opciones de las necesarias.

## 6. Pantalla Roles

[img2, pantalla Roles]

### Para que se usa

La pantalla Roles permite crear perfiles de acceso. Un rol no es necesariamente el puesto laboral del empleado; es el conjunto de permisos que tendra dentro del sistema.

### Informacion que muestra

| Campo | Explicacion |
| --- | --- |
| Nombre | Nombre del rol. |
| Estado | Indica si el rol esta activo o desactivado. |

### Crear un rol

1. Ingrese a Seguridad > Roles.
2. Presione Crear, si la opcion esta disponible para su usuario.
3. Escriba el nombre del rol.
4. Seleccione el estado Activo.
5. Presione Crear.
6. El sistema mostrara un mensaje de operacion exitosa si el registro fue guardado.

[img3, formulario para crear rol]

### Editar un rol

1. Ingrese a Seguridad > Roles.
2. Busque el rol en la lista.
3. Presione la accion Editar.
4. Cambie el nombre o estado segun corresponda.
5. Presione Guardar.
6. Verifique que el cambio aparezca en la lista.

### Eliminar un rol

1. Ingrese a Seguridad > Roles.
2. Ubique el rol que desea eliminar.
3. Presione Eliminar.
4. Revise los datos mostrados en la ventana de confirmacion.
5. Presione Eliminar para confirmar.

Regla de uso: no elimine ni desactive roles que aun tengan usuarios operando, salvo que el cambio haya sido planificado.

### Validaciones de Roles

| Validacion | Resultado |
| --- | --- |
| Nombre obligatorio | No permite guardar si el nombre esta vacio. |
| Estado obligatorio | No permite guardar si no se selecciona Activo o Desactivado. |
| Error del sistema | Muestra un mensaje de error y no confirma la operacion. |

## 7. Pantalla Menus

[img4, pantalla Menus]

### Para que se usa

La pantalla Menus permite consultar las opciones de navegacion disponibles en el sistema. Desde esta pantalla tambien se puede editar o cambiar el estado de un menu si el usuario tiene permiso.

### Informacion que muestra

| Campo | Explicacion |
| --- | --- |
| Nombre | Nombre visible del menu. |
| Icono | Icono usado en la navegacion. |
| Ruta | Direccion interna de la pantalla. |
| Estado | Activo o desactivado. |
| Orden | Posicion en la que aparece el menu. |

### Buscar un menu

1. Ingrese a Seguridad > Menus.
2. Use el campo Buscar.
3. Escriba parte del nombre, ruta o icono.
4. Revise los resultados filtrados.

### Editar o cambiar estado de un menu

1. Ingrese a Seguridad > Menus.
2. Ubique el menu requerido.
3. Presione Editar o Cambiar estado.
4. Realice el ajuste permitido.
5. Guarde los cambios.

Regla de uso: desactivar un menu puede hacer que los usuarios dejen de ver una pantalla, aunque tengan permisos configurados.

## 8. Pantalla Asignar menus

[img5, pantalla Asignar menus]

### Para que se usa

Esta pantalla define que menus puede ver cada rol. Es el primer filtro de navegacion: si un rol no tiene asignado un menu, el usuario no lo vera en su panel.

### Asignar menus a un rol

1. Ingrese a Seguridad > Asignar menus.
2. En el campo Seleccione el rol, elija el rol que desea configurar.
3. Presione Buscar.
4. El sistema cargara la lista de menus disponibles.
5. Marque los menus que el rol debe ver.
6. Desmarque los menus que el rol no debe ver.
7. Presione Guardar cambios.
8. Espere el mensaje Menus actualizados correctamente.

[img6, seleccion de menus por rol]

### Reglas de Asignar menus

| Regla | Explicacion |
| --- | --- |
| Debe seleccionar un rol | El boton Buscar permanece deshabilitado hasta elegir un rol. |
| Solo se guardan cambios realizados | El boton Guardar cambios aparece cuando se marca o desmarca al menos un menu. |
| Ver menu no concede acciones | Despues de asignar menus, tambien debe configurar permisos. |
| Menu padre e hijo | Algunos menus se muestran con jerarquia, por ejemplo Categoria > Pantalla. |

## 9. Pantalla Asignar permisos

[img7, pantalla Asignar permisos]

### Para que se usa

Esta pantalla define que acciones puede ejecutar un rol dentro de los menus que tiene asignados.

### Consultar permisos de un rol

1. Ingrese a Seguridad > Asignar permisos.
2. Seleccione el rol.
3. Presione Buscar.
4. El sistema mostrara las categorias y menus habilitados para ese rol.
5. Abra cada categoria para revisar sus acciones.

### Marcar permisos individuales

1. Busque la pantalla que desea configurar.
2. En cada accion, marque Acceso si el rol puede realizarla.
3. Marque Global solo si esa accion debe trabajar con informacion de varias sucursales o alcance consolidado.
4. Repita el proceso para todas las acciones necesarias.
5. Presione Guardar.
6. Verifique el mensaje de confirmacion.

[img8, permisos Acceso y Global]

### Marcar o desmarcar acciones en grupo

1. Abra el menu que desea configurar.
2. Presione Marcar acciones para activar todas las acciones visibles del menu.
3. Presione Desmarcar acciones para quitar todas las acciones visibles del menu.
4. Use Marcar global si todas las acciones del menu deben tener alcance global.
5. Use Desmarcar global si desea retirar el alcance global de todas las acciones del menu.
6. Presione Guardar.

### Reglas de permisos

| Regla | Explicacion |
| --- | --- |
| Primero menus, luego permisos | Solo se muestran permisos de los menus asignados al rol. |
| Acceso habilita la accion | Si Acceso no esta marcado, el rol no debe ejecutar esa accion. |
| Global amplia el alcance | Global no significa que la accion exista; solo amplia el alcance cuando la accion esta permitida. |
| Cambios pendientes | El boton Guardar muestra la cantidad de cambios pendientes. |
| Sin cambios | Si no hay cambios, el boton Guardar permanece deshabilitado. |

## 10. Pantalla Usuarios

[img9, pantalla Usuarios]

### Para que se usa

La pantalla Usuarios permite crear y administrar las cuentas de acceso. Cada usuario se vincula con un empleado y con un rol.

### Informacion que muestra

| Campo | Explicacion |
| --- | --- |
| Nombre personal | Empleado vinculado al usuario. |
| Nombre de usuario | Cuenta usada para ingresar. |
| Rol | Perfil de acceso asignado. |
| Ultimo logeo | Ultima fecha u hora de ingreso registrada. |
| Estado | Activo o desactivado. |

### Crear un usuario

1. Verifique que el empleado exista en el modulo Personal.
2. Verifique que el rol ya tenga menus y permisos configurados.
3. Ingrese a Seguridad > Usuarios.
4. Presione Crear, si la opcion esta disponible para su usuario.
5. Seleccione el empleado en el campo Personal.
6. Seleccione el Rol.
7. Seleccione Estado Activo.
8. Presione Crear.
9. El sistema mostrara un mensaje de operacion exitosa.

[img10, formulario para crear usuario]

### Editar un usuario

1. Ingrese a Seguridad > Usuarios.
2. Ubique el usuario en la lista.
3. Presione Editar.
4. Cambie el rol o el estado permitido.
5. Presione Guardar.
6. Verifique que la lista muestre el cambio.

Regla de uso: al editar un usuario, el empleado asociado queda bloqueado en el formulario para evitar cambiar la identidad de la cuenta por error.

### Eliminar un usuario

1. Ingrese a Seguridad > Usuarios.
2. Ubique el usuario.
3. Presione Eliminar.
4. Revise la informacion mostrada.
5. Presione Eliminar para confirmar.

Regla de uso: use eliminar o desactivar cuando una persona ya no debe operar. No comparta la cuenta con otro empleado.

### Resetear contraseña

1. Ingrese a Seguridad > Usuarios.
2. Ubique el usuario.
3. Presione Resetear contraseña.
4. Revise que corresponde al usuario correcto.
5. Presione Resetear.
6. Informe al usuario el procedimiento interno para ingresar con la nueva contraseña o cambiarla, segun la politica definida por la empresa.

[img11, confirmacion para resetear contraseña]

### Validaciones de Usuarios

| Validacion | Resultado |
| --- | --- |
| Personal obligatorio | No permite guardar si no se selecciona empleado. |
| Rol obligatorio | No permite guardar si no se selecciona rol. |
| Estado obligatorio | No permite guardar si no se selecciona Activo o Desactivado. |
| Campos bloqueados | En edicion, eliminacion o reseteo, algunos campos se bloquean para evitar cambios accidentales. |

## 11. Ingreso y control de acceso

Cuando un usuario inicia sesion, el sistema valida sus datos de acceso. Si el ingreso es correcto, carga su informacion de usuario y aplica los permisos configurados.

El sistema tambien valida el permiso Ver al intentar abrir una pantalla. Si el usuario no tiene permiso para verla, se muestra un mensaje indicando que no tiene permiso y se redirige al inicio.

[img12, mensaje de usuario sin permiso]

## 12. Casos frecuentes

### El usuario no ve una pantalla

1. Revise que el usuario tenga el rol correcto.
2. Revise en Asignar menus que el menu este marcado para ese rol.
3. Revise en Asignar permisos que la accion Ver este marcada para ese rol.
4. Pida al usuario cerrar sesion y volver a ingresar si el menu no se actualiza de inmediato.

### El usuario ve la pantalla pero no puede operar

1. Revise que tenga marcada la accion correspondiente, por ejemplo Crear, Editar, Aprobar o Pagar.
2. Revise si la accion requiere alcance Global.
3. Guarde los cambios y pruebe nuevamente.

### El usuario necesita ver varias sucursales

1. Identifique la pantalla donde necesita trabajar con varias sucursales.
2. Ingrese a Asignar permisos.
3. Busque el rol.
4. Marque Global en la accion correspondiente.
5. Guarde cambios.

### Se cambio un permiso pero el usuario no ve el cambio

1. Confirme que el permiso fue guardado correctamente.
2. Verifique que se configuro el rol correcto.
3. Pida al usuario cerrar sesion y entrar de nuevo.
4. Si continua el problema, contacte al administrador del sistema.

## 13. Recomendaciones operativas

1. Cree roles por responsabilidad real, no por persona.
2. Evite dar permisos globales si el usuario solo trabaja con una sucursal.
3. Revise los permisos antes de crear usuarios nuevos.
4. Desactive usuarios de empleados que ya no laboran.
5. No comparta cuentas entre empleados.
6. Use roles separados para administracion, caja, compras, inventario, auditoria y responsable tecnico.
7. Revise periodicamente los usuarios activos y sus roles.
8. Antes de eliminar o desactivar un rol, confirme que ningun usuario operativo depende de el.

## 14. Resumen del flujo completo

1. Personal registra el empleado.
2. Seguridad crea o revisa el rol.
3. Seguridad asigna menus visibles al rol.
4. Seguridad asigna permisos de acciones al rol.
5. Seguridad define si alguna accion sera Global.
6. Seguridad crea el usuario y lo vincula al empleado.
7. El usuario ingresa al sistema.
8. El sistema muestra solo los menus permitidos.
9. Al abrir una pantalla, el sistema valida permiso Ver.
10. Dentro de la pantalla, el usuario solo debe ejecutar las acciones autorizadas para su rol.
