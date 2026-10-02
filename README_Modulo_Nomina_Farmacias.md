# Módulo de Nómina / Planilla
## Requerimientos Técnicos – Sistema de Farmacias Multisucursal

## 1. Objetivo
Implementar un módulo de nómina para administrar y procesar pagos del personal de una cadena de farmacias con múltiples sucursales.

Debe cubrir:
- Empleados por sucursal.
- Salarios.
- Bonificaciones.
- Horas extra.
- Ausencias.
- Descuentos.
- Anticipos o préstamos.
- Periodos de nómina.
- Cálculo de ingresos y deducciones.
- Aprobación y cierre.
- Boletas de pago.
- Reportes por sucursal y consolidados.
- Seguridad por usuario, rol y sucursal.

## 2. Alcance
Flujo principal:

Empleado
→ Configuración salarial
→ Incidencias del periodo
→ Generación de nómina
→ Revisión
→ Aprobación
→ Pago
→ Cierre
→ Boleta / Reportes


## 3. Seguridad multisucursal
El módulo debe respetar el esquema actual de acceso y RLS.


## 4. Empleados

Tabla:
TB_EMPLOYEE

Campos sugeridos:
- ID
- CODE
- FIRST_NAME
- LAST_NAME
- DPI
- NIT
- PHONE
- EMAIL
- ADDRESS
- BRANCH_ID
- POSITION_ID
- HIRE_DATE
- CONTRACT_TYPE
- WORK_SHIFT
- PAYMENT_FREQUENCY
- PAYMENT_METHOD
- BANK_NAME
- BANK_ACCOUNT
- STATUS




Formulario:
Datos personales:
- Código empleado *
- Nombres *
- Apellidos *
- DPI *
- NIT
- Teléfono
- Correo
- Dirección

Datos laborales:
- Sucursal *
- Puesto *
- Fecha ingreso *
- Tipo contrato
- Jornada
- Periodicidad de pago *
- Estado *

Datos de pago:
- Forma de pago
- Banco
- Cuenta bancaria

## 5. Puestos

Tabla:
TB_POSITION

Campos:
- ID
- CODE
- NAME
- DESCRIPTION
- STATUS

Ejemplos:
- Administrador de sucursal
- Regente farmacéutico
- Auxiliar de farmacia
- Cajero
- Encargado de inventario
- Bodeguero
- Repartidor
- Supervisor regional
- Contador
- Personal administrativo

## 6. Historial salarial

Tabla:
TB_EMPLOYEE_SALARY

Campos:
- ID
- EMPLOYEE_ID
- BASE_SALARY
- BONUS_AMOUNT
- EFFECTIVE_FROM
- EFFECTIVE_TO
- STATUS
- CREATED_AT

Se debe conservar historial para no alterar nóminas anteriores cuando cambie el salario.

## 7. Conceptos de nómina

Tabla:
TB_PAYROLL_CONCEPT

Campos:
- ID
- CODE
- NAME
- TYPE
- IS_AUTOMATIC
- STATUS

Tipos:
- INCOME
- DEDUCTION

Ingresos iniciales:
- Salario ordinario
- Bonificación incentivo
- Horas extra
- Comisión
- Bono adicional
- Otros ingresos

Descuentos iniciales:
- IGSS
- ISR
- Anticipo
- Préstamo
- Ausencia
- Descuento autorizado
- Otros descuentos

## 8. Periodos de nómina

Tabla:
TB_PAYROLL_PERIOD

Campos:
- ID
- NAME
- DATE_START
- DATE_END
- PAY_DATE
- PERIOD_TYPE
- STATUS
- CREATED_AT
- CREATED_BY

Tipos:
- MONTHLY
- BIWEEKLY
- WEEKLY


Formulario:
- Nombre *
- Fecha inicio *
- Fecha fin *
- Fecha pago *
- Tipo de periodo *
- Sucursal

## 9. Generación de nómina

El sistema debe permitir seleccionar:
- Periodo
- Sucursal

Proceso:
1. Obtener empleados activos.
2. Obtener salario vigente.
3. Cargar bonificaciones.
4. Cargar horas extra.
5. Cargar descuentos.
6. Cargar anticipos o préstamos.
7. Calcular ingresos.
8. Calcular deducciones.
9. Calcular neto a pagar.

## 10. Cabecera de nómina

Tabla:
TB_PAYROLL

Campos:
- ID
- PERIOD_ID
- EMPLOYEE_ID
- BRANCH_ID
- BASE_SALARY
- TOTAL_INCOME
- TOTAL_DEDUCTION
- NET_PAY
- STATUS
- CREATED_AT
- CREATED_BY

## 11. Detalle de nómina

Tabla:
TB_PAYROLL_DETAIL

Campos:
- ID
- PAYROLL_ID
- CONCEPT_ID
- TYPE
- AMOUNT
- DESCRIPTION

Ejemplo:
- Salario ordinario + Q4,500
- Bonificación + Q250
- Horas extra + Q300
- IGSS - Qxxx
- Anticipo - Q200

## 12. Horas extra

Tabla:
TB_OVERTIME

Campos:
- ID
- EMPLOYEE_ID
- DATE
- HOURS
- TYPE
- REASON
- STATUS
- APPROVED_BY
- CREATED_AT

Tipos:
- DAY
- NIGHT
- HOLIDAY
- REST_DAY

Estados:
- PENDING
- APPROVED
- REJECTED

Solo las horas aprobadas deben incluirse en nómina.

## 13. Ausencias

Tabla:
TB_ABSENCE

Campos:
- ID
- EMPLOYEE_ID
- DATE_START
- DATE_END
- TYPE
- PAID
- REASON
- STATUS
- CREATED_AT

Tipos:
- UNJUSTIFIED
- PERMISSION
- SICK_LEAVE
- VACATION
- SUSPENSION

## 14. Anticipos y préstamos

Tabla:
TB_EMPLOYEE_LOAN

Campos:
- ID
- EMPLOYEE_ID
- TYPE
- AMOUNT
- INSTALLMENTS
- INSTALLMENT_AMOUNT
- BALANCE
- DATE
- STATUS

Tipos:
- ADVANCE
- LOAN

Estados:
- ACTIVE
- PAID
- CANCELLED

## 15. Bonificaciones adicionales

Tabla:
TB_EMPLOYEE_BONUS

Campos:
- ID
- EMPLOYEE_ID
- PAYROLL_PERIOD_ID
- CONCEPT_ID
- AMOUNT
- DESCRIPTION
- STATUS
- APPROVED_BY

## 16. Cálculo de nómina

TOTAL_INGRESOS =
Salario
+ Bonificaciones
+ Horas extra
+ Otros ingresos

TOTAL_DESCUENTOS =
Deducciones legales
+ Anticipos
+ Préstamos
+ Ausencias
+ Otros descuentos

NETO_A_PAGAR =
TOTAL_INGRESOS
- TOTAL_DESCUENTOS

La nómina cerrada debe conservar los valores calculados del periodo y no recalcularse con datos actuales.

## 17. Revisión y aprobación

Flujo:
DRAFT
→ CALCULATED
→ REVIEWED
→ APPROVED
→ PAID
→ CLOSED

Una nómina CLOSED no debe modificarse directamente.

## 18. Boleta de pago

Debe existir una vista imprimible/exportable en PDF con:
- Empresa
- Periodo
- Empleado
- Código
- Sucursal
- Puesto
- Ingresos
- Descuentos
- Total ingresos
- Total descuentos
- Neto a pagar

## 19. Reportes

Mínimos:
- Nómina por periodo.
- Nómina por sucursal.
- Nómina consolidada.
- Horas extra.
- Bonificaciones.
- Descuentos.
- Anticipos pendientes.
- Costo de personal por sucursal.
- Historial salarial por empleado.

## 20. RLS

Como mínimo deben quedar protegidas por alcance de sucursal:
- TB_EMPLOYEE
- TB_PAYROLL
- TB_OVERTIME
- TB_ABSENCE
- TB_EMPLOYEE_LOAN

Regla:
- Usuario global → todas las sucursales.
- Usuario sucursal → su BRANCH_ID.
- Usuario multisucursal → sucursales asignadas.

## 21. Validaciones importantes

Empleado:
- Código único.
- DPI no repetido cuando aplique.
- Sucursal obligatoria.
- Puesto obligatorio.
- Fecha de ingreso válida.

Salario:
- Mayor a cero.
- No permitir dos salarios vigentes simultáneamente.

Periodo:
- Fecha inicio <= fecha fin.
- No duplicar nómina por empleado y periodo.
- No modificar periodo cerrado.

Nómina:
- Incluir solo incidencias aprobadas.
- Guardar valores usados en el cálculo.
- Mantener consistencia entre ingresos, descuentos y neto.

## 22. Auditoría

Registrar:
- Usuario
- Fecha
- Acción
- Empleado
- Periodo
- Sucursal

Eventos:
- Creación de periodo.
- Generación.
- Modificación manual.
- Aprobación.
- Registro de pago.
- Cierre.

## 23. Formularios principales

1. Empleados
2. Historial salarial
3. Conceptos de nómina
4. Periodos de nómina
5. Generar / revisar nómina
6. Horas extra
7. Ausencias
8. Anticipos / préstamos

## 24. Diseño técnico resumido

Tablas:
- TB_EMPLOYEE
- TB_POSITION
- TB_EMPLOYEE_SALARY
- TB_PAYROLL_CONCEPT
- TB_PAYROLL_PERIOD
- TB_PAYROLL
- TB_PAYROLL_DETAIL
- TB_OVERTIME
- TB_ABSENCE
- TB_EMPLOYEE_LOAN
- TB_EMPLOYEE_BONUS

Relaciones principales:

BRANCH
  |
EMPLOYEE
  |
  +-- EMPLOYEE_SALARY
  +-- OVERTIME
  +-- ABSENCE
  +-- EMPLOYEE_LOAN
  +-- PAYROLL
        |
        +-- PAYROLL_DETAIL

## 25. Prioridad de implementación

Fase 1:
- Empleado
- Puesto
- Salario
- Conceptos
- Periodos
- Generación de nómina
- Detalle de nómina

Fase 2:
- Horas extra
- Ausencias
- Bonificaciones
- Anticipos / préstamos

Fase 3:
- Boletas PDF
- Reportes
- Auditoría

## 26. Resultado esperado

El módulo debe responder:
- ¿Cuánto debe pagarse a cada empleado?
- ¿Cuánto cuesta la planilla de una sucursal?
- ¿Cuánto gasta la empresa completa en planilla?
- ¿Qué ingresos y descuentos tuvo un empleado?
- ¿Qué horas extra fueron pagadas?
- ¿Qué anticipos siguen pendientes?
- ¿Quién calculó y aprobó una nómina?

