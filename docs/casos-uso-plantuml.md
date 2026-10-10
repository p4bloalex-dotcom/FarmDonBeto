# Diagramas de casos de uso del sistema

Diagramas en sintaxis PlantUML compatible con draw.io.

## 1. Seguridad y administracion de usuarios

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Administrador" as Admin
actor "Usuario del sistema" as Usuario

rectangle "Modulo de seguridad" {
  usecase "Iniciar sesion" as UC1
  usecase "Gestionar usuarios" as UC2
  usecase "Gestionar roles" as UC3
  usecase "Asignar permisos" as UC4
}

Usuario --> UC1
Admin --> UC2
Admin --> UC3
Admin --> UC4
UC3 ..> UC4 : define accesos

@enduml
```

## 2. Catalogo e inventario

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Administrador" as Admin
actor "Encargado de inventario" as Inventario

rectangle "Modulo de catalogo e inventario" {
  usecase "Gestionar medicamentos" as UC1
  usecase "Gestionar categorias,\npresentaciones y laboratorios" as UC2
  usecase "Consultar existencias" as UC3
  usecase "Registrar movimientos\nde inventario" as UC4
}

Admin --> UC1
Admin --> UC2
Inventario --> UC3
Inventario --> UC4
UC1 ..> UC3 : actualiza catalogo
UC4 ..> UC3 : modifica stock

@enduml
```

## 3. Ventas y caja

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Vendedor" as Vendedor
actor "Cajero" as Cajero
actor "Administrador" as Admin

rectangle "Modulo de ventas y caja" {
  usecase "Registrar venta" as UC1
  usecase "Procesar pago" as UC2
  usecase "Emitir comprobante" as UC3
  usecase "Administrar apertura\ny cierre de caja" as UC4
}

Vendedor --> UC1
Cajero --> UC2
Cajero --> UC3
Cajero --> UC4
Admin --> UC4
UC1 ..> UC2 : genera cobro
UC2 ..> UC3 : confirma pago

@enduml
```

## 4. Compras y proveedores

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Responsable de compras" as Compras
actor "Encargado de inventario" as Inventario
actor "Proveedor" as Proveedor

rectangle "Modulo de compras y proveedores" {
  usecase "Gestionar proveedores" as UC1
  usecase "Crear solicitud\nde compra" as UC2
  usecase "Registrar compra" as UC3
  usecase "Recepcionar productos" as UC4
}

Compras --> UC1
Compras --> UC2
Compras --> UC3
Proveedor --> UC3
Inventario --> UC4
UC2 ..> UC3 : origina compra
UC3 ..> UC4 : entrega productos

@enduml
```
