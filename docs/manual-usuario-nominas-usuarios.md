# Manual de usuario del modulo de nomina

Este manual explica como usar el modulo de `Nomina` en orden cronologico. Esta dirigido a usuarios finales que preparan, calculan, revisan, aprueban y pagan nomina.

El flujo normal es:

```text
Crear periodo > Preparar > Calcular > Revisar > Aprobar > Pagar > Cerrar
```

## 1. Para que sirve

El modulo de nomina sirve para controlar los pagos de empleados por periodo.

Desde este modulo puede:
    
- Crear periodos de nomina.
- Asignar salarios a empleados.
- Registrar bonos y deducciones.
- Calcular pagos.
- Revisar el detalle de cada pago.
- Anular pagos incorrectos antes del cierre.
- Aprobar la nomina.
- Registrar el pago desde caja de turno, banco o fondo efectivo.
- Cerrar el periodo cuando el proceso termino.

## 2. Estados del periodo

Cada periodo tiene un estado. El estado indica que acciones estan disponibles.

| Estado | Significado | Accion siguiente |
| --- | --- | --- |
| Borrador | El periodo fue creado y aun puede prepararse. | Calcular. |
| Calculado | El sistema genero los pagos. | Revisar. |
| Revisado | El usuario confirmo que reviso los pagos. | Aprobar. |
| Aprobado | La nomina esta autorizada para pago. | Pagar. |
| Pagado | El pago ya fue registrado. | Cerrar. |
| Cerrado | El proceso termino. | Solo consulta. |

Reglas importantes:

- No se deben saltar estados.
- No se puede recalcular un periodo que ya fue calculado.
- No se pueden modificar salarios o ajustes de un periodo que ya avanzo despues de `Borrador`.
- Si una fase aparece bloqueada, revise el estado del periodo.

## 3. Pantalla principal

Al entrar a `Nomina`, vera:

| Seccion | Uso |
| --- | --- |
| Periodo | Permite seleccionar el periodo a trabajar. |
| Nuevo periodo | Crea un nuevo periodo de nomina. |
| Resumen | Muestra estado, cantidad de pagos, total y sucursal. |
| Fases | Muestra el avance del proceso. |
| Tablas y formularios | Muestran las acciones permitidas segun el estado. |

Cuando selecciona un periodo, el sistema lo ubica en la fase correspondiente.

## 4. Paso 1: crear el periodo

Un periodo define que fechas se van a pagar.

Para crear un periodo:

1. Entre a `Nomina`.
2. Presione `Nuevo periodo`.
3. Complete los campos.
4. Presione `Crear periodo`.

Campos del periodo:

| Campo | Explicacion |
| --- | --- |
| Nombre | Nombre visible del periodo. Ejemplo: Nomina marzo 2026. |
| Sucursal | Sucursal que se pagara. Use `Todas` si aplica a todas. |
| Inicio | Primera fecha que cubre la nomina. |
| Fin | Ultima fecha que cubre la nomina. |
| Pago | Fecha en que se realizara el pago. |
| Tipo | Mensual, quincenal o semanal. |

Al crearlo, el periodo queda en estado `Borrador`.

## 5. Paso 2: preparar

La preparacion se hace antes de calcular.

En esta fase debe verificar:

- Salarios de empleados.
- Puestos de nomina.
- Conceptos de nomina.
- Bonos o deducciones que apliquen.

### 5.1 Asignar salario

Un empleado necesita salario activo para aparecer en la nomina.

Para asignar salario:

1. Seleccione un periodo en estado `Borrador`.
2. Entre a `Preparar`.
3. Seleccione `Salarios`.
4. Presione `Asignar salario`.
5. Complete empleado, puesto, sucursal, salario y fecha de vigencia.
6. Presione `Guardar salario`.

Notas:

- El salario debe ser mayor a cero.
- Si el empleado ya tenia salario activo, el nuevo salario reemplaza al anterior.
- El empleado, puesto y sucursal deben estar activos.

### 5.2 Registrar bonos o deducciones

Los ajustes modifican el monto final del empleado.

| Tipo | Efecto |
| --- | --- |
| Bono | Suma dinero al pago. |
| Deduccion | Resta dinero al pago. |

Para registrar un ajuste:

1. Entre a `Preparar`.
2. Seleccione `Ajustes`.
3. Presione `Registrar ajuste`.
4. Complete sucursal, empleado, tipo, monto, fecha y motivo.
5. Presione `Guardar ajuste`.

Notas:

- El monto debe ser mayor a cero.
- El motivo debe explicar por que se registra el ajuste.
- El ajuste solo se aplica si su fecha esta dentro del periodo calculado.

## 6. Paso 3: calcular

Calcular significa que el sistema genera los pagos de los empleados.

Para calcular:

1. Seleccione el periodo.
2. Confirme que este en estado `Borrador`.
3. Entre a `Calcular nomina`.
4. Ingrese `Bono general` si desea sumar ese monto a todos los empleados incluidos.
5. Ingrese `Deduccion general` si desea descontar ese monto a todos los empleados incluidos.
6. Presione `Calcular`.

Al calcular, el sistema toma en cuenta:

- Empleados activos.
- Salarios activos.
- Sucursal del periodo.
- Fechas del periodo.
- Bonos y deducciones registrados dentro del rango.
- Bono general y deduccion general, si fueron ingresados.

Despues de calcular:

- Se generan los pagos.
- El periodo cambia a `Calculado`.
- Ya no se puede modificar la preparacion de ese periodo.
- Se habilita la revision.

## 7. Paso 4: revisar

La revision sirve para confirmar que los pagos son correctos antes de aprobar.

Revise:

- Que esten los empleados correctos.
- Que la sucursal sea correcta.
- Que el puesto sea correcto.
- Que el total sea correcto.
- Que bonos y deducciones se hayan aplicado bien.

### 7.1 Ver detalle

Use `Detalle` para ver como se formo el total del pago.

El detalle puede mostrar salario, bonos, deducciones y otros conceptos aplicados.

### 7.2 Anular un pago

Use `Anular` si un pago generado no debe continuar.

Pasos:

1. Entre a `Revisar pagos`.
2. Ubique el pago.
3. Presione `Anular`.
4. Escriba el motivo.
5. Presione `Anular pago`.

Notas:

- Solo se pueden anular pagos activos.
- El motivo debe tener al menos 5 caracteres.
- Un pago anulado no se considera vigente.

### 7.3 Marcar como revisado

Cuando todo este correcto:

1. Presione `Ya revise los pagos` o use la accion `Revisar` del periodo.
2. El periodo cambia a `Revisado`.

## 8. Paso 5: aprobar

La aprobacion confirma que la nomina fue autorizada para pago.

Para aprobar:

1. Seleccione un periodo en estado `Revisado`.
2. Entre a `Aprobar y pagar`.
3. Presione `Aprobar`.

Al aprobar:

- El periodo cambia a `Aprobado`.
- Todavia no se registra salida de dinero.
- Se habilita la accion `Pagar`.

## 9. Paso 6: pagar

Pagar registra la salida de dinero. Antes de presionar `Pagar`, seleccione el origen de fondos.

Opciones de origen:

| Origen | Cuando usarlo |
| --- | --- |
| Caja de turno | Cuando el dinero sale de una caja operativa abierta. |
| Banco | Cuando el pago sale de una cuenta bancaria. |
| Fondo efectivo | Cuando el pago sale de un fondo interno. |

### 9.1 Pagar desde caja de turno

Use esta opcion si el dinero sale fisicamente de una caja abierta.

El campo `Sesion caja abierta` muestra las cajas abiertas disponibles. Si el periodo tiene sucursal, solo se muestran cajas abiertas de esa sucursal.

Opciones:

- `Automatica`: el sistema usa una caja abierta valida de la sucursal.
- Una caja especifica: seleccione la caja abierta que desea usar.

Si solo existe una caja abierta valida, el sistema puede seleccionarla automaticamente.

Si no aparece ninguna caja:

- Verifique que exista una caja abierta.
- Verifique que la caja pertenezca a la sucursal del periodo.
- Abra una caja desde el modulo correspondiente o seleccione otro origen de fondos.

### 9.2 Pagar desde banco o fondo efectivo

Si selecciona `Banco` o `Fondo efectivo`, debe seleccionar la cuenta o fondo.

El sistema usara esa cuenta o fondo para registrar el egreso.

### 9.3 Confirmar pago

Para pagar:

1. Seleccione un periodo en estado `Aprobado`.
2. Seleccione el origen de fondos.
3. Si corresponde, seleccione cuenta, fondo o sesion de caja abierta.
4. Presione `Pagar`.

Al pagar:

- El sistema registra el egreso de nomina.
- El saldo o movimiento del origen queda actualizado.
- El periodo cambia a `Pagado`.

Importante:

- Calcular no descuenta dinero.
- Revisar no descuenta dinero.
- Aprobar no descuenta dinero.
- Pagar si registra el movimiento financiero.

## 10. Paso 7: cerrar

Cerrar finaliza el proceso.

Para cerrar:

1. Seleccione un periodo en estado `Pagado`.
2. Entre a `Aprobar y pagar`.
3. Presione `Cerrar`.

Al cerrar:

- El periodo cambia a `Cerrado`.
- Ya no aparecen acciones posteriores.
- El periodo queda para consulta.

## 11. Modo manual

El modo `Manual` permite calcular pagos sin crear un periodo.

Use esta opcion solo para casos especiales fuera del flujo normal.

En modo manual debe completar:

| Campo | Explicacion |
| --- | --- |
| Sucursal | Sucursal a calcular o Todas. |
| Fecha pago | Fecha del pago. |
| Desde | Inicio del rango. |
| Hasta | Fin del rango. |
| Bono general | Monto adicional para todos, si aplica. |
| Deduccion general | Monto a descontar a todos, si aplica. |

Importante:

- La nomina manual no pasa por todos los estados del periodo.
- Para control completo, use un periodo normal.

## 12. Relacion con caja y bancos

El modulo de nomina se relaciona con caja y bancos al pagar.

Si paga desde `Banco`:

- Se registra un egreso en la cuenta bancaria.
- Disminuye el saldo de la cuenta.
- No afecta la caja de turno.

Si paga desde `Fondo efectivo`:

- Se registra un egreso en el fondo.
- Disminuye el saldo del fondo.
- No afecta la caja de turno.

Si paga desde `Caja de turno`:

- Debe existir una caja abierta valida.
- Se registra un egreso de caja.
- El egreso aparece en los movimientos de caja y en el cierre.

## 13. Problemas frecuentes

### No puedo entrar a una fase

Revise el estado del periodo. Cada fase depende del estado actual.

### No puedo calcular

Posibles causas:

- El periodo no esta en `Borrador`.
- No hay salarios activos.
- No hay empleados activos para la sucursal seleccionada.
- Las fechas del periodo son incorrectas.
- En modo manual faltan fechas.

### Un empleado no aparece

Posibles causas:

- No tiene salario activo.
- Esta inactivo.
- Pertenece a otra sucursal.
- El salario no esta vigente para el periodo.

### Un bono o deduccion no aparece

Posibles causas:

- La fecha del ajuste esta fuera del periodo.
- El ajuste ya fue aplicado antes.
- El ajuste pertenece a otra sucursal.
- El empleado no fue incluido en la nomina.

### No puedo pagar

Posibles causas:

- El periodo no esta en `Aprobado`.
- No selecciono origen de fondos.
- La cuenta bancaria o fondo no tiene saldo suficiente.
- La cuenta o fondo esta inactivo.
- Si usa caja de turno, no hay caja abierta valida.

## 14. Proceso recomendado completo

Use este orden para evitar errores:

1. Entre a `Nomina`.
2. Cree el periodo con `Nuevo periodo`.
3. Confirme que quedo en `Borrador`.
4. Entre a `Preparar`.
5. Revise o asigne salarios.
6. Registre bonos o deducciones si corresponde.
7. Entre a `Calcular nomina`.
8. Presione `Calcular`.
9. Revise los pagos generados.
10. Verifique detalles si es necesario.
11. Anule pagos incorrectos si corresponde.
12. Marque el periodo como `Revisado`.
13. Presione `Aprobar`.
14. Seleccione origen de fondos.
15. Si paga desde caja, seleccione `Automatica` o una `Sesion caja abierta`.
16. Presione `Pagar`.
17. Presione `Cerrar`.

## 15. Ejemplo completo

Ejemplo: pagar la nomina mensual de marzo desde banco.

1. Crear periodo `Nomina marzo 2026`.
2. Seleccionar inicio `2026-03-01`.
3. Seleccionar fin `2026-03-31`.
4. Seleccionar fecha de pago `2026-03-31`.
5. Guardar el periodo.
6. Revisar salarios de empleados.
7. Registrar bonos o deducciones de marzo.
8. Calcular la nomina.
9. Revisar pagos generados.
10. Ver detalle de empleados con bonos o deducciones.
11. Anular cualquier pago incorrecto antes de aprobar.
12. Marcar como revisado.
13. Aprobar.
14. Seleccionar `Banco` como origen de fondos.
15. Seleccionar la cuenta bancaria.
16. Pagar.
17. Cerrar.

Resultado final: el periodo queda `Cerrado` y la nomina queda registrada para consulta.

## 16. Recomendaciones finales

- No calcule hasta tener salarios y ajustes listos.
- No apruebe si no reviso los pagos.
- No pague si el origen de fondos no es correcto.
- No cierre si aun falta validar informacion.
- Para procesos normales, use periodos. Use modo manual solo para casos especiales.
