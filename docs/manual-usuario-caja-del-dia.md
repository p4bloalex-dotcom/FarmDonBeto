# Manual de usuario - Modulo Caja del dia

Fecha: 2026-10-08

## 1. Objetivo del modulo

El modulo Caja del dia permite abrir una caja para el turno, registrar ingresos y egresos manuales, revisar el total esperado, reversar movimientos y cerrar la caja con conteo de efectivo.

Este modulo es operativo. Se usa durante la jornada para controlar el dinero disponible en caja y dejar registro del cierre.

[img1, pantalla principal de Caja del dia]

## 2. Ubicacion en el sistema

La pantalla se encuentra en Operaciones > Caja del dia.

En las rutas del sistema, Operaciones abre por defecto esta pantalla. Por eso es el primer modulo operativo del flujo.

## 3. Dependencias reales de la pantalla

Para que el modulo funcione, deben existir datos de mantenimiento previamente configurados:

| Dato requerido | Para que se usa |
| --- | --- |
| Cajas | Permiten abrir una sesion de caja. |
| Tipos de movimiento de caja | Permiten clasificar ingresos y egresos manuales. |

Si no existen cajas activas disponibles, el sistema muestra el mensaje No hay cajas activas disponibles para abrir una sesion.

Si no existen tipos de ingreso o egreso configurados, no se puede registrar ese movimiento y el sistema muestra un aviso dentro del formulario.

## 4. Pantalla principal

La pantalla cambia segun exista o no una caja abierta.

### Cuando no hay caja abierta

El sistema muestra:

| Elemento | Uso |
| --- | --- |
| Mensaje Sin caja abierta | Indica que no hay una sesion activa para la caja seleccionada. |
| Boton Abrir caja | Permite iniciar una nueva sesion de caja. |

[img2, pantalla sin caja abierta]

### Cuando hay caja abierta

El sistema muestra:

| Elemento | Uso |
| --- | --- |
| Monto inicial | Monto con el que se abrio la caja. |
| Ingresos | Total de ingresos registrados. |
| Egresos | Total de egresos registrados. |
| Total esperado | Monto calculado que deberia haber en caja. |
| Movimientos de la caja abierta | Lista de movimientos registrados. |
| Boton Ingreso | Registra entrada manual de dinero. |
| Boton Egreso | Registra salida manual de dinero. |
| Boton Cerrar caja | Inicia el cierre de la caja. |

[img3, pantalla con caja abierta]

## 5. Seleccion de caja

Si existe mas de una caja disponible, la pantalla muestra un selector llamado Caja.

1. Abra el selector Caja.
2. Seleccione la caja que desea revisar u operar.
3. El sistema carga el contexto de esa caja.
4. Si esa caja tiene una sesion abierta, muestra sus movimientos y resumen.
5. Si esa caja no tiene sesion abierta, muestra Sin caja abierta.

[img4, selector de caja]

Si solo existe una caja disponible, el sistema muestra el nombre de esa caja como etiqueta y no pide seleccion.

## 6. Estados usados por la pantalla

El codigo identifica las sesiones abiertas con estado `A`.

| Estado visible o funcional | Significado |
| --- | --- |
| Caja abierta | Existe una sesion con estado `A` para la caja seleccionada. |
| Caja cerrada | La sesion ya no aparece como abierta y pasa al historial de cierres anteriores. |

La tabla de Cierres anteriores muestra el campo Estado devuelto por el sistema.

## 7. Flujo general del modulo

1. El usuario entra a Operaciones > Caja del dia.
2. El sistema carga las cajas disponibles.
3. El sistema carga tipos de movimiento.
4. El sistema carga sesiones de caja.
5. El usuario selecciona caja si hay mas de una.
6. Si no hay caja abierta, el usuario abre caja.
7. Si hay caja abierta, el usuario registra ingresos o egresos cuando corresponda.
8. El sistema actualiza movimientos y balance.
9. Al final del turno, el usuario cierra caja.
10. La sesion cerrada pasa al listado de Cierres anteriores.

## 8. Abrir caja

[img5, formulario Abrir caja]

### Pasos

1. En Caja del dia, confirme que aparece Sin caja abierta.
2. Presione Abrir caja.
3. Si hay varias cajas, seleccione la caja correspondiente.
4. Ingrese el Monto de apertura.
5. Presione Abrir caja.
6. El sistema muestra Caja abierta correctamente.
7. La pantalla cambia al modo de caja abierta.

### Validaciones para abrir caja

| Campo | Validacion | Resultado |
| --- | --- | --- |
| Caja | Obligatoria | No permite abrir si no hay caja seleccionada. |
| Monto de apertura | Obligatorio | No permite abrir sin monto. |
| Monto de apertura | No puede ser negativo | Muestra El monto no puede ser negativo. |

Reglas reales:

1. Si hay una sola caja, el sistema la selecciona automaticamente.
2. Si hay varias cajas, el usuario debe confirmar o seleccionar la caja.
3. El monto de apertura se guarda como cero o mayor.
4. El boton Abrir caja se deshabilita si no hay cajas disponibles o el formulario no es valido.

## 9. Resumen de caja abierta

Cuando la caja esta abierta, el sistema muestra cuatro valores principales:

| Valor | Significado |
| --- | --- |
| Monto inicial | Dinero declarado al abrir la caja. |
| Ingresos | Entradas registradas durante la sesion. |
| Egresos | Salidas registradas durante la sesion. |
| Total esperado | Resultado calculado por el sistema para el cierre. |

[img6, resumen de montos de caja abierta]

El total esperado se obtiene desde el balance de la sesion. La pantalla lo actualiza al cargar movimientos y despues de registrar o reversar movimientos.

## 10. Registrar ingreso

[img7, formulario Registrar ingreso]

### Pasos

1. Verifique que la caja este abierta.
2. Presione Ingreso.
3. Seleccione el Tipo de ingreso.
4. Ingrese el Monto.
5. Escriba un Detalle si desea dejar una referencia.
6. Presione Guardar.
7. El sistema muestra Movimiento registrado correctamente.
8. El ingreso aparece en la tabla de movimientos con signo positivo.
9. El resumen se recalcula.

### Validaciones para ingreso

| Campo | Validacion | Resultado |
| --- | --- | --- |
| Tipo de ingreso | Obligatorio | No permite guardar sin seleccionar tipo. |
| Monto | Obligatorio | No permite guardar sin monto. |
| Monto | Minimo 0.01 | No permite registrar cero o valores negativos. |
| Detalle | Opcional | Puede quedar vacio. |

Regla: si no existen tipos de ingreso configurados, el formulario muestra un aviso y no permite registrar el ingreso.

## 11. Registrar egreso

[img8, formulario Registrar egreso]

### Pasos

1. Verifique que la caja este abierta.
2. Presione Egreso.
3. Seleccione el Tipo de egreso.
4. Ingrese el Monto.
5. Escriba un Detalle si desea dejar una referencia.
6. Presione Guardar.
7. El sistema muestra Movimiento registrado correctamente.
8. El egreso aparece en la tabla de movimientos con signo negativo.
9. El resumen se recalcula.

### Validaciones para egreso

| Campo | Validacion | Resultado |
| --- | --- | --- |
| Tipo de egreso | Obligatorio | No permite guardar sin seleccionar tipo. |
| Monto | Obligatorio | No permite guardar sin monto. |
| Monto | Minimo 0.01 | No permite registrar cero o valores negativos. |
| Detalle | Opcional | Puede quedar vacio. |

Regla: si no existen tipos de egreso configurados, el formulario muestra un aviso y no permite registrar el egreso.

## 12. Tabla de movimientos

La tabla de movimientos muestra los registros de la caja abierta.

| Columna | Explicacion |
| --- | --- |
| Tipo | Tipo de movimiento registrado. |
| Detalle | Descripcion ingresada por el usuario. |
| Monto | Monto con signo positivo para ingreso o negativo para egreso. |
| Hora | Fecha/hora del movimiento. |

[img9, tabla de movimientos de caja]

## 13. Reversar movimiento

La pantalla permite usar la accion Reversar sobre un movimiento.

### Pasos

1. Ubique el movimiento en la tabla.
2. Presione Reversar.
3. El sistema solicita eliminar/reversar el movimiento al servidor.
4. Si la operacion es correcta, muestra Movimiento reversado correctamente.
5. La tabla y el balance se actualizan.

Reglas reales:

1. La accion disponible en la tabla se llama Reversar.
2. Despues de reversar, el sistema vuelve a cargar movimientos y balance.
3. Si ocurre un error, muestra No se pudo eliminar el movimiento o Error inesperado al eliminar el movimiento.

## 14. Cerrar caja

[img10, formulario Cerrar caja]

### Pasos

1. Verifique el Total esperado mostrado en pantalla.
2. Presione Cerrar caja.
3. Ingrese el Monto contado.
4. Ingrese el desglose por denominaciones: Q100, Q50, Q20, Q10, Q5 y Q1.
5. Revise el Total por denominaciones.
6. Revise la Diferencia calculada.
7. Si la diferencia supera la tolerancia permitida, escriba una Explicacion de diferencia.
8. Presione Cerrar caja.
9. El sistema muestra Caja cerrada correctamente.
10. La sesion pasa a Cierres anteriores.

### Validaciones para cierre

| Campo o regla | Validacion | Resultado |
| --- | --- | --- |
| Monto contado | Obligatorio | No permite cerrar sin monto contado. |
| Monto contado | No puede ser negativo | No permite valores negativos. |
| Denominaciones | No pueden ser negativas | No permite cantidades negativas. |
| Desglose | Debe sumar igual que el monto contado | Muestra El desglose debe sumar el mismo monto contado. |
| Diferencia mayor a Q5.00 | Requiere explicacion | Muestra Explique la diferencia antes de cerrar la caja. |

Regla real: la tolerancia configurada en la pantalla es Q5.00. Si la diferencia entre monto contado y total esperado es mayor a Q5.00, el sistema obliga a escribir explicacion.

## 15. Calculos mostrados en cierre

| Calculo | Como se interpreta |
| --- | --- |
| Total esperado por la caja | Monto que el sistema espera segun apertura y movimientos. |
| Total por denominaciones | Suma de billetes/monedas ingresadas en Q100, Q50, Q20, Q10, Q5 y Q1. |
| Diferencia | Monto contado menos total esperado. |

Si la diferencia aparece positiva, el contado es mayor que el esperado. Si aparece negativa, el contado es menor que el esperado.

## 16. Cierres anteriores

La pantalla muestra una tabla de sesiones cerradas o no abiertas.

| Columna | Explicacion |
| --- | --- |
| Caja | Caja asociada a la sesion. |
| Apertura | Fecha/hora de apertura. |
| Cierre | Fecha/hora de cierre. |
| Inicial | Monto de apertura. |
| Esperado | Monto esperado por el sistema. |
| Contado | Monto declarado al cerrar. |
| Diferencia | Diferencia entre contado y esperado. |
| Estado | Estado devuelto por el sistema. |

[img11, tabla Cierres anteriores]

## 17. Dashboard central y alertas

La pantalla puede mostrar informacion adicional de control:

### Alertas

Si existen alertas, aparecen en la parte superior cuando hay caja abierta. La pantalla muestra el mensaje enviado por el sistema.

[img12, alertas de caja]

### Dashboard central

Si el sistema devuelve informacion de sucursales, la pantalla muestra:

| Dato | Explicacion |
| --- | --- |
| Sucursal | Nombre de la sucursal. |
| Cajas abiertas | Cantidad de cajas abiertas. |
| Efectivo esperado | Monto esperado en efectivo. |
| Retiros | Monto de retiros registrados. |

[img13, dashboard central de caja]

## 18. Mensajes del sistema

| Mensaje | Cuando aparece |
| --- | --- |
| Caja abierta correctamente. | La apertura fue registrada. |
| No se pudo abrir la caja. | El servidor rechazo la apertura. |
| Error inesperado al abrir la caja. | Ocurrio un error no controlado al abrir. |
| Movimiento registrado correctamente. | El ingreso o egreso fue guardado. |
| No se pudo registrar el movimiento. | El servidor rechazo el movimiento. |
| Error inesperado al registrar el movimiento. | Ocurrio un error no controlado al guardar movimiento. |
| Movimiento reversado correctamente. | El movimiento fue reversado. |
| No se pudo eliminar el movimiento. | El servidor rechazo la reversa. |
| Error inesperado al eliminar el movimiento. | Ocurrio un error al reversar. |
| Caja cerrada correctamente. | El cierre fue registrado. |
| No se pudo cerrar la caja. | El servidor rechazo el cierre. |
| Error inesperado al cerrar la caja. | Ocurrio un error no controlado al cerrar. |
| Error al cargar las cajas. | No se pudieron cargar las cajas. |
| Error inesperado al cargar las cajas. | Error no controlado al cargar cajas. |
| Error inesperado al cargar los tipos de movimiento. | No se pudieron cargar tipos de movimiento. |
| Error al cargar las sesiones. | No se pudieron cargar sesiones. |
| Error inesperado al calcular el balance. | No se pudo calcular el resumen. |

## 19. Reglas operativas

1. Para registrar ingresos o egresos debe existir una caja abierta.
2. Para cerrar caja debe existir una caja abierta.
3. El monto de apertura no puede ser negativo.
4. Los movimientos manuales deben tener tipo y monto mayor o igual a Q0.01.
5. Los movimientos de ingreso se muestran con signo positivo.
6. Los movimientos de egreso se muestran con signo negativo.
7. El cierre exige que el desglose por denominaciones coincida con el monto contado.
8. Si la diferencia supera Q5.00, debe explicarse antes de cerrar.
9. Si solo existe una caja, el sistema la selecciona automaticamente.
10. Si hay varias cajas, el usuario debe seleccionar la caja que va a operar.

## 20. Errores frecuentes y solucion

### No puedo abrir caja

1. Revise que exista una caja disponible.
2. Si hay varias cajas, seleccione una.
3. Ingrese un monto de apertura igual o mayor que cero.

### No puedo registrar ingreso o egreso

1. Verifique que la caja este abierta.
2. Revise que exista un tipo de movimiento configurado.
3. Seleccione el tipo correspondiente.
4. Ingrese un monto mayor o igual a Q0.01.

### No puedo cerrar caja

1. Ingrese el monto contado.
2. Complete las denominaciones sin valores negativos.
3. Verifique que el total por denominaciones sea igual al monto contado.
4. Si la diferencia supera Q5.00, escriba explicacion.

### El total esperado no coincide con mi conteo

1. Revise los movimientos registrados.
2. Verifique si algun movimiento debe reversarse.
3. Cuente nuevamente el efectivo.
4. Si la diferencia permanece, registre la explicacion al cerrar.

## 21. Buenas practicas

1. Abra caja al inicio del turno antes de registrar operaciones.
2. Use el monto real con el que inicia la caja.
3. Registre ingresos y egresos manuales en el momento en que ocurren.
4. Use el detalle para dejar referencia clara del movimiento.
5. Revise la tabla antes de cerrar.
6. No cierre caja hasta terminar el conteo fisico.
7. Si hay diferencia, escriba una explicacion concreta.
8. Revise Cierres anteriores para confirmar que el cierre quedo registrado.

## 22. Resumen secuencial

1. Entrar a Operaciones > Caja del dia.
2. Seleccionar caja si hay mas de una.
3. Si no hay caja abierta, presionar Abrir caja.
4. Ingresar monto de apertura.
5. Operar la caja durante el turno.
6. Registrar ingresos manuales cuando corresponda.
7. Registrar egresos manuales cuando corresponda.
8. Reversar movimientos incorrectos si aplica.
9. Revisar monto inicial, ingresos, egresos y total esperado.
10. Presionar Cerrar caja.
11. Ingresar monto contado y desglose por denominaciones.
12. Explicar diferencia si supera Q5.00.
13. Confirmar cierre.
14. Revisar que aparezca en Cierres anteriores.
