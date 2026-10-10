# DFD de contexto (nivel 0) — Sistema de Gestión Farmacéutica

Este diagrama representa un único proceso central (0), seis entidades externas y los principales flujos de datos de entrada y salida. Está pensado para una presentación universitaria, siguiendo la composición de la referencia: entidades alrededor del sistema, entradas azules y salidas rojas.

> **Alcance:** es un DFD de contexto del negocio. Oracle, Redis y los servidores de aplicación se consideran componentes internos de la solución y no entidades externas. Para SMTP y OpenRouteService es preferible un diagrama de integraciones independiente cuando sea necesario mostrar dichas interfaces.

```plantuml
@startuml
' DFD nivel 0. Sintaxis básica compatible con importación PlantUML en draw.io.
title DFD de contexto — Sistema de Gestión Farmacéutica
left to right direction

skinparam backgroundColor white
skinparam shadowing false
skinparam roundcorner 0
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam linetype ortho
skinparam nodesep 70
skinparam ranksep 105
skinparam ArrowThickness 1.5
skinparam rectangle {
  BackgroundColor #F1F5F9
  BorderColor #64748B
  FontColor #172554
}

' Entidades externas — lado izquierdo
rectangle "Administrador" as Admin
rectangle "Vendedor / Cajero" as Cajero
rectangle "Encargado de\nInventario" as Inventario

' Proceso único (0)
rectangle "0\n─────────────\nSISTEMA DE GESTIÓN\nFARMACÉUTICA" as Sistema #194D85;line:#194D85;text:white

' Entidades externas — lado derecho
rectangle "Responsable de\nCompras" as Compras
rectangle "Cliente" as Cliente
rectangle "Proveedor" as Proveedor

' Entradas: de entidades externas hacia el sistema (azul)
Admin -[#3B6E9C]-> Sistema : Configuración y accesos
Cajero -[#3B6E9C]-> Sistema : Ventas, cobros y caja
Inventario -[#3B6E9C]-> Sistema : Lotes y movimientos
Compras -[#3B6E9C]-> Sistema : Órdenes y recepciones
Cliente -[#3B6E9C]-> Sistema : Pedidos y datos de entrega
Proveedor -[#3B6E9C]-> Sistema : Facturas y entregas

' Salidas: del sistema hacia las entidades externas (rojo)
Sistema -[#E45A73]-> Admin : Reportes y auditoría
Sistema -[#E45A73]-> Cajero : Comprobantes y estado de caja
Sistema -[#E45A73]-> Inventario : Existencias y alertas
Sistema -[#E45A73]-> Compras : Estados de compra
Sistema -[#E45A73]-> Cliente : Confirmación y comprobante
Sistema -[#E45A73]-> Proveedor : Órdenes de compra y devoluciones

' Orden visual de los actores (sin añadir flujos)
Admin -[hidden]down- Cajero
Cajero -[hidden]down- Inventario
Compras -[hidden]down- Cliente
Cliente -[hidden]down- Proveedor
@enduml
```

## Recomendaciones de presentación

- Usa el título **DFD de contexto – Sistema de Gestión Farmacéutica**.
- Coloca la figura sobre fondo blanco; si tienes una plantilla académica con bordes decorativos, aplica el borde fuera del dibujo.
- Mantén las entidades externas en gris claro, el sistema central en azul oscuro y las flechas en azul (entradas) y rojo (salidas).
- Si draw.io distribuye las cajas de forma distinta, ajusta manualmente su posición después de importar. PlantUML no garantiza una distribución exacta para todos los motores de renderizado.
- Los intercambios se han resumido para facilitar la lectura. Para trazabilidad detallada de movimientos, autorizaciones y procesos se utiliza el DFD de nivel 1.
