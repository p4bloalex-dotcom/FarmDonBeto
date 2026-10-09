# Diagramas de Secuencia

Fuente: flujos reales del backend en `Core/src/modules`. Se documentan tres procesos principales porque el sistema contiene mas de tres procesos funcionales.

## 1. Inicio de sesion

Proceso basado en `auth.controller.js`, `auth.repository.js`, `password.js` y `token.service.js`.

```mermaid
sequenceDiagram
  actor Usuario
  participant Frontend
  participant AuthRoutes as Auth Routes
  participant AuthController as Auth Controller
  participant AuthRepository as Auth Repository
  participant UserRepo as Repository User
  participant RoleRepo as Repository Role
  participant Password as Password Utils
  participant TokenService as Token Service
  participant DB as Oracle DB

  Usuario->>Frontend: Ingresa usuario y contrasena
  Frontend->>AuthRoutes: POST /auth/login
  AuthRoutes->>AuthController: login(req, res)
  AuthController->>AuthRepository: findUserByName(userName)
  AuthRepository->>UserRepo: findOneBy({ name })
  UserRepo->>DB: SELECT TB_USER
  DB-->>UserRepo: Usuario encontrado o null
  UserRepo-->>AuthRepository: User
  AuthRepository-->>AuthController: User

  alt Usuario no existe
    AuthController-->>Frontend: 401 Usuario o contrasena incorrecta
  else Usuario inactivo
    AuthController-->>Frontend: 401 Usuario o contrasena incorrecta
  else Password invalido
    AuthController->>Password: verifyPassword(password, salt, hash)
    Password-->>AuthController: false
    AuthController-->>Frontend: 401 Usuario o contrasena incorrecta
  else Credenciales validas
    AuthController->>Password: verifyPassword(password, salt, hash)
    Password-->>AuthController: true
    AuthController->>DB: BEGIN transaction
    AuthController->>AuthRepository: updateLastLogin(manager, user.id)
    AuthRepository->>UserRepo: update(lastLogin)
    UserRepo->>DB: UPDATE TB_USER
    AuthController->>AuthRepository: findRoleName(user.idRole)
    AuthRepository->>RoleRepo: findOneBy({ id })
    RoleRepo->>DB: SELECT TB_ROLE
    DB-->>RoleRepo: Role
    RoleRepo-->>AuthRepository: Role
    AuthRepository-->>AuthController: role.name
    AuthController->>TokenService: createAccessToken(user.id)
    TokenService-->>AuthController: JWT
    AuthController-->>Frontend: 200 Token, HasChangePassword, user
  end
```

## 2. Registro de venta presencial

Proceso basado en `sale.controller.js`, `sale.repository.js`, `inventory-lot.service.js` e `inventory-kardex.service.js`.

```mermaid
sequenceDiagram
  actor Cajero
  participant Frontend
  participant SaleRoutes as Sale Routes
  participant SaleController as Sale Controller
  participant SaleRepository as Sale Repository
  participant LotService as Inventory Lot Service
  participant KardexService as Kardex Service
  participant DB as Oracle DB

  Cajero->>Frontend: Captura productos, pagos y caja
  Frontend->>SaleRoutes: POST /sales
  SaleRoutes->>SaleController: addSale(req, res)
  SaleController->>DB: Validar Branch activo
  SaleController->>DB: Validar Employee activo
  SaleController->>DB: Validar CashSession abierta
  SaleController->>DB: Consultar CashRegister y balance de caja

  alt Validacion de venta falla
    SaleController-->>Frontend: 400 mensaje de regla de negocio
  else Validacion correcta
    SaleController->>SaleRepository: createSaleWithDetails(header, details, userId)
    SaleRepository->>DB: BEGIN transaction
    SaleRepository->>DB: Buscar CashSession abierta

    loop Por cada detalle de venta
      SaleRepository->>DB: Buscar Medicine activo
      SaleRepository->>DB: Buscar Inventory por sucursal y medicamento
      alt Stock insuficiente
        SaleRepository-->>SaleController: BusinessRuleError
        SaleController-->>Frontend: 400 Stock insuficiente
      else Stock disponible
        SaleRepository->>LotService: consumeLotsFefo(manager, branchId, medicineId, quantity)
        LotService->>DB: Buscar InventoryLot aprobado por FEFO
        LotService->>DB: Actualizar quantityAvailable y quantity del lote
        LotService-->>SaleRepository: Lotes consumidos
        SaleRepository->>DB: Actualizar TB_INVENTORY.stockAvailable
      end
    end

    SaleRepository->>DB: Insertar TB_SALE
    SaleRepository->>DB: Insertar TB_SALE_PAYMENT
    SaleRepository->>DB: Insertar TB_SALE_RECEIPT
    SaleRepository->>DB: Insertar TB_SALE_DETAIL
    SaleRepository->>DB: Insertar TB_SALE_LOT_DETAIL

    loop Por cada lote consumido
      SaleRepository->>KardexService: registerKardex(movementType SALE)
      KardexService->>DB: Insertar TB_INVENTORY_KARDEX
    end

    SaleRepository->>DB: Buscar CashMovementType SALE
    alt Pago en efectivo mayor a cero
      SaleRepository->>DB: Insertar TB_CASH_MOVEMENT
    end
    SaleRepository->>DB: COMMIT
    SaleRepository-->>SaleController: sale.id
    SaleController->>SaleRepository: findSaleById(id)
    SaleController->>SaleRepository: listSaleDetails(id)
    SaleController->>SaleRepository: listSalePayments(id)
    SaleController->>SaleRepository: findSaleReceipt(id)
    SaleController-->>Frontend: 201 Venta registrada correctamente
  end
```

## 3. Recepcion de orden de compra

Proceso basado en `purchase.controller.js`, `purchase.repository.js` e `inventory-lot.service.js`.

```mermaid
sequenceDiagram
  actor EncargadoCompras as Encargado de compras
  participant Frontend
  participant PurchaseRoutes as Purchase Routes
  participant PurchaseController as Purchase Controller
  participant PurchaseRepository as Purchase Repository
  participant LotService as Inventory Lot Service
  participant DB as Oracle DB

  EncargadoCompras->>Frontend: Registra recepcion con lotes y cantidades
  Frontend->>PurchaseRoutes: POST /purchases/receipts
  PurchaseRoutes->>PurchaseController: addPurchaseReceipt(req, res)
  PurchaseController->>DB: Buscar Purchase por purchaseId

  alt Orden no existe
    PurchaseController-->>Frontend: 404 Orden no encontrada
  else Estado no receivable
    PurchaseController-->>Frontend: 409 Estado invalido para recepcion
  else Orden aprobada o parcialmente recibida
    PurchaseController->>PurchaseRepository: receivePurchase(bodyWithUser(req))
    PurchaseRepository->>DB: BEGIN transaction
    PurchaseRepository->>DB: Buscar Purchase
    PurchaseRepository->>DB: Insertar TB_PURCHASE_RECEIPT
    PurchaseRepository->>DB: Actualizar branchId del receipt desde la orden

    loop Por cada linea recibida
      PurchaseRepository->>DB: Buscar PurchaseDetail
      PurchaseRepository->>PurchaseRepository: calculateReceiptLine(ordered, alreadyVerified, arrived, good)

      alt Cantidades invalidas
        PurchaseRepository-->>PurchaseController: BusinessRuleError
        PurchaseController-->>Frontend: 400 Mensaje de validacion
      else Cantidades validas
        PurchaseRepository->>DB: Insertar TB_PURCHASE_RECEIPT_DETAIL
        PurchaseRepository->>DB: Actualizar quantityReceived, quantityRejected, quantityPending y status de TB_PURCHASE_DETAIL

        alt Producto aceptado sin lote o vencimiento
          PurchaseRepository-->>PurchaseController: BusinessRuleError
          PurchaseController-->>Frontend: 400 Debe ingresar lote y vencimiento
        else Producto aceptado con lote y vencimiento
          PurchaseRepository->>LotService: addLotStock(... sanitaryStatus QUARANTINE)
          LotService->>DB: Crear o actualizar TB_INVENTORY_LOT en cuarentena
        end
      end
    end

    PurchaseRepository->>DB: Consultar todos los detalles de la orden
    PurchaseRepository->>PurchaseRepository: Calcular pendiente total
    alt Existen cantidades pendientes
      PurchaseRepository->>DB: Actualizar TB_PURCHASE.status = PARTIALLY_RECEIVED
    else Recepcion completa
      PurchaseRepository->>DB: Actualizar TB_PURCHASE.status = RECEIVED
      PurchaseRepository->>PurchaseRepository: createFulfillmentDeliveryRequests(...)
      PurchaseRepository->>DB: Crear DeliveryRequest si aplica abastecimiento automatico
    end
    PurchaseRepository->>DB: COMMIT
    PurchaseRepository-->>PurchaseController: receipt.id
    PurchaseController-->>Frontend: 201 Recepcion registrada
  end
```

## Procesos no detallados

El sistema contiene mas procesos funcionales, por ejemplo aprobacion de orden de compra, validacion tecnica de recepcion, factura de proveedor, pago de factura, devolucion a proveedor, pedidos de cliente, traspasos, caja, nomina y activos fijos. Por solicitud, este documento incluye solo tres diagramas.
