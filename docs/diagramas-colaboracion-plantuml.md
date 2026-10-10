# Diagramas UML de colaboracion del sistema

Diagramas en sintaxis PlantUML compatible con draw.io. Cada diagrama representa la colaboracion entre actores, controladores, repositorios, servicios y entidades del sistema para 4 procesos importantes implementados en el codigo.

## 1. Proceso de venta en caja

Fuente principal: `Core/src/modules/catalog/sales/sale.repository.js`.

```plantuml
@startuml
title Colaboracion 1 - Registrar venta en caja
left to right direction

skinparam shadowing false
skinparam roundcorner 16
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ArrowThickness 1.4
skinparam linetype ortho

object "Vendedor / Cajero" as Cajero #DCFCE7;line:#15803D
object "SaleController" as Controller #DBEAFE;line:#1D4ED8
object "SaleRepository\ncreateSaleWithDetails()" as Repo #D1FAE5;line:#047857
object "CashSession" as Caja #FEF3C7;line:#B45309
object "Medicine" as Medicine #FCE7F3;line:#BE185D
object "Inventory / InventoryLot" as Inventory #EDE9FE;line:#6D28D9
object "Sale / SaleDetail" as Sale #E0F2FE;line:#0369A1
object "SalePayment / SaleReceipt" as Payment #FAE8FF;line:#A21CAF
object "CashMovement" as Movement #FEF9C3;line:#CA8A04
object "InventoryKardex" as Kardex #F3F4F6;line:#4B5563

Cajero --> Controller : 1. solicita registrar venta\nproductos, pagos, caja
Controller --> Repo : 2. createSaleWithDetails(header, details)
Repo --> Caja : 3. valida sesion abierta\nstatus = A
Repo --> Medicine : 4. consulta medicamento activo\nstatus = E
Repo --> Inventory : 5. valida stock disponible\ny consume lotes FEFO
Repo --> Sale : 6. guarda venta y detalles\nstatus = E
Repo --> Payment : 7. registra pagos\ny comprobante REC-########
Repo --> Kardex : 8. registra salida\nmovementType = SALE
Repo --> Movement : 9. registra ingreso de caja\nsi pago en efectivo
Repo --> Controller : 10. retorna id de venta
Controller --> Cajero : 11. confirma venta\ny comprobante

note bottom of Repo
  La transaccion valida caja abierta,
  stock, pagos, lotes y registra
  venta, recibo, kardex y movimiento de caja.
end note

@enduml
```

## 2. Proceso de compra y recepcion de productos

Fuente principal: `Core/src/modules/catalog/purchases/purchase.repository.js`.

```plantuml
@startuml
title Colaboracion 2 - Crear y recibir orden de compra
left to right direction

skinparam shadowing false
skinparam roundcorner 16
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ArrowThickness 1.4
skinparam linetype ortho

object "Responsable de compras" as Compras #FFE4E6;line:#BE123C
object "PurchaseController" as Controller #DBEAFE;line:#1D4ED8
object "PurchaseRepository" as Repo #D1FAE5;line:#047857
object "Supplier" as Supplier #E0F2FE;line:#0369A1
object "Purchase" as Purchase #FEF3C7;line:#B45309
object "PurchaseDetail" as Detail #FEF9C3;line:#CA8A04
object "PurchaseReceipt" as Receipt #FCE7F3;line:#BE185D
object "PurchaseReceiptDetail" as ReceiptDetail #FAE8FF;line:#A21CAF
object "InventoryLot" as Lot #EDE9FE;line:#6D28D9
object "DeliveryRequest" as Delivery #CCFBF1;line:#0F766E

Compras --> Controller : 1. envia orden de compra\nproveedor y detalle
Controller --> Repo : 2. createPurchaseOrder(payload)
Repo --> Supplier : 3. valida proveedor\ny datos de compra
Repo --> Purchase : 4. crea orden\nstatus = PENDING_APPROVAL
Repo --> Detail : 5. guarda detalles\nstatus = ORDERED
Repo --> Controller : 6. retorna id de orden

Compras --> Controller : 7. registra recepcion\nproductos aceptados/rechazados
Controller --> Repo : 8. receivePurchase(payload)
Repo --> Purchase : 9. valida estado\nAPPROVED o PARTIALLY_RECEIVED
Repo --> Receipt : 10. crea recepcion\nstatus = RECEIVED
Repo --> ReceiptDetail : 11. guarda detalle recibido\naceptado y rechazado
Repo --> Detail : 12. actualiza recibido, pendiente\ny estado del detalle
Repo --> Lot : 13. agrega lote en cuarentena\nsi hay aceptados
Repo --> Purchase : 14. actualiza estado\nPARTIALLY_RECEIVED o RECEIVED
Repo --> Delivery : 15. genera solicitudes automaticas\nsi abastece otra sucursal
Controller --> Compras : 16. confirma recepcion

note bottom of Repo
  El flujo separa la creacion de la orden
  y la recepcion. La recepcion exige orden
  aprobada o parcialmente recibida.
end note

@enduml
```

## 3. Proceso de pedido de cliente y entrega

Fuente principal: `Core/src/modules/catalog/customer-orders/customer-order.repository.js`.

```plantuml
@startuml
title Colaboracion 3 - Pedido de cliente hasta entrega
left to right direction

skinparam shadowing false
skinparam roundcorner 16
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ArrowThickness 1.4
skinparam linetype ortho

object "Cliente" as Cliente #FCE7F3;line:#BE185D
object "Operador" as Operador #DBEAFE;line:#1D4ED8
object "CustomerOrderController" as Controller #DBEAFE;line:#1D4ED8
object "CustomerOrderRepository" as Repo #D1FAE5;line:#047857
object "OpenRouteService" as Route #CCFBF1;line:#0F766E
object "Medicine" as Medicine #FEF3C7;line:#B45309
object "Inventory" as Inventory #EDE9FE;line:#6D28D9
object "CustomerOrder / Detail" as Order #FCE7F3;line:#BE185D
object "CashSession / Employee" as CashEmployee #FEF9C3;line:#CA8A04
object "Sale / Payment / Movement" as Sale #DCFCE7;line:#15803D
object "InventoryKardex" as Kardex #F3F4F6;line:#4B5563

Cliente --> Operador : 1. solicita pedido\ndireccion, productos, pago
Operador --> Controller : 2. registra pedido
Controller --> Repo : 3. createOrder(data)
Repo --> Route : 4. calcula cobertura, distancia\ny tiempo estimado
Repo --> Medicine : 5. consulta medicamentos activos
Repo --> Inventory : 6. valida disponibilidad\ny reserva stock
Repo --> Order : 7. guarda pedido\nstatus = P
Repo --> Controller : 8. retorna id de pedido
Controller --> Operador : 9. confirma pedido pendiente

Operador --> Controller : 10. marca en ruta / entregado
Controller --> Repo : 11. updateOrderStatus(order, 'D')
Repo --> Inventory : 12. valida reserva, consume lotes\ny descuenta stock
Repo --> Kardex : 13. registra salida\nCUSTOMER_ORDER_DELIVERY
Repo --> CashEmployee : 14. valida caja abierta\ny empleado activo
Repo --> Sale : 15. genera venta, pago\ny movimiento de caja
Repo --> Order : 16. actualiza status = D\ny saleId
Controller --> Cliente : 17. entrega confirmada\ny comprobante

note bottom of Repo
  Al entregar se convierte el pedido en venta,
  descuenta inventario y marca pago PAID
  cuando el metodo es contra entrega.
end note

@enduml
```

## 4. Proceso de solicitud de entrega entre sucursales

Fuente principal: `Core/src/modules/catalog/delivery-requests/delivery-request.repository.js`.

```plantuml
@startuml
title Colaboracion 4 - Solicitud de entrega entre sucursales
left to right direction

skinparam shadowing false
skinparam roundcorner 16
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ArrowThickness 1.4
skinparam linetype ortho

object "Sucursal solicitante" as Solicita #FCE7F3;line:#BE185D
object "Sucursal que entrega" as Entrega #FEF3C7;line:#B45309
object "DeliveryRequestController" as Controller #DBEAFE;line:#1D4ED8
object "DeliveryRequestRepository" as Repo #D1FAE5;line:#047857
object "RequestContext" as Context #F3F4F6;line:#4B5563
object "Permission / RolePermission" as Permission #EDE9FE;line:#6D28D9
object "DeliveryRequest" as Request #FCE7F3;line:#BE185D
object "DeliveryRequestDetail" as Detail #FAE8FF;line:#A21CAF
object "MovementType" as Type #E0F2FE;line:#0369A1
object "StockTransferRepository" as Transfer #DCFCE7;line:#15803D
object "MoveInventory" as Movement #FEF9C3;line:#CA8A04

Solicita --> Controller : 1. crea solicitud\nproductos y sucursales
Controller --> Repo : 2. createDeliveryRequestWithDetails()
Repo --> Request : 3. guarda solicitud\nstatus = P
Repo --> Detail : 4. guarda productos solicitados
Controller --> Solicita : 5. confirma solicitud pendiente

Entrega --> Controller : 6. acepta o envia solicitud
Controller --> Repo : 7. changeDeliveryRequestStatus(A/S)
Repo --> Context : 8. obtiene sucursal del usuario\ny permiso actual
Repo --> Permission : 9. valida alcance global\no sucursal involucrada
Repo --> Request : 10. actualiza estado\nP -> A -> S

Solicita --> Controller : 11. confirma entrega recibida
Controller --> Repo : 12. changeDeliveryRequestStatus(D)
Repo --> Type : 13. busca tipo TRASPASO
Repo --> Detail : 14. consulta detalle de solicitud
Repo --> Transfer : 15. createStockTransferWithDetails()
Transfer --> Movement : 16. crea movimiento de inventario\nstatus = E
Repo --> Request : 17. guarda movementId,\nstatus = D, deliveredAt
Controller --> Solicita : 18. confirma entrega aplicada

note bottom of Repo
  Las transiciones permitidas son:
  P -> A/R/C, A -> S/C, S -> D/C.
  Al entregar se crea un traspaso de inventario.
end note

@enduml
```
