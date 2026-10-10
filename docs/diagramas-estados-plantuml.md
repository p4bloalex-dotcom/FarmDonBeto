# Diagramas de estados del sistema

Diagramas en sintaxis PlantUML compatible con draw.io. Estan basados en estados y transiciones definidas en el codigo del backend.

## 1. Modulo de compras

Fuente principal: `Core/src/modules/catalog/purchases/purchase.repository.js`.

```plantuml
@startuml
title Estado de una orden de compra
hide empty description

[*] --> PENDING_APPROVAL : crear orden

PENDING_APPROVAL --> APPROVED : approvePurchase()
APPROVED --> PARTIALLY_RECEIVED : receivePurchase()\nrecepcion parcial
APPROVED --> RECEIVED : receivePurchase()\nrecepcion total
PARTIALLY_RECEIVED --> PARTIALLY_RECEIVED : receivePurchase()\nqueda pendiente
PARTIALLY_RECEIVED --> RECEIVED : receivePurchase()\ncompleta pendientes

RECEIVED --> INVOICED : registerSupplierInvoice()\nmatching MATCHED
RECEIVED --> DISCREPANCY : registerSupplierInvoice()\nmatching no coincide
PARTIALLY_RECEIVED --> DISCREPANCY : registerSupplierInvoice()\nmatching no coincide
DISCREPANCY --> INVOICED : registerSupplierInvoice()\nmatching corregido

INVOICED --> PAID : paySupplierInvoice()
DISCREPANCY --> PAID : paySupplierInvoice()\nfactura aprobada
PAID --> DISCREPANCY : createSupplierReturn()\ndevolucion posterior

RECEIVED --> DISCREPANCY : reviewReceiptTechnically()\nREJECTED

note right of PENDING_APPROVAL
  Estado inicial usado al crear
  la orden de compra.
end note

note right of RECEIVED
  Al recibirse completa puede generar
  solicitudes de entrega automaticas.
end note

@enduml
```

## 2. Modulo de solicitudes de entrega

Fuente principal: `Core/src/modules/catalog/delivery-requests/delivery-request.repository.js`.

```plantuml
@startuml
title Estado de una solicitud de entrega entre sucursales
hide empty description

[*] --> P : crear solicitud

state "Pendiente" as P
state "Aceptada" as A
state "Rechazada" as R
state "Enviada" as S
state "Entregada" as D
state "Cancelada" as C

P --> A : aceptar\nsucursal que entrega
P --> R : rechazar\nsucursal que entrega
P --> C : cancelar\nsucursal involucrada

A --> S : marcar enviada\nsucursal que entrega
A --> C : cancelar\nsucursal involucrada

S --> D : confirmar entrega\nsucursal que recibe
S --> C : cancelar\nsucursal involucrada

R --> [*]
D --> [*]
C --> [*]

note right of D
  Al entregar se crea un traspaso
  de inventario y se registra deliveredAt.
end note

@enduml
```

## 3. Modulo de pedidos de cliente

Fuente principal: `Core/src/modules/catalog/customer-orders/customer-order.repository.js`.

```plantuml
@startuml
title Estado de un pedido de cliente
hide empty description

[*] --> P : crear pedido

state "Pendiente" as P
state "En ruta" as S
state "Entregado" as D
state "Cancelado" as C

P --> S : updateOrderStatus('S')
S --> D : updateOrderStatus('D')
P --> C : updateOrderStatus('C')
S --> C : updateOrderStatus('C')

D --> [*]
C --> [*]

state "Pago pendiente" as PAY_PENDING
state "Pago confirmado" as PAY_PAID

P --> PAY_PENDING : paymentStatus PENDING
D --> PAY_PAID : contra entrega\nmarca PAID

note right of D
  Al entregarse valida reserva,
  descuenta inventario, genera venta,
  pago y movimiento de caja si aplica.
end note

note right of C
  Al cancelarse libera la reserva
  de inventario asociada.
end note

@enduml
```

## 4. Modulo de caja

Fuente principal: `Core/src/modules/catalog/cash/cash-session.controller.js` y `cash-session.repository.js`.

```plantuml
@startuml
title Estado de una sesion de caja
hide empty description

[*] --> A : abrir sesion

state "Abierta" as A
state "Cerrada" as C
state "Eliminada" as X

A --> A : registrar movimientos\nventas / pagos / egresos
A --> C : cerrar sesion\ncloseSession()
C --> X : eliminar\nsi no tiene movimientos

C --> [*]
X --> [*]

note right of A
  Solo puede existir una sesion
  abierta por caja registrada.
end note

note right of C
  El cierre calcula monto esperado,
  diferencia y puede requerir
  explicacion o autorizacion.
end note

@enduml
```
