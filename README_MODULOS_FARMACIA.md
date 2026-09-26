# README Técnico — Módulos de Inventario, Compras y Ventas
## Sistema de Cadena de Farmacias Multi-Sucursal

## 1. Objetivo

Este documento define una base técnica para desarrollar los módulos de:

- Inventario.
- Compras.
- Recepción de mercadería.
- Traslados entre sucursales.
- Ventas / dispensación.
- Reservas.
- Caja e integración con facturación.
- Auditoría y trazabilidad.

El sistema está diseñado para una cadena de farmacias con múltiples sucursales, bodegas y futuros canales de venta como call center, portal web y entrega a domicilio.

El diseño debe permitir conocer en todo momento:

- Qué medicamento existe.
- En qué sucursal se encuentra.
- Qué lote corresponde.
- Cuándo vence.
- Cuánto está disponible.
- Cuánto está reservado.
- Cuánto está en tránsito.
- Qué cantidades están bloqueadas o en cuarentena.
- De dónde provino el medicamento.
- Qué usuario realizó cada movimiento.
- A qué venta, compra o traslado corresponde cada movimiento.

---

# 2. Principios generales

## 2.1 El stock no debe manejarse únicamente por producto

No utilizar solamente:

```text
Producto + Cantidad
```

La unidad principal de control debe ser:

```text
Sucursal + Producto + Lote + Fecha de vencimiento + Ubicación
```

Ejemplo:

```text
Producto: Amoxicilina 500 mg
Sucursal: Sololá
Lote: AMX-26001
Vencimiento: 2027-05-31
Cantidad disponible: 45
```

---

## 2.2 Estados lógicos del inventario

El stock físico debe separarse por estado.

Ejemplo:

```text
Stock físico:        100
Disponible:           65
Reservado:            10
En tránsito:          15
Cuarentena:            5
Dañado:                2
Vencido:               3
```

No todo el stock físico debe considerarse disponible para venta.

---

# 3. Arquitectura funcional

```text
                     COMPRAS
                        |
                        v
                   RECEPCIÓN
                        |
                        v
+------------------------------------------------+
|                  INVENTARIO                    |
|                                                |
| Producto / Lote / Vencimiento / Sucursal      |
| Stock / Kardex / FEFO / Reservas / Alertas    |
+----------+------------------+------------------+
           |                  |
           v                  v
       TRASLADOS            VENTAS
           |                  |
           v                  v
      OTRA SUCURSAL         CAJA
                              |
                              v
                             FEL
```

---

# 4. Módulo de Inventario

## 4.1 Responsabilidades

El módulo debe administrar:

- Existencias por sucursal.
- Existencias por lote.
- Vencimientos.
- Ubicaciones físicas.
- Reservas.
- Inventario en tránsito.
- Inventario en cuarentena.
- Productos dañados.
- Productos vencidos.
- Ajustes.
- Conteos físicos.
- Kardex.
- Alertas por bajo stock.
- Alertas por vencimiento.
- Movimientos entre sucursales.

---

# 5. Entidades principales de Inventario

## 5.1 Product

```text
Product
-------
Id
Name
GenericName
Description
Sku
Barcode
Presentation
UnitOfMeasureId
CategoryId
BrandId
RequiresPrescription
IsControlled
RequiresColdChain
Status
CreatedAt
UpdatedAt
```

---

## 5.2 ProductRegistration

```text
ProductRegistration
-------------------
Id
ProductId
RegistrationNumber
RegistrationDate
ExpirationDate
HolderName
Status
```

---

## 5.3 InventoryLot

Representa existencia real de un medicamento por lote y sucursal.

```text
InventoryLot
------------
Id
BranchId
ProductId
BatchNumber
ExpirationDate
StorageLocationId

QuantityAvailable
QuantityReserved
QuantityInTransit
QuantityQuarantine
QuantityDamaged
QuantityExpired

PurchasePrice
SupplierId
ReceivedAt
Status
CreatedAt
UpdatedAt
```

Regla:

```text
QuantityAvailable >= 0
```

No permitir stock negativo salvo que exista una política empresarial explícita.

---

## 5.4 StorageLocation

```text
StorageLocation
---------------
Id
BranchId
Code
Name
Type
RequiresTemperatureControl
MinTemperature
MaxTemperature
Status
```

Ejemplos:

```text
Bodega general
Refrigeración
Cuarentena
Medicamentos controlados
Área de despacho
```

---

# 6. Kardex

Todo cambio de stock debe generar un movimiento de Kardex.

## 6.1 InventoryMovement

```text
InventoryMovement
-----------------
Id
BranchId
ProductId
InventoryLotId

MovementType
Quantity

PreviousBalance
NewBalance

ReferenceType
ReferenceId

Reason
UserId
CreatedAt
```

Tipos sugeridos:

```text
PURCHASE_RECEIPT
SALE
TRANSFER_OUT
TRANSFER_IN
SALE_RETURN
SUPPLIER_RETURN
ADJUSTMENT_IN
ADJUSTMENT_OUT
QUARANTINE_IN
QUARANTINE_OUT
EXPIRED
DAMAGED
RESERVATION
RESERVATION_RELEASE
```

Regla importante:

> Ninguna modificación directa de cantidades debe realizarse sin generar un movimiento de inventario.

---

# 7. FEFO / PEPE

Se debe utilizar la política:

```text
First Expiry, First Out
Primero en Expirar, Primero en Salir
```

Cuando una venta solicite un producto:

```text
1. Buscar lotes disponibles.
2. Excluir lotes vencidos.
3. Excluir lotes bloqueados.
4. Excluir cuarentena.
5. Ordenar por ExpirationDate ASC.
6. Consumir primero el lote más próximo a vencer.
```

Ejemplo:

```text
Lote A -> vence 2027-03 -> 20 unidades
Lote B -> vence 2027-08 -> 30 unidades
```

Venta de 25:

```text
Lote A -> 20
Lote B -> 5
```

---

# 8. Stock mínimo y abastecimiento

Cada producto debe permitir configuración por sucursal.

## BranchProductConfig

```text
BranchProductConfig
-------------------
Id
BranchId
ProductId

MinimumStock
MaximumStock
ReorderPoint
SuggestedOrderQuantity

AllowAutomaticTransferSuggestion
AllowAutomaticPurchaseSuggestion
```

Condición típica:

```text
AvailableStock <= ReorderPoint
```

Acción:

```text
Generar alerta de reabastecimiento
```

---

# 9. Estrategia de reabastecimiento

Cuando una sucursal tenga bajo stock:

```text
Sucursal A
Stock actual: 5
Stock mínimo: 20
Necesidad: 15
```

El sistema debe consultar primero otras sucursales.

Ejemplo:

```text
Sucursal B
Disponible: 70
Mínimo: 20
Excedente: 50
```

Entonces:

```text
Sugerir traslado B -> A
```

Antes de sugerir compra a proveedor.

Flujo recomendado:

```text
Bajo stock
   |
   v
Buscar excedentes en otras sucursales
   |
   +---- Sí ----> Sugerir traslado
   |
   +---- No ----> Sugerir compra
```

---

# 10. Traslados entre sucursales

Nunca modificar directamente el inventario de dos sucursales.

Crear una operación formal de traslado.

## 10.1 Transfer

```text
Transfer
--------
Id
TransferNumber

SourceBranchId
DestinationBranchId

RequestedBy
ApprovedBy
DispatchedBy
ReceivedBy

RequestedAt
ApprovedAt
DispatchedAt
ReceivedAt

Status
Reason
Observations
CreatedAt
```

---

## 10.2 TransferDetail

```text
TransferDetail
--------------
Id
TransferId
ProductId
InventoryLotId

QuantityRequested
QuantityApproved
QuantitySent
QuantityReceived
QuantityRejected
```

---

# 11. Estados del traslado

```text
REQUESTED
PENDING_APPROVAL
APPROVED
PREPARING
DISPATCHED
IN_TRANSIT
PARTIALLY_RECEIVED
RECEIVED
REJECTED
CANCELLED
```

---

# 12. Flujo de traslado

```text
Solicitud
    |
    v
Aprobación
    |
    v
Preparación
    |
    v
Selección de lotes FEFO
    |
    v
Despacho
    |
    v
Stock origen disminuye
    |
    v
Estado EN TRÁNSITO
    |
    v
Recepción destino
    |
    v
Validación física
    |
    v
Stock destino aumenta
```

No incrementar inventario disponible en destino antes de confirmar recepción.

---

# 13. Módulo de Compras

## Responsabilidades

- Solicitudes de compra.
- Órdenes de compra.
- Proveedores.
- Recepción.
- Facturas de proveedores.
- Devoluciones.
- Trazabilidad por lote.
- Costos.

---

# 14. PurchaseRequest

```text
PurchaseRequest
---------------
Id
BranchId
RequestedBy
RequestedAt
Status
Reason
Observations
```

Detalle:

```text
PurchaseRequestDetail
---------------------
Id
PurchaseRequestId
ProductId
RequestedQuantity
SuggestedQuantity
```

---

# 15. PurchaseOrder

```text
PurchaseOrder
-------------
Id
OrderNumber
SupplierId
BranchId

OrderDate
ExpectedDeliveryDate

Subtotal
Tax
Total

Status
CreatedBy
ApprovedBy
CreatedAt
```

Estados:

```text
DRAFT
PENDING_APPROVAL
APPROVED
SENT
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
```

---

# 16. PurchaseOrderDetail

```text
PurchaseOrderDetail
-------------------
Id
PurchaseOrderId
ProductId

QuantityOrdered
UnitPrice
Discount
Tax
Subtotal
Total
```

---

# 17. Recepción de compras

La recepción debe ser independiente de la orden de compra.

## GoodsReceipt

```text
GoodsReceipt
------------
Id
ReceiptNumber
PurchaseOrderId
BranchId
SupplierId

ReceivedBy
ReceivedAt

SupplierInvoiceNumber
Status
Observations
```

---

## GoodsReceiptDetail

```text
GoodsReceiptDetail
------------------
Id
GoodsReceiptId
ProductId

QuantityOrdered
QuantityReceived
QuantityAccepted
QuantityRejected
```

Una línea recibida puede generar múltiples lotes.

---

## GoodsReceiptBatch

```text
GoodsReceiptBatch
-----------------
Id
GoodsReceiptDetailId

BatchNumber
ExpirationDate

Quantity
PurchasePrice

Temperature
Condition
Status
```

---

# 18. Validaciones de recepción

Validar como mínimo:

```text
Producto correcto
Cantidad recibida
Lote
Fecha de vencimiento
Estado físico
Proveedor
Precio
Documento de referencia
Temperatura cuando aplique
```

No asumir:

```text
QuantityOrdered = QuantityReceived
```

Puede existir recepción parcial.

---

# 19. Cuarentena

Si el producto presenta problemas:

```text
Daño
Vencimiento
Temperatura incorrecta
Producto sospechoso
Retiro sanitario
Devolución pendiente
```

Debe pasar a:

```text
QUARANTINE
```

No disponible para venta.

---

# 20. Ajustes de inventario

No permitir editar directamente:

```text
Stock = Stock + 10
```

Crear:

## InventoryAdjustment

```text
InventoryAdjustment
-------------------
Id
BranchId
ProductId
InventoryLotId

SystemQuantity
PhysicalQuantity
Difference

ReasonId
Comments

RequestedBy
ApprovedBy
CreatedAt
```

Todo ajuste genera movimiento Kardex.

---

# 21. Conteo físico

## InventoryCount

```text
InventoryCount
--------------
Id
BranchId
StartDate
EndDate
Status
CreatedBy
ApprovedBy
```

## InventoryCountDetail

```text
InventoryCountDetail
--------------------
Id
InventoryCountId
InventoryLotId

SystemQuantity
CountedQuantity
Difference
```

Flujo:

```text
Abrir conteo
   ↓
Capturar físico
   ↓
Comparar
   ↓
Revisar diferencias
   ↓
Aprobar ajustes
   ↓
Cerrar conteo
```

---

# 22. Módulo de Ventas

Debe soportar:

- Venta presencial.
- Venta futura desde call center.
- Venta desde portal.
- Reserva de producto.
- Diferentes formas de pago.
- Venta por lote.
- Dispensación con receta.
- Productos controlados.
- Facturación electrónica.

---

# 23. Sale

```text
Sale
----
Id
SaleNumber
BranchId
CustomerId

SaleChannel

Subtotal
Discount
Tax
Total

Status

CreatedBy
CreatedAt
CompletedAt
```

Canales:

```text
POS
CALL_CENTER
WEB
MOBILE
DELIVERY
```

---

# 24. SaleDetail

```text
SaleDetail
----------
Id
SaleId
ProductId

Quantity
UnitPrice
Discount
Tax
Subtotal
Total
```

---

# 25. SaleLotDetail

Permite saber exactamente qué lote fue vendido.

```text
SaleLotDetail
-------------
Id
SaleDetailId
InventoryLotId
BatchNumber
ExpirationDate
Quantity
```

Debe asignarse usando FEFO.

---

# 26. Flujo de venta

```text
Buscar producto
     ↓
Validar disponibilidad
     ↓
Validar receta si aplica
     ↓
Validar medicamento controlado
     ↓
Reservar stock temporalmente
     ↓
Asignar lotes FEFO
     ↓
Calcular totales
     ↓
Procesar pago
     ↓
Generar venta
     ↓
Descontar inventario
     ↓
Generar Kardex
     ↓
Registrar movimiento de caja
     ↓
Generar FEL
```

---

# 27. Reservas

Necesarias para call center, portal web y entregas.

## InventoryReservation

```text
InventoryReservation
--------------------
Id
BranchId
ProductId
CustomerOrderId

Quantity
ReservedAt
ExpiresAt

Status
CreatedBy
```

Estados:

```text
ACTIVE
COMPLETED
EXPIRED
CANCELLED
```

Fórmula:

```text
AvailableToPromise =
QuantityAvailable - QuantityReserved
```

---

# 28. Selección de sucursal para pedidos

Para futuras órdenes remotas:

```text
CustomerOrder
    |
    v
Buscar sucursales cercanas
    |
    v
Consultar AvailableToPromise
    |
    v
Evaluar distancia / capacidad
    |
    v
Seleccionar sucursal
    |
    v
Reservar producto
```

La API debe retornar como mínimo:

```json
{
  "branchId": 5,
  "available": 18,
  "reserved": 3,
  "availableToPromise": 15,
  "estimatedDeliveryMinutes": 35
}
```

---

# 29. Caja

Ventas y Caja deben manejarse como módulos relacionados pero independientes.

Ejemplo:

```text
Venta = Q150

Pago:
Q100 efectivo
Q50 tarjeta
```

Venta:

```text
Total = Q150
```

Caja:

```text
Entrada efectivo = Q100
```

Pago electrónico:

```text
Tarjeta = Q50
```

---

# 30. Payment

```text
Payment
-------
Id
SaleId
PaymentMethodId
Amount
Reference
Status
ProcessedAt
```

Métodos:

```text
CASH
CARD
BANK_TRANSFER
OTHER
```

---

# 31. Movimiento de Caja

```text
CashMovement
------------
Id
CashSessionId
MovementType
ReferenceType
ReferenceId

Amount
Reason
UserId
CreatedAt
```

Ejemplos:

```text
SALE
REFUND
CASH_IN
CASH_OUT
EXPENSE
ADJUSTMENT
```

---

# 32. FEL

La venta debe permitir integración con Factura Electrónica en Línea.

Campos sugeridos:

```text
FelUuid
FelSeries
FelNumber
FelStatus
CertifiedAt
CertifierResponse
XmlUrl
```

Estados:

```text
PENDING
CERTIFIED
REJECTED
CANCELLED
```

No mezclar el estado FEL con el estado interno de la venta.

---

# 33. Recetas

Para productos que requieran receta:

## Prescription

```text
Prescription
------------
Id
CustomerId
DoctorName
DoctorLicense
PrescriptionNumber
IssueDate
ExpirationDate
ImageUrl
Status
CreatedAt
```

## PrescriptionDetail

```text
PrescriptionDetail
------------------
Id
PrescriptionId
ProductId
QuantityAuthorized
QuantityDispensed
```

---

# 34. Productos controlados

Debe existir control adicional.

Ejemplo:

```text
ControlledSubstanceMovement
---------------------------
Id
BranchId
ProductId
InventoryLotId

MovementType
Quantity
Balance

PrescriptionId
PatientId
SaleId

UserId
CreatedAt
```

Nunca depender únicamente del Kardex general para reportes de medicamentos controlados.

---

# 35. Devoluciones

## Venta

```text
SaleReturn
```

Validar:

- Factura original.
- Producto.
- Lote.
- Estado.
- Política de devolución.
- Condiciones sanitarias.

Un producto devuelto no debería regresar automáticamente a disponible.

Flujo recomendado:

```text
Devolución
   ↓
Inspección
   ↓
Cuarentena
   ↓
Evaluación
   ↓
Disponible / Desecho
```

---

# 36. Retiro de productos o lotes

Debe poder bloquearse:

```text
ProductId
BatchNumber
```

Ejemplo:

```text
ProductRecall
-------------
Id
ProductId
BatchNumber
Reason
RecallDate
Status
CreatedBy
```

Al bloquear un lote:

```text
No vender
No reservar
No trasladar
```

---

# 37. Auditoría

Todo módulo debe guardar como mínimo:

```text
CreatedBy
CreatedAt
UpdatedBy
UpdatedAt
```

Operaciones críticas adicionalmente:

```text
ApprovedBy
ApprovedAt
CancelledBy
CancelledAt
CancellationReason
```

Registrar eventos importantes en:

```text
AuditLog
--------
Id
UserId
Action
Entity
EntityId
OldValue
NewValue
IpAddress
CreatedAt
```

---

# 38. API sugerida

## Inventario

```http
GET    /api/inventory
GET    /api/inventory/branches/{branchId}
GET    /api/inventory/products/{productId}
GET    /api/inventory/lots/{lotId}

GET    /api/inventory/low-stock
GET    /api/inventory/expiring
GET    /api/inventory/availability
GET    /api/inventory/kardex
```

---

## Compras

```http
POST   /api/purchase-requests
GET    /api/purchase-requests

POST   /api/purchase-orders
PUT    /api/purchase-orders/{id}/approve

POST   /api/goods-receipts
GET    /api/goods-receipts/{id}
```

---

## Traslados

```http
POST   /api/transfers
GET    /api/transfers

PUT    /api/transfers/{id}/approve
PUT    /api/transfers/{id}/dispatch
PUT    /api/transfers/{id}/receive
PUT    /api/transfers/{id}/cancel
```

---

## Ventas

```http
POST   /api/sales
GET    /api/sales/{id}

POST   /api/sales/{id}/payments
POST   /api/sales/{id}/complete
POST   /api/sales/{id}/cancel
POST   /api/sales/{id}/returns
```

---

## Reservas

```http
POST   /api/inventory/reservations
DELETE /api/inventory/reservations/{id}

GET    /api/inventory/availability
```

---

# 39. Transacciones de base de datos

Operaciones críticas deben ejecutarse dentro de una transacción.

Ejemplo venta:

```text
BEGIN TRANSACTION

Crear Sale
Crear SaleDetail
Seleccionar lotes
Actualizar InventoryLot
Crear InventoryMovement
Registrar Payment
Crear CashMovement

COMMIT
```

Ante error:

```text
ROLLBACK
```

---

# 40. Concurrencia

Debe evitarse la sobreventa.

Ejemplo:

```text
Stock disponible = 5

Caja A intenta vender 4
Caja B intenta vender 4
```

Solo una operación debe consumir el stock primero.

Aplicar:

- Transacciones.
- Bloqueos apropiados.
- Control optimista de concurrencia.
- RowVersion / versión de registro.
- Revalidación de stock antes de confirmar.

---

# 41. Índices recomendados

Ejemplos:

```text
InventoryLot:
(BranchId, ProductId, ExpirationDate)
(ProductId, BatchNumber)
(BranchId, Status)

InventoryMovement:
(BranchId, ProductId, CreatedAt)
(InventoryLotId, CreatedAt)

Transfer:
(SourceBranchId, Status)
(DestinationBranchId, Status)

Sale:
(BranchId, CreatedAt)
(CustomerId, CreatedAt)
```

---

# 42. Reportes mínimos

## Inventario

```text
Stock por sucursal
Stock por lote
Productos próximos a vencer
Productos vencidos
Productos bajo mínimo
Productos en cuarentena
Productos en tránsito
Kardex
Diferencias de inventario
```

## Compras

```text
Compras por proveedor
Órdenes pendientes
Órdenes parcialmente recibidas
Histórico de costos
Productos más comprados
```

## Traslados

```text
Traslados pendientes
Traslados en tránsito
Diferencias de recepción
Traslados por sucursal
```

## Ventas

```text
Ventas por sucursal
Ventas por producto
Ventas por categoría
Ventas por usuario
Ventas por método de pago
Ventas por canal
```

---

# 43. Alertas

Crear un sistema centralizado de alertas.

Tipos sugeridos:

```text
LOW_STOCK
OUT_OF_STOCK
NEAR_EXPIRATION
EXPIRED
TEMPERATURE_ALERT
TRANSFER_PENDING
TRANSFER_DELAYED
PURCHASE_PENDING
RECALL
CONTROLLED_SUBSTANCE
```

---

# 44. Eventos de dominio sugeridos

Para una arquitectura futura basada en eventos:

```text
InventoryLowStockEvent
InventoryAdjustedEvent
InventoryReservedEvent

PurchaseOrderApprovedEvent
GoodsReceivedEvent

TransferRequestedEvent
TransferDispatchedEvent
TransferReceivedEvent

SaleCompletedEvent
SaleCancelledEvent

ProductRecallCreatedEvent
```

Estos eventos pueden utilizarse posteriormente con:

```text
RabbitMQ
Azure Service Bus
Kafka
```

No es obligatorio introducir un broker en la primera versión.

---

# 45. Orden recomendado de implementación

## Fase 1 — Catálogos

```text
Sucursales
Productos
Categorías
Unidades
Proveedores
Ubicaciones
Métodos de pago
```

## Fase 2 — Inventario

```text
InventoryLot
Kardex
Stock por sucursal
Stock mínimo
FEFO
Vencimientos
```

## Fase 3 — Compras

```text
PurchaseRequest
PurchaseOrder
GoodsReceipt
Ingreso por lote
```

## Fase 4 — Traslados

```text
Solicitud
Aprobación
Despacho
Tránsito
Recepción
```

## Fase 5 — Ventas

```text
POS
FEFO
Pagos
Kardex
Caja
```

## Fase 6 — Auditoría

```text
Conteos
Ajustes
Cuarentena
Devoluciones
Alertas
```

## Fase 7 — Omnicanal

```text
Reservas
Call center
Portal
Delivery
AvailableToPromise
```

---

# 46. Reglas críticas

1. Todo movimiento de stock debe generar Kardex.
2. No editar cantidades directamente.
3. El inventario debe manejarse por lote.
4. Todo lote debe tener vencimiento cuando aplique.
5. Aplicar FEFO para la salida de medicamentos.
6. El producto en cuarentena no puede venderse.
7. El producto vencido no puede venderse.
8. El producto reservado no puede venderse a otro cliente.
9. El producto en tránsito no debe considerarse disponible en destino.
10. Un traslado debe ser confirmado por origen y destino.
11. Una compra puede recibirse parcialmente.
12. Una recepción puede contener varios lotes del mismo producto.
13. Una venta puede consumir varios lotes.
14. Las devoluciones no regresan automáticamente a stock disponible.
15. Toda operación crítica debe conservar usuario, fecha y referencia.
16. La cancelación de operaciones debe dejar trazabilidad.
17. No permitir stock negativo.
18. Los lotes bloqueados por retiro no deben venderse.
19. Productos controlados requieren trazabilidad adicional.
20. Toda confirmación de venta debe revalidar disponibilidad.

---

# 47. Modelo conceptual resumido

```text
Supplier
    |
    v
PurchaseOrder
    |
    v
GoodsReceipt
    |
    v
InventoryLot
    |
    +--------------------+
    |                    |
    v                    v
Transfer              Reservation
    |                    |
    v                    v
InventoryLot          CustomerOrder
    |
    v
Sale
    |
    +------> Payment
    |
    +------> CashMovement
    |
    +------> FEL
```

---

# 48. Resultado esperado

Con esta arquitectura el sistema podrá responder preguntas operativas y de auditoría como:

```text
¿Cuánto inventario existe en cada farmacia?

¿De qué lote provino una venta?

¿Qué medicamentos están próximos a vencer?

¿Qué productos necesitan reabastecimiento?

¿Existe una sucursal que pueda trasladar stock antes de comprar?

¿Qué medicamentos están actualmente en tránsito?

¿Quién autorizó un traslado?

¿Cuánto se recibió realmente de una orden de compra?

¿Qué lotes fueron suministrados por determinado proveedor?

¿Qué venta provocó determinada salida de inventario?

¿Qué productos se encuentran reservados para pedidos futuros?
```

La meta es que Inventario, Compras, Traslados, Ventas y Caja formen un flujo trazable y auditable, evitando que cada módulo opere de manera aislada.
