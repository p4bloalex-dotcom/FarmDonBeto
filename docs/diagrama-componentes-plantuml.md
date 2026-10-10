# Diagrama UML de componentes del sistema

Diagrama en sintaxis PlantUML compatible con draw.io. Representa los componentes principales del sistema, basado en la estructura del codigo del proyecto.

Fuentes principales revisadas:

- `Front/src/environments/environment.ts`
- `Core/src/app.js`
- `Core/src/routes/index.js`
- `Core/src/config/data-source.js`
- `Core/src/services/cache.service.js`
- `Core/src/services/mail.service.js`
- `Core/src/services/geolocation.service.js`
- `Core/src/utils/image-storage.js`

```plantuml
@startuml
title Diagrama de componentes - Sistema Farmacia
left to right direction

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam componentStyle rectangle
skinparam ArrowColor #334155
skinparam ArrowThickness 1.4
skinparam linetype ortho

skinparam component {
  BorderColor #1E293B
  FontColor #0F172A
}

actor "Usuario del sistema" as User #F8FAFC;line:#475569

component "1. Frontend Web\nAngular" as Front #DBEAFE;line:#1D4ED8 [
  Interfaz de usuario
  --
  Autenticacion
  Navegacion
  Formularios de ventas, compras,
  inventario, caja y reportes
]

component "2. Backend Core\nNode.js + Express" as Core #D1FAE5;line:#047857 [
  API REST /api
  --
  Rutas Express
  Middlewares de seguridad
  JWT, roles y permisos
  Modulos de negocio
  TypeORM repositories
]

component "3. Persistencia del sistema\nOracle + archivos locales" as Data #EDE9FE;line:#6D28D9 [
  Oracle Database
  --
  Entidades TypeORM
  Ventas, compras, caja,
  inventario, pedidos,
  seguridad y auditoria
  --
  public/uploads/medicines
]

component "4. Servicios externos\ny soporte" as External #FEF3C7;line:#B45309 [
  Redis Cache opcional
  SMTP correo
  OpenRouteService
  Geolocalizacion y rutas
]

User --> Front : usa el sistema
Front --> Core : HTTP/JSON\n/api
Core --> Front : respuestas JSON,\npaginacion y archivos

Core --> Data : TypeORM\nlectura/escritura
Data --> Core : datos del negocio\ny auditoria

Core --> Data : guarda imagenes\nde medicamentos
Data --> Front : sirve imagenes\n/uploads

Core --> External : cache de permisos,\ncorreo y geolocalizacion
External --> Core : datos cacheados,\nresultado SMTP, rutas y distancias

note right of Core
  Componente principal del backend.
  Segun `Core/src/routes/index.js`, agrupa
  seguridad, catalogos, inventario,
  ventas, compras, caja, pedidos,
  reportes, geolocalizacion y dashboard.
end note

note bottom of Data
  La base Oracle se configura en
  `Core/src/config/data-source.js`.
  Las imagenes se almacenan localmente
  desde `Core/src/utils/image-storage.js`.
end note

legend bottom
  |= Color |= Componente |
  |<#DBEAFE>| Frontend Angular |
  |<#D1FAE5>| Backend/API Core |
  |<#EDE9FE>| Persistencia |
  |<#FEF3C7>| Servicios externos y soporte |
endlegend

@enduml
```
