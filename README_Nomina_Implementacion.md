# Módulo de Nómina

## Objetivo

El módulo de nómina permite preparar, calcular, revisar, aprobar, pagar y cerrar la nómina del personal de la farmacia multisucursal.

El diseño separa claramente:

- Catálogos y configuración.
- Preparación de datos de nómina.
- Cálculo de pagos.
- Revisión y aprobación.
- Pago y cierre.
- Consulta de detalle.
- Seguridad por permisos y sucursal.

## Alcance Actual

El módulo cubre actualmente:

- Períodos de nómina.
- Puestos de nómina.
- Conceptos de nómina.
- Asignación salarial del personal.
- Historial salarial.
- Ajustes individuales de nómina.
- Generación de pagos por período.
- Detalle de pago por empleado.
- Flujo de estados del período.
- Registro de pago contra caja al marcar período como pagado.
- Protección por RLS en tablas con alcance de sucursal.

## Ubicación en el Sistema

### Operación

Ruta funcional:

```text
Operación > Nómina
```

Uso principal:

- Crear o seleccionar período.
- Calcular nómina.
- Revisar pagos generados.
- Avanzar estados.
- Consultar detalle de pagos.
- Preparar salarios y ajustes.

### Catálogos

Rutas funcionales:

```text
Catálogos > Puestos de nómina
Catálogos > Conceptos de nómina
```

Uso principal:

- Administrar puestos usados por nómina.
- Administrar conceptos de ingreso y deducción.

## Flujo Operativo

El flujo recomendado es:

```text
Preparación
→ Crear período
→ Calcular nómina
→ Revisar pagos
→ Aprobar
→ Pagar
→ Cerrar
```

## Estados del Período

Tabla:

```text
TB_PAYROLL_PERIOD
```

Estados soportados:

```text
DRAFT       Borrador
CALCULATED  Calculado
REVIEWED    Revisado
APPROVED    Aprobado
PAID        Pagado
CLOSED      Cerrado
```

Transiciones permitidas:

```text
DRAFT -> CALCULATED
CALCULATED -> REVIEWED
REVIEWED -> APPROVED
APPROVED -> PAID
PAID -> CLOSED
```

Reglas:

- Solo se puede calcular un período en estado `DRAFT`.
- Solo se puede pagar un período en estado `APPROVED`.
- Solo se puede cerrar un período en estado `PAID`.
- Un período `CLOSED` no debe modificarse.

## Preparación de Nómina

La preparación agrupa la información que debe existir antes de calcular.

### Salarios del Personal

Ubicación:

```text
Nómina > Preparación > Salarios
```

Relaciona:

- Empleado.
- Puesto de nómina.
- Sucursal.
- Salario base.
- Fecha de vigencia.

Tabla:

```text
TB_EMPLOYEE_SALARY
```

Reglas:

- El salario debe ser mayor a cero.
- El empleado debe estar activo.
- El puesto debe estar activo.
- La sucursal debe estar activa.
- La sucursal del salario debe coincidir con la sucursal del empleado cuando el empleado ya tiene sucursal asignada.
- Al crear un salario nuevo para un empleado, el salario activo anterior se inactiva.
- Se conserva historial salarial.

### Ajustes Individuales

Ubicación:

```text
Nómina > Preparación > Ajustes
```

Permite registrar:

- Bonos individuales.
- Deducciones individuales.

Tabla:

```text
TB_PAYROLL_ADJUSTMENT
```

Estados:

```text
P Pendiente
A Aplicado
I Anulado
```

Reglas:

- El empleado debe estar activo.
- La sucursal del ajuste debe coincidir con la sucursal del empleado cuando aplique.
- Solo los ajustes pendientes dentro del rango del período se incluyen al calcular.
- Al generar la nómina, los ajustes incluidos cambian a `A` y se vinculan al pago generado.

## Catálogos Relacionados

### Puestos de Nómina

Ruta:

```text
Catálogos > Puestos de nómina
```

Tabla:

```text
TB_PAYROLL_POSITION
```

Campos principales:

- `ID`
- `NAME`
- `DESCRIPTION`
- `STATUS`

Uso:

- Alimenta el campo `Puesto` en la asignación salarial.

Nota:

`Puestos de nómina` no es lo mismo que el catálogo antiguo `positionpersonal`. Nómina usa `TB_PAYROLL_POSITION`.

### Conceptos de Nómina

Ruta:

```text
Catálogos > Conceptos de nómina
```

Tabla:

```text
TB_PAYROLL_CONCEPT
```

Campos principales:

- `ID`
- `CODE`
- `NAME`
- `TYPE`
- `IS_AUTOMATIC`
- `STATUS`

Tipos:

```text
INCOME     Ingreso
DEDUCTION  Deducción
```

Conceptos base creados por migración:

```text
SALARY     Salario ordinario
BONUS      Bonificaciones
DEDUCTION  Deducciones
```

## Generación de Nómina

La generación se realiza desde:

```text
Nómina > Calcular nómina
```

Entradas:

- Período seleccionado o fechas manuales.
- Sucursal opcional.
- Bono general opcional.
- Deducción general opcional.

Proceso:

1. Obtener período seleccionado o fechas manuales.
2. Validar que el período esté en `DRAFT` cuando aplique.
3. Obtener salarios activos vigentes en el rango del período.
4. Filtrar por sucursal si aplica.
5. Obtener ajustes pendientes del empleado dentro del período.
6. Calcular ingresos.
7. Calcular deducciones.
8. Calcular neto a pagar.
9. Crear pago de nómina.
10. Crear detalle de nómina.
11. Marcar ajustes incluidos como aplicados.
12. Cambiar período a `CALCULATED`.

Fórmula:

```text
TOTAL_INGRESOS = salario base + bonos
TOTAL_DEDUCCIONES = deducciones
NETO = TOTAL_INGRESOS - TOTAL_DEDUCCIONES
```

## Pagos de Nómina

Tabla:

```text
TB_PAYROLL_PAYMENT
```

Campos principales:

- `ID`
- `EMPLOYEE_ID`
- `BRANCH_ID`
- `SALARY_ID`
- `POSITION_ID`
- `PERIOD_ID`
- `PAYMENT_DATE`
- `PERIOD_START`
- `PERIOD_END`
- `BASE_SALARY`
- `BONUSES`
- `DEDUCTIONS`
- `TOTAL`
- `STATUS`
- `NOTES`

Estados actuales:

```text
E Activo
I Anulado
```

Reglas:

- No se duplica pago activo para el mismo empleado y período.
- Los valores se guardan calculados para preservar histórico.
- El pago no debe depender de cambios salariales futuros.

## Detalle de Nómina

Tabla:

```text
TB_PAYROLL_DETAIL
```

Campos principales:

- `ID`
- `PAYROLL_PAYMENT_ID`
- `BRANCH_ID`
- `CONCEPT_ID`
- `TYPE`
- `AMOUNT`
- `DESCRIPTION`

Uso:

- Muestra de qué está compuesto el pago.
- Permite consultar ingresos y deducciones por empleado.

Ejemplo:

```text
Salario ordinario  INCOME     Q 4,500.00
Bonificaciones     INCOME     Q   250.00
Deducciones        DEDUCTION  Q   150.00
```

## Pago y Caja

La generación de nómina no registra movimiento de caja.

El movimiento de caja se registra cuando el período pasa a:

```text
PAID
```

Reglas:

- Debe existir una sesión de caja abierta en la sucursal.
- Debe existir el tipo de movimiento `PAYROLL_PAYMENT`.
- Se registra un egreso por cada pago de nómina.

Tablas relacionadas:

```text
TB_CASH_SESSION
TB_CASH_MOVEMENT_TYPE
TB_CASH_MOVEMENT
```

## Seguridad y Permisos

Pantalla operativa:

```text
Payroll.*
```

Catálogos:

```text
PayrollPosition.*
PayrollConcept.*
```

Acciones típicas:

```text
View
Create
Edit
Delete
```

Regla importante:

Tener acceso a una sucursal no debe otorgar automáticamente acceso a nómina.

## RLS

El sistema usa RLS por sucursal para proteger información operativa.

Tablas de nómina protegidas por sucursal:

```text
TB_EMPLOYEE
TB_EMPLOYEE_SALARY
TB_PAYROLL_PERIOD
TB_PAYROLL_PAYMENT
TB_PAYROLL_DETAIL
TB_PAYROLL_ADJUSTMENT
```

Reglas esperadas:

- Usuario global: puede ver todas las sucursales.
- Usuario de sucursal: solo ve su sucursal.
- Usuario multisucursal: ve sucursales asignadas según configuración del sistema.

Tablas globales sin RLS directo:

```text
TB_PAYROLL_POSITION
TB_PAYROLL_CONCEPT
```

Motivo:

- Son catálogos compartidos por la empresa.

## Migraciones y Code First

La estructura se maneja por migraciones code-first.

Comando:

```bash
cd Core
npm run codefirst:update
```

Migración del módulo:

```text
Core/src/migrations-code-first/1791000000000-PayrollStructure.js
```

Esta migración crea o completa:

- `TB_PAYROLL_CONCEPT`
- `TB_PAYROLL_PERIOD`
- `TB_PAYROLL_DETAIL`
- columna `PERIOD_ID` en `TB_PAYROLL_PAYMENT`
- constraints relacionadas
- conceptos base

No debe ejecutarse DDL desde controladores, repositorios o endpoints en runtime.

## Frontend

Pantalla principal:

```text
Front/src/app/modules/admin/operation/payroll/payroll.component.*
```

Estructura actual:

- Selector de período.
- Tarjetas resumen.
- Centro de nómina.
- Pasos:
  - Calcular nómina.
  - Revisar pagos.
  - Aprobar y pagar.
  - Preparación.
- Preparación:
  - Salarios.
  - Ajustes.
- Catálogos relacionados:
  - Puestos.
  - Conceptos.

Reglas UX aplicadas:

- Menos formularios visibles al mismo tiempo.
- Menos espacios muertos.
- Una vista activa a la vez.
- Si solo existe una opción, se selecciona automáticamente cuando aplica.
- Textos en español.
- Estados traducidos.

## Backend

Módulo:

```text
Core/src/modules/catalog/payroll
```

Archivos principales:

```text
payroll.routes.js
payroll.controller.js
payroll.repository.js
payroll.validation.js
```

Entidades principales:

```text
Core/src/entities/payroll-position.entity.js
Core/src/entities/payroll-concept.entity.js
Core/src/entities/payroll-period.entity.js
Core/src/entities/payroll-payment.entity.js
Core/src/entities/payroll-detail.entity.js
Core/src/entities/payroll-adjustment.entity.js
Core/src/entities/employee-salary.entity.js
```

## Reportes Esperados

Reportes mínimos recomendados:

- Nómina por período.
- Nómina por sucursal.
- Nómina consolidada.
- Detalle de ingresos y deducciones por empleado.
- Historial salarial por empleado.
- Ajustes aplicados por período.
- Anticipos o préstamos pendientes, cuando se implemente esa fase.
- Costo de personal por sucursal.
- Pagos anulados.
- Períodos pendientes de aprobación o cierre.

## Auditoría Esperada

Eventos importantes:

- Creación de período.
- Cálculo de nómina.
- Revisión.
- Aprobación.
- Pago.
- Cierre.
- Anulación de pago.
- Cambio salarial.
- Registro de ajuste.

Datos mínimos:

- Usuario.
- Fecha.
- Acción.
- Período.
- Empleado.
- Sucursal.
- Monto afectado.

## Validaciones Importantes

### Período

- Fecha inicio debe ser menor o igual a fecha fin.
- Fecha de pago obligatoria.
- No calcular si no está en `DRAFT`.
- No modificar si está cerrado.

### Salario

- Salario mayor a cero.
- Empleado activo.
- Puesto activo.
- Sucursal activa.
- No mantener dos salarios activos para el mismo empleado.

### Cálculo

- Debe existir salario activo vigente.
- No duplicar pago activo por empleado y período.
- Solo incluir ajustes pendientes del rango.
- Guardar valores calculados.

### Pago

- Solo pagar si está aprobado.
- Debe existir caja abierta para registrar egreso.
- Debe existir tipo de movimiento `PAYROLL_PAYMENT`.

## Fases de Implementación

### Fase 1: Base operativa

Estado: implementada parcialmente.

- Puestos de nómina.
- Conceptos de nómina.
- Períodos.
- Salarios del personal.
- Ajustes individuales.
- Generación de pagos.
- Detalle de pago.
- Flujo de estados.

### Fase 2: Incidencias avanzadas

Estado: pendiente.

- Horas extra.
- Ausencias.
- Bonificaciones por concepto específico.
- Descuentos autorizados.
- Anticipos.
- Préstamos.
- Cuotas de préstamo.

### Fase 3: Documentos y reportes

Estado: pendiente.

- Boleta de pago imprimible.
- Exportación PDF.
- Reportes consolidados.
- Reporte por sucursal.
- Reporte por empleado.
- Reporte de costo de personal.

### Fase 4: Auditoría especializada

Estado: pendiente.

- Bitácora específica de nómina.
- Registro de aprobación.
- Registro de pago.
- Registro de cierre.
- Comparación de cambios salariales.

## Pendientes Recomendados

- Crear pantalla o diálogo de boleta de pago.
- Agregar reportes de nómina al módulo de reportes consolidados.
- Implementar horas extra.
- Implementar ausencias.
- Implementar anticipos y préstamos.
- Agregar auditoría específica de nómina.
- Agregar filtros por sucursal, período y empleado en preparación.
- Reemplazar anulación con diálogo formal en lugar de `prompt`.
- Agregar pruebas automatizadas específicas de nómina.
