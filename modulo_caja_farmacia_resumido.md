# Módulo de Caja para Cadena de Farmacias

## 1. Objetivo

El módulo de **Caja** permitirá controlar y auditar el dinero generado en cada sucursal de la cadena de farmacias.

Debe permitir conocer en cualquier momento:

- Qué cajas están abiertas.
- Qué cajero está utilizando cada caja.
- Cuánto dinero debería existir.
- Cuánto dinero fue contado físicamente.
- Qué ventas se realizaron.
- Qué devoluciones existieron.
- Qué entradas y salidas de efectivo se registraron.
- Qué diferencias existen.
- Quién realizó o autorizó cada operación.

El módulo debe funcionar tanto para farmacias completas como para pequeños stands ubicados en centros comerciales o gasolineras.

---

# 2. Flujo general

```text
Sucursal
   ↓
Caja
   ↓
Apertura
   ↓
Fondo inicial
   ↓
Ventas y movimientos
   ↓
Arqueo
   ↓
Cierre
   ↓
Conciliación
   ↓
Reportes y auditoría
```

---

# 3. Actores

## Cajero

Responsable de:

- Abrir la caja.
- Registrar ventas.
- Recibir pagos.
- Registrar movimientos permitidos.
- Realizar el conteo final.
- Solicitar el cierre.

---

## Supervisor

Responsable de:

- Autorizar movimientos especiales.
- Aprobar devoluciones.
- Autorizar retiros.
- Revisar diferencias.
- Aprobar cierres especiales.
- Realizar arqueos sorpresa.

---

## Administrador o auditor

Puede:

- Consultar cualquier sucursal.
- Revisar cajas abiertas y cerradas.
- Consultar movimientos.
- Revisar faltantes y sobrantes.
- Consultar auditoría.
- Obtener reportes consolidados.

---

# 4. Apertura de caja

Antes de vender, el cajero debe abrir una sesión de caja.

Flujo:

```text
Cajero inicia sesión
      ↓
Selecciona sucursal
      ↓
Selecciona caja
      ↓
Sistema valida disponibilidad
      ↓
Cajero registra fondo inicial
      ↓
Caja queda abierta
```

Ejemplo:

```text
Sucursal: Farmacia Sololá
Caja: POS-02
Cajero: Ana López
Fondo inicial: Q500
Hora: 08:00
```

---

# 5. Fondo inicial

Es el dinero disponible para dar cambio.

Ejemplo:

```text
Fondo inicial: Q500
```

Puede registrarse por denominaciones:

| Denominación | Cantidad | Total |
|---:|---:|---:|
| Q100 | 1 | Q100 |
| Q50 | 3 | Q150 |
| Q20 | 5 | Q100 |
| Q10 | 8 | Q80 |
| Q5 | 10 | Q50 |
| Q1 | 20 | Q20 |
| Total | | Q500 |

Esto permite verificar físicamente el dinero con el que inicia el cajero.

---

# 6. Venta

Flujo principal:

```text
Caja abierta
   ↓
Seleccionar productos
   ↓
Validar existencia
   ↓
Calcular total
   ↓
Seleccionar forma de pago
   ↓
Cobrar
   ↓
Actualizar inventario
   ↓
Generar factura FEL
   ↓
Registrar movimiento
```

---

# 7. Datos importantes de una venta

La venta debe guardar al menos:

- Sucursal.
- Caja.
- Cajero.
- Cliente cuando aplique.
- Productos.
- Cantidades.
- Lote.
- Fecha de vencimiento.
- Precio.
- Descuento.
- Total.
- Método de pago.
- Fecha y hora.

---

# 8. Métodos de pago

El sistema debe permitir diferentes métodos:

```text
Efectivo
Tarjeta
Transferencia
Pago QR
Pago en línea
Contra entrega
```

También debe permitir pagos combinados.

Ejemplo:

```text
Venta total: Q750

Efectivo: Q250
Tarjeta: Q500
```

---

# 9. Pago en efectivo

Ejemplo:

```text
Total: Q127.50
Recibido: Q200.00
Cambio: Q72.50
```

La caja debe registrar como ingreso únicamente:

```text
Q127.50
```

---

# 10. Pago con tarjeta

No se debe guardar información sensible completa de la tarjeta.

Puede guardarse:

```text
Marca: VISA
Tarjeta: **** **** **** 2234
Código autorización: 838922
Monto: Q500
```

---

# 11. Movimientos de caja

No todo movimiento de dinero corresponde a una venta.

El sistema debe registrar:

```text
Apertura
Venta
Entrada de efectivo
Salida de efectivo
Devolución
Retiro
Transferencia a bóveda
Ajuste
Liquidación de repartidor
```

Cada movimiento debe registrar:

- Caja.
- Usuario.
- Tipo.
- Monto.
- Fecha.
- Motivo.
- Autorizador cuando aplique.

---

# 12. Entradas de efectivo

Ejemplos:

- Reposición de fondo.
- Liquidación de repartidor.
- Transferencia desde bóveda.
- Ajuste autorizado.

Flujo:

```text
Seleccionar Entrada
   ↓
Ingresar monto
   ↓
Seleccionar motivo
   ↓
Autorizar si aplica
   ↓
Registrar
```

---

# 13. Salidas de efectivo

Ejemplos:

- Gasto autorizado.
- Devolución.
- Retiro de efectivo.
- Transferencia hacia bóveda.

Flujo:

```text
Seleccionar Salida
   ↓
Ingresar monto
   ↓
Seleccionar motivo
   ↓
Adjuntar evidencia si aplica
   ↓
Autorizar
   ↓
Registrar
```

---

# 14. Regla importante

Los movimientos de caja no deben eliminarse.

Si existe un error:

```text
Movimiento original
      ↓
Movimiento de reverso
```

De esta forma queda evidencia.

---

# 15. Retiro por exceso de efectivo

Cada caja puede tener un límite.

Ejemplo:

```text
Máximo permitido: Q5,000
```

Si alcanza:

```text
Q7,500
```

el sistema puede alertar:

```text
Caja supera el límite permitido.
```

El supervisor puede retirar una parte y trasladarla a bóveda.

---

# 16. Caja y bóveda

El dinero retirado de una caja no desaparece.

Flujo:

```text
Caja
  ↓
Bóveda de sucursal
  ↓
Depósito bancario
```

Ejemplo:

```text
Caja POS-03
Retiro: Q3,000

Caja: -Q3,000
Bóveda: +Q3,000
```

---

# 17. Devoluciones

Una devolución debe relacionarse con la venta original.

Flujo:

```text
Buscar venta
   ↓
Seleccionar producto
   ↓
Ingresar motivo
   ↓
Solicitar autorización
   ↓
Realizar devolución
   ↓
Actualizar inventario
   ↓
Registrar devolución del dinero
```

---

# 18. Método de devolución

Cuando sea posible, se debe utilizar el método de pago original.

Ejemplo:

```text
Compra:
Tarjeta Q350

Devolución:
Tarjeta Q350
```

Evitar entregar efectivo si originalmente se pagó con tarjeta, salvo autorización.

---

# 19. Anulación, cancelación y devolución

Deben manejarse por separado.

## Cancelación

La venta todavía no fue completada.

## Anulación

La venta fue procesada pero debe invalidarse.

## Devolución

El cliente devuelve productos después de una venta completada.

---

# 20. Apertura de gaveta

Cuando se abra la gaveta sin una venta, debe registrarse.

Ejemplo:

```text
Caja: POS-02
Usuario: Juan Pérez
Motivo: Cambio de billete
Hora: 11:25
```

Esto permite detectar aperturas fuera de operaciones normales.

---

# 21. Arqueo de caja

El arqueo consiste en contar físicamente el efectivo.

Puede realizarse:

```text
Durante el turno
Por sorpresa
Al cierre
```

Flujo:

```text
Contar efectivo
   ↓
Registrar denominaciones
   ↓
Calcular monto físico
   ↓
Comparar con sistema
   ↓
Obtener diferencia
```

---

# 22. Conteo ciego

Se recomienda que el cajero primero ingrese lo que realmente encontró.

Ejemplo:

```text
Monto contado: Q5,640
```

Después el sistema muestra:

```text
Monto esperado: Q5,650
Monto contado: Q5,640
Diferencia: -Q10
```

Esto evita que el cajero simplemente copie el valor esperado.

---

# 23. Cálculo del efectivo esperado

Ejemplo:

```text
Fondo inicial          Q500
Ventas efectivo      Q7,200
Entradas               Q100
Devoluciones          -Q150
Retiro bóveda        -Q2,000
---------------------------
Esperado              Q5,650
```

---

# 24. Diferencias

Ejemplo:

```text
Esperado: Q5,650
Contado: Q5,640
Diferencia: -Q10
```

Resultado:

```text
Faltante Q10
```

Si el resultado es positivo:

```text
Sobrante
```

---

# 25. Tolerancias

La empresa debe definir límites.

Ejemplo:

```text
Hasta Q5
Cierre normal

De Q5 a Q50
Requiere explicación

Mayor a Q50
Requiere aprobación
```

Estos valores deben ser configurables.

---

# 26. Cierre de caja

Flujo:

```text
Cajero solicita cierre
      ↓
Sistema deja de permitir ventas
      ↓
Calcula efectivo esperado
      ↓
Cajero cuenta dinero
      ↓
Sistema compara
      ↓
Calcula diferencia
      ↓
Solicita explicación/autorización
      ↓
Cierra sesión
      ↓
Genera reporte
```

---

# 27. Conciliación

No se debe revisar únicamente efectivo.

Ejemplo:

| Método | Sistema | Declarado | Diferencia |
|---|---:|---:|---:|
| Efectivo | Q6,824.50 | Q6,800.00 | -Q24.50 |
| Tarjeta | Q8,350.00 | Q8,350.00 | Q0 |
| Transferencia | Q1,250.00 | Q1,250.00 | Q0 |

---

# 28. Integración con inventario

Una venta debe disminuir inventario.

```text
Venta
  ↓
Salida de inventario
```

Una devolución puede devolver producto al inventario.

```text
Devolución
  ↓
Entrada de inventario
```

Se debe considerar:

- Sucursal.
- Producto.
- Lote.
- Fecha de vencimiento.

---

# 29. Integración con FEL

Flujo:

```text
Caja
  ↓
Venta
  ↓
Facturación
  ↓
Certificador FEL
  ↓
SAT
```

Si FEL falla, la venta no debe desaparecer.

Ejemplo:

```text
Venta: Completada
FEL: Pendiente
```

El sistema debe permitir reintentar la certificación.

---

# 30. Integración futura con call center

El sistema debe estar preparado para recibir pedidos externos.

Flujo:

```text
Cliente llama
   ↓
Call center busca producto
   ↓
Consulta inventario por sucursal
   ↓
Selecciona farmacia
   ↓
Reserva medicamento
   ↓
Define entrega
   ↓
Define forma de pago
   ↓
Genera pedido
```

Posteriormente:

```text
Pedido
  ↓
Venta
```

---

# 31. Pedido y venta no son lo mismo

Un pedido puede existir antes de cobrar.

Ejemplo:

```text
Pedido:
ORD-10022
Sucursal: Sololá
Estado: Preparando
```

Luego:

```text
Venta:
SALE-23821
Pedido: ORD-10022
```

---

# 32. Contra entrega

Cuando un repartidor cobra:

```text
Cliente
   ↓
Repartidor
   ↓
Sucursal
```

El dinero debe considerarse temporalmente bajo responsabilidad del repartidor.

Cuando regresa:

```text
Repartidor entrega efectivo
      ↓
Caja recibe
      ↓
Se registra liquidación
```

---

# 33. Auditoría

El sistema debe registrar las acciones importantes.

Ejemplos:

```text
Caja abierta
Caja cerrada
Venta realizada
Venta anulada
Devolución
Entrada
Salida
Retiro
Apertura de gaveta
Diferencia aprobada
Cambio de precio
Descuento
```

Debe quedar registrado:

- Usuario.
- Fecha.
- Sucursal.
- Caja.
- Acción.
- Referencia.

---

# 34. Permisos

Ejemplo:

| Acción | Cajero | Supervisor | Administrador |
|---|:---:|:---:|:---:|
| Abrir caja | ✓ | ✓ | ✓ |
| Vender | ✓ | ✓ | ✓ |
| Devolución | limitada | ✓ | ✓ |
| Salida de efectivo | limitada | ✓ | ✓ |
| Retiro | ✗ | ✓ | ✓ |
| Aprobar diferencia | ✗ | ✓ | ✓ |
| Reportes generales | ✗ | parcial | ✓ |

---

# 35. Información principal a guardar

El diseño debe considerar al menos:

```text
Sucursal
Caja
Sesión de caja
Cajero
Venta
Detalle de venta
Pago
Movimiento de caja
Arqueo
Devolución
Auditoría
```

---

# 36. Pantallas principales

El módulo puede dividirse en:

```text
Dashboard
Selección de caja
Apertura
Punto de venta
Pago
Movimientos
Devoluciones
Arqueo
Cierre
Historial
Reportes
```

---

# 37. Dashboard

Debe permitir visualizar:

- Cajas abiertas.
- Cajas cerradas.
- Efectivo esperado.
- Ventas del día.
- Métodos de pago.
- Diferencias.
- Retiros.
- Cajas sobre límite.
- Cierres pendientes.

Ejemplo:

| Sucursal | Cajas abiertas | Efectivo | Diferencia |
|---|---:|---:|---:|
| Sololá | 3 | Q14,200 | Q0 |
| Panajachel | 2 | Q8,400 | -Q25 |
| Quetzaltenango | 5 | Q27,800 | Q10 |

---

# 38. Reportes principales

## Sesiones de caja

Permite consultar:

- Cajero.
- Caja.
- Fecha.
- Apertura.
- Cierre.
- Fondo.
- Diferencia.

## Movimientos

Permite consultar:

- Entrada.
- Salida.
- Venta.
- Devolución.
- Retiro.

## Diferencias

Permite revisar:

- Faltantes.
- Sobrantes.
- Motivo.
- Usuario.
- Aprobador.

## Métodos de pago

Ejemplo:

```text
Efectivo      Q20,000
Tarjeta       Q22,000
Transferencia  Q8,000
```

---

# 39. Alertas

Ejemplos:

```text
Caja supera límite de efectivo.
Caja abierta por demasiado tiempo.
Diferencia mayor al límite.
Muchas devoluciones.
Muchas anulaciones.
Caja con faltantes recurrentes.
Liquidación de repartidor pendiente.
```

---

# 40. Reglas principales

1. No vender sin una caja abierta.
2. No permitir dos sesiones abiertas sobre la misma caja.
3. No eliminar movimientos.
4. No eliminar ventas completadas.
5. No modificar una caja cerrada sin autorización.
6. Toda devolución debe tener motivo.
7. Toda salida debe tener motivo.
8. Operaciones sensibles deben requerir autorización.
9. Toda diferencia debe quedar registrada.
10. Toda operación debe poder auditarse.

---

# 41. Primera versión recomendada

Para empezar, desarrollar:

```text
1. Configuración de cajas
2. Apertura
3. Fondo inicial
4. Venta
5. Métodos de pago
6. Movimientos de caja
7. Arqueo
8. Diferencias
9. Cierre
10. Auditoría
11. FEL
12. Reportes básicos
```

---

# 42. Segunda etapa

Agregar:

```text
Devoluciones avanzadas
Retiros
Bóveda
Arqueos sorpresa
Dashboard central
Alertas
```

---

# 43. Tercera etapa

Agregar:

```text
Call center
Pedidos web
Delivery
Liquidación de repartidores
Depósitos bancarios
Tesorería
```

---

# 44. Orden recomendado para desarrollar

## Paso 1

Configurar:

```text
Sucursal
Caja
Usuario
Métodos de pago
```

## Paso 2

Implementar:

```text
Apertura
Fondo inicial
Sesión
```

## Paso 3

Implementar:

```text
Venta
Pago
Inventario
```

## Paso 4

Implementar:

```text
Entradas
Salidas
Movimientos
```

## Paso 5

Implementar:

```text
Arqueo
Diferencias
Autorizaciones
```

## Paso 6

Implementar:

```text
Cierre
Reportes
Auditoría
```

## Paso 7

Implementar:

```text
Devoluciones
FEL
```

## Paso 8

Implementar posteriormente:

```text
Call center
Pedidos
Delivery
Tesorería
```

---

# 45. Resultado esperado

El módulo debe permitir responder fácilmente:

```text
¿Cuánto dinero tiene cada sucursal?

¿Cuánto debería existir en cada caja?

¿Cuánto dinero fue contado?

¿Quién tenía asignada la caja?

¿Qué ventas generaron ese dinero?

¿Qué devoluciones existieron?

¿Quién retiró efectivo?

¿Por qué existe un faltante?

¿Cuánto se vendió por tarjeta?

¿Qué operaciones realizó cada usuario?
```

Si el sistema puede responder estas preguntas con información trazable, el módulo cumple su función de control y auditoría.

---

# 46. Definición final

El **Módulo de Caja** será el encargado de controlar el dinero generado en cada sucursal de la cadena de farmacias, desde la apertura y fondo inicial hasta la venta, movimientos, arqueo, conciliación y cierre, manteniendo trazabilidad de usuarios, cajas, pagos y operaciones.

También deberá integrarse con:

```text
Inventario
Ventas
FEL
Usuarios
Auditoría
Pedidos
Delivery
```

para permitir una operación centralizada y preparada para el crecimiento futuro de la empresa.

---

# Referencias funcionales

Como referencia para validar el diseño del módulo pueden consultarse:

- Oracle Retail Xstore Point of Service.
- Odoo Point of Sale.
- SAT Guatemala - Factura Electrónica en Línea (FEL).
- PCI Security Standards Council.

Estas referencias permiten justificar conceptos como:

- apertura y cierre de caja;
- fondo inicial;
- movimientos;
- retiros;
- arqueo;
- diferencias;
- devoluciones;
- métodos de pago;
- conciliación;
- auditoría.
