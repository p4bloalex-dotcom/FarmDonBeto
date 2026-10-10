# Diagrama de contexto nivel 1

DFD de Nivel 1 en sintaxis PlantUML compatible con draw.io. Descompone el `Sistema Farmacia` del diagrama de contexto nivel 0 en sus funciones principales, usando como base los modulos y rutas del codigo del backend.

Fuentes principales del sistema:

- `Core/src/routes/index.js`
- `Core/src/modules/security/*`
- `Core/src/modules/catalog/inventory/*`
- `Core/src/modules/catalog/sales/*`
- `Core/src/modules/catalog/cash/*`
- `Core/src/modules/catalog/purchases/*`
- `Core/src/modules/catalog/customer-orders/*`
- `Core/src/modules/catalog/delivery-requests/*`
- `Core/src/modules/reports/*`

```plantuml
@startuml
title DFD Nivel 1 - Sistema Farmacia
left to right direction

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ArrowThickness 1.3
skinparam linetype ortho

skinparam rectangle {
  BorderColor #1E293B
  FontColor #0F172A
}

skinparam database {
  BorderColor #5B21B6
  BackgroundColor #EDE9FE
  FontColor #2E1065
}

' Entidades externas
rectangle "Administrador" as Admin #DBEAFE;line:#1D4ED8
rectangle "Vendedor / Cajero" as Cajero #DCFCE7;line:#15803D
rectangle "Encargado de\ninventario" as EncInv #FEF3C7;line:#B45309
rectangle "Responsable de\ncompras" as RespComp #FFE4E6;line:#BE123C
rectangle "Cliente" as Cliente #FCE7F3;line:#BE185D
rectangle "Proveedor" as Proveedor #E0F2FE;line:#0369A1

rectangle "Servidor SMTP" as SMTP #FAE8FF;line:#A21CAF
rectangle "OpenRouteService" as OpenRoute #CCFBF1;line:#0F766E
rectangle "Redis Cache" as Redis #FEF9C3;line:#CA8A04

' Limite del sistema
rectangle "Limite del sistema: Sistema Farmacia" as Boundary #F8FAFC;line:#475569 {

  rectangle "1.0\nGestionar seguridad\ny acceso" as P1 #DBEAFE;line:#1D4ED8
  rectangle "2.0\nAdministrar catalogos\ne inventario" as P2 #FEF3C7;line:#B45309
  rectangle "3.0\nProcesar ventas\ny caja" as P3 #DCFCE7;line:#15803D

  rectangle "4.0\nGestionar compras\ny proveedores" as P4 #FFE4E6;line:#BE123C
  rectangle "5.0\nGestionar pedidos\ny entregas" as P5 #FCE7F3;line:#BE185D
  rectangle "6.0\nGenerar dashboard\ny reportes" as P6 #E0F2FE;line:#0369A1

  database "D1\nUsuarios, roles,\nmenus y permisos" as D1
  database "D2\nMedicamentos, lotes,\nstock y kardex" as D2
  database "D3\nVentas, pagos,\ncomprobantes y caja" as D3
  database "D4\nCompras, proveedores,\nrecepciones y facturas" as D4
  database "D5\nPedidos, reservas\ny entregas" as D5
  database "D6\nAuditoria y reportes\nconsolidados" as D6
}

' Orden visual interno para reducir cruces
P1 -[hidden]right- P2
P2 -[hidden]right- P3
P4 -[hidden]right- P5
P5 -[hidden]right- P6
P1 -[hidden]down- P4
P2 -[hidden]down- P5
P3 -[hidden]down- P6
D1 -[hidden]right- D2
D2 -[hidden]right- D3
D3 -[hidden]right- D4
D4 -[hidden]right- D5
D5 -[hidden]right- D6

' Flujos desde entidades externas hacia procesos
Admin --> P1 : credenciales, usuarios,\nroles y permisos
Admin --> P2 : catalogos, sucursales\ny configuracion
Admin --> P6 : filtros de consulta\ny solicitud de reportes

Cajero --> P3 : ventas, pagos,\napertura/cierre de caja
P3 --> Cajero : comprobantes, totales,\nestado de caja

EncInv --> P2 : stock, lotes, ajustes\ny traspasos
P2 --> EncInv : existencias, kardex\ny alertas
EncInv --> P5 : confirmacion de entrega\ny disponibilidad

RespComp --> P4 : ordenes, recepciones,\nfacturas y pagos
P4 --> RespComp : estados de compra,\npendientes y discrepancias

Cliente --> P5 : pedido, direccion,\ntelefono y pago
P5 --> Cliente : confirmacion, estado\ny entrega

Proveedor --> P4 : productos, facturas\ny entregas
P4 --> Proveedor : ordenes, devoluciones\ny pagos

' Flujos entre procesos principales
P1 --> P2 : autorizacion de acceso
P1 --> P3 : autorizacion de venta\ny caja
P1 --> P4 : autorizacion de compra
P1 --> P5 : autorizacion de pedido\ny entrega
P1 --> P6 : perfil y permisos\nde consulta

P2 --> P3 : productos, precios\ny stock disponible
P3 --> P2 : descuento de inventario\ny kardex de venta

P4 --> P2 : ingreso de lotes,\nrecepciones y stock
P2 --> P4 : existencias, unidades\ny medicamentos

P5 --> P2 : reservas y consumo\nde inventario
P2 --> P5 : disponibilidad, lotes\ny sucursales
P5 --> P3 : venta generada\npor pedido entregado
P3 --> P5 : pago y comprobante\nasociado

P2 --> P6 : indicadores de inventario
P3 --> P6 : ventas, caja y pagos
P4 --> P6 : compras, facturas\ny proveedores
P5 --> P6 : pedidos y entregas

' Procesos hacia almacenes de datos
P1 <--> D1 : usuarios, roles,\nmenus, permisos
P1 --> D6 : eventos de auditoria

P2 <--> D2 : medicamentos, lotes,\nstock, kardex
P2 --> D6 : movimientos auditados

P3 <--> D3 : ventas, pagos,\ncaja, recibos
P3 --> D2 : actualizacion de stock
P3 --> D6 : ventas para reportes

P4 <--> D4 : compras, proveedores,\nrecepciones, facturas
P4 --> D2 : stock recibido\ny lotes
P4 --> D3 : pagos a proveedor\ny salida de caja
P4 --> D6 : compras para reportes

P5 <--> D5 : pedidos, reservas\ny entregas
P5 --> D2 : reservas y consumo\nde inventario
P5 --> D3 : venta de pedido\nentregado
P5 --> D6 : trazabilidad de entrega

P6 --> D1 : filtros por permisos
P6 --> D2 : datos de inventario
P6 --> D3 : datos de ventas\ny caja
P6 --> D4 : datos de compras
P6 --> D5 : datos de pedidos
P6 <--> D6 : auditoria, metricas\ny consolidados

' Servicios externos usados por el codigo
P1 --> SMTP : correo de credenciales\ny restablecimiento
SMTP --> P1 : resultado del envio

P1 --> Redis : cache de permisos\ny contexto RLS
Redis --> P1 : permisos cacheados

P5 --> OpenRoute : coordenadas, rutas\ny distancia
OpenRoute --> P5 : tiempo estimado\ny geolocalizacion

P6 --> Redis : lectura de cache\nsi esta disponible

legend bottom
  |= Elemento |= Significado |
  |<#DBEAFE>| Seguridad y administracion |
  |<#FEF3C7>| Catalogos e inventario |
  |<#DCFCE7>| Ventas y caja |
  |<#FFE4E6>| Compras y proveedores |
  |<#FCE7F3>| Pedidos y entregas |
  |<#E0F2FE>| Reportes / servicio externo |
  |<#EDE9FE>| Almacen de datos |
endlegend

@enduml
```
