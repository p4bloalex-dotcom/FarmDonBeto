# Diagrama de Clases UML

Fuente: entidades TypeORM en `Core/src/entities` y tablas registradas en `Core/src/config/data-source.js`.

Convenciones: `+` primary key, `-` requerido, `~` nullable/opcional. El estereotipo de cada clase es la tabla Oracle real.

## Seguridad y Auditoria

```mermaid
classDiagram
  class User {
    <<TB_USER>>
    +number id PK
    -string name
    -string password
    -string salt
    -string status
    -boolean hasChangedPass
    ~Date lastLogin
    ~number idPersonal
    -number idRole
    ~number companyId
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Role {
    <<TB_ROLE>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Menu {
    <<TB_MENU>>
    +number id PK
    -string name
    -string icon
    ~number idMenuFather
    -string path
    -string status
    -number order
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Permission {
    <<TB_PERMISSION>>
    +number id PK
    -string name
    ~string description
    -string status
    -string category
    ~number menuId
  }
  class RoleMenu {
    <<TB_ROLE_MENU>>
    +number id PK
    -number idRole
    -number idMenu
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class RolePermission {
    <<T_ROLE_PERMISSION>>
    +number id PK
    -number idRole
    -number idPermission
    -string status
    -boolean isCheck
    -boolean isGlobal
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class AuditTrailLog {
    <<TB_AUDIT_TRAIL_LOG>>
    +number id PK
    -string tableName
    -string action
    ~string recordId
    ~number userId
    ~clob oldValues
    ~clob newValues
    -Date createdAt
  }
  User "0..*" --> "1" Role : role
  Menu "0..*" --> "1" Menu : parent
  Permission "0..*" --> "1" Menu : menu
  RoleMenu "0..*" --> "1" Role : role
  RoleMenu "0..*" --> "1" Menu : menu
  RolePermission "0..*" --> "1" Role : role
  RolePermission "0..*" --> "1" Permission : permission
```

## Empresa y Sucursales

```mermaid
classDiagram
  class Company {
    <<TB_COMPANY>>
    +number id PK
    -string name
    -string phone
    -number idDepartment
    -number idMunicipality
    ~string address
    -string email
    ~clob logo
    ~string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Branch {
    <<TB_BRANCH>>
    +number id PK
    -string name
    ~string phone
    ~string email
    ~string address
    -string branchType
    ~number idDepartment
    ~number idMunicipality
    ~number companyId
    -string status
    -number isMain
    ~decimal latitude
    ~decimal longitude
    -decimal coverageRadiusKm
    -number averageDeliveryMinutes
    ~number technicalDirectorEmployeeId
    ~string sanitaryLicenseNumber
    ~Date sanitaryLicenseExpiresAt
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Department {
    <<TB_DEPARTMENT>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
  }
  class Municipality {
    <<TB_MUNICIPALITY>>
    +number id PK
    -string name
    -number idDepartment
    -string status
    -Date createdAt
    ~Date updatedAt
  }
  class Employee {
    <<TB_EMPLOYEE>>
    +number id PK
    -string firstName
    ~string middleName
    ~string otherNames
    -string lastName
    ~string secondLastname
    -string phone
    -string gender
    -string email
    -string status
    ~number companyId
    ~number branchId
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  Branch "0..*" --> "1" Company : company
  Branch "0..*" --> "1" Department : department
  Branch "0..*" --> "1" Municipality : municipality
  Branch "0..*" --> "1" Employee : technicalDirector
  Municipality "0..*" --> "1" Department : department
  Employee "0..*" --> "1" Company : company
  Employee "0..*" --> "1" Branch : branch
```

## Catalogo Farmaceutico

```mermaid
classDiagram
  class Medicine {
    <<TB_MEDICINE>>
    +number id PK
    -number laboratoryId
    -number presentationId
    -number categoryId
    -number unitMeasurementId
    -string code
    -string name
    ~string description
    ~string imageUrl
    -decimal priceBuy
    -decimal priceSell
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MedicineCategory {
    <<TB_MEDICINE_CATEGORY>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MedicineLaboratory {
    <<TB_MEDICINE_LABORATORY>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MedicinePresentation {
    <<TB_MEDICINE_PRESENTATION>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class Supplier {
    <<TB_SUPPLIER>>
    +number id PK
    -string name
    ~string address
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SupplierMedicine {
    <<TB_SUPPLIER_MEDICINE>>
    +number id PK
    -number supplierId
    -number medicineId
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class UnitMeasurement {
    <<TB_UNIT_MEASUREMENT>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  Medicine "0..*" --> "1" MedicineLaboratory : laboratory
  Medicine "0..*" --> "1" MedicinePresentation : presentation
  Medicine "0..*" --> "1" MedicineCategory : category
  Medicine "0..*" --> "1" UnitMeasurement : unitMeasurement
  Medicine "1" --> "0..*" SupplierMedicine : supplierMedicines
  MedicineCategory "1" --> "0..*" Medicine : medicines
  MedicineLaboratory "1" --> "0..*" Medicine : medicines
  MedicinePresentation "1" --> "0..*" Medicine : medicines
  Supplier "1" --> "0..*" SupplierMedicine : supplierMedicines
  SupplierMedicine "0..*" --> "1" Supplier : supplier
  SupplierMedicine "0..*" --> "1" Medicine : medicine
  UnitMeasurement "1" --> "0..*" Medicine : medicines
```

## Inventario

```mermaid
classDiagram
  class Inventory {
    <<TB_INVENTORY>>
    +number id PK
    -number medicineId
    -number branchId
    -decimal stockAvailable
    -decimal reserve
    -decimal stockMin
    -decimal stockMax
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class InventoryLot {
    <<TB_INVENTORY_LOT>>
    +number id PK
    -number branchId
    -number medicineId
    ~number supplierId
    -string lotNumber
    -Date expirationDate
    -decimal quantity
    -decimal quantityAvailable
    -decimal quantityReserved
    -decimal quantityInTransit
    -decimal quantityQuarantine
    -decimal quantityDamaged
    -decimal quantityExpired
    -string sanitaryStatus
    ~string sanitaryBlockReason
    ~decimal purchasePrice
    ~Date receivedAt
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class InventoryKardex {
    <<TB_INVENTORY_KARDEX>>
    +number id PK
    -number branchId
    -number medicineId
    ~number inventoryLotId
    -Date movementDate
    -string movementType
    -decimal quantityIn
    -decimal quantityOut
    -decimal previousBalance
    -decimal balanceAfter
    ~decimal unitCost
    ~string referenceType
    ~number referenceId
    ~string reason
    -Date createdAt
    ~number createdBy
  }
  class InventoryAdjustment {
    <<TB_INVENTORY_ADJUSTMENT>>
    +number id PK
    -number branchId
    -number medicineId
    ~number inventoryLotId
    -Date adjustmentDate
    -decimal quantityBefore
    -decimal quantityAfter
    -decimal delta
    -string reason
    -Date createdAt
    ~number createdBy
  }
  class InventoryReservation {
    <<TB_INVENTORY_RESERVATION>>
    +number id PK
    -number branchId
    -number medicineId
    ~number customerOrderId
    -decimal quantity
    -Date reservedAt
    ~Date expiresAt
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MovementType {
    <<TB_MOVEMENT_TYPE>>
    +number id PK
    -string name
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MoveInventory {
    <<TB_MOVE_INVENTORY>>
    +number id PK
    -number branchOriginId
    -number branchDestinationId
    -number movementTypeId
    -Date movementDate
    ~string description
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class MoveInventoryDetail {
    <<TB_MOVE_INVENTORY_DETAIL>>
    +number id PK
    -number movementId
    -number medicineId
    -decimal quantity
    -decimal unitCost
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  InventoryKardex "0..*" --> "1" InventoryLot : inventoryLot
  InventoryAdjustment "0..*" --> "1" InventoryLot : inventoryLot
  MoveInventory "0..*" --> "1" MovementType : movementType
  MoveInventoryDetail "0..*" --> "1" MoveInventory : movement
```

## Compras y Recepcion

```mermaid
classDiagram
  class Purchase {
    <<TB_PURCHASE>>
    +number id PK
    ~string purchaseNumber
    -number supplierId
    -number branchId
    ~number warehouseId
    ~number purchaseRequestId
    ~number quotationId
    -Date purchaseDate
    ~Date expectedDeliveryDate
    ~string invoiceNumber
    ~number currencyId
    -decimal exchangeRate
    -decimal subtotal
    -decimal discount
    -decimal tax
    -decimal shippingCost
    -decimal otherCharges
    -decimal total
    ~number paymentTermsId
    ~string deliveryTerms
    -string status
    ~number approvedBy
    ~Date approvedAt
    ~string notes
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PurchaseDetail {
    <<TB_PURCHASE_DETAIL>>
    +number id PK
    -number purchaseId
    -number medicineId
    -decimal quantity
    ~decimal quantityOrdered
    -decimal quantityReceived
    ~decimal quantityPending
    -decimal quantityRejected
    ~number unitOfMeasureId
    -decimal unitPrice
    -decimal discountPercentage
    -decimal discountAmount
    -decimal taxPercentage
    -decimal taxAmount
    -decimal subtotal
    ~decimal total
    ~string lotNumber
    ~Date expirationDate
    ~Date expectedDeliveryDate
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PurchaseRequest {
    <<TB_PURCHASE_REQUEST>>
    +number id PK
    -string requestNumber
    -number branchId
    ~number warehouseId
    ~number requestedBy
    -Date requestDate
    ~Date requiredDate
    -string priority
    ~string reason
    -string source
    -string status
    ~string notes
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PurchaseRequestDetail {
    <<TB_PURCHASE_REQUEST_DETAIL>>
    +number id PK
    -number requestId
    ~number branchId
    -number medicineId
    ~number unitOfMeasureId
    -decimal currentStock
    -decimal availableStock
    -decimal minimumStock
    -decimal maximumStock
    -decimal averageConsumption
    -decimal suggestedQuantity
    -decimal requestedQuantity
    -Date createdAt
  }
  class PurchaseReceipt {
    <<TB_PURCHASE_RECEIPT>>
    +number id PK
    -string receiptNumber
    -number purchaseId
    ~number branchId
    ~number warehouseId
    -Date receivedAt
    ~number receivedBy
    ~number verifiedBy
    ~string supplierDeliveryDocument
    -string status
    ~string notes
    -Date createdAt
  }
  class PurchaseReceiptDetail {
    <<TB_PURCHASE_RECEIPT_DETAIL>>
    +number id PK
    -number receiptId
    ~number branchId
    -number purchaseDetailId
    -number medicineId
    -decimal quantityReceived
    -decimal quantityAccepted
    -decimal quantityRejected
    ~string batchNumber
    ~Date manufacturingDate
    ~Date expirationDate
    ~string storageCondition
    ~decimal temperatureAtReception
    ~number warehouseId
    ~number locationId
    -string qualityStatus
    ~string rejectionReason
    ~number receivedBy
    ~number verifiedBy
  }
  class PurchaseReturn {
    <<TB_PURCHASE_RETURN>>
    +number id PK
    -number supplierId
    ~number branchId
    -number purchaseId
    ~number receiptId
    -number medicineId
    ~string batchNumber
    -decimal quantity
    -string reason
    -string status
    ~number createdBy
    -Date createdAt
  }
  class SupplierInvoice {
    <<TB_SUPPLIER_INVOICE>>
    +number id PK
    -number supplierId
    ~number branchId
    -number purchaseId
    -string invoiceNumber
    -Date invoiceDate
    ~Date dueDate
    ~number currencyId
    -decimal exchangeRate
    -decimal subtotal
    -decimal tax
    -decimal discount
    -decimal total
    -string matchingStatus
    -string status
    ~string paymentSourceType
    ~number financialAccountId
    ~number cashSessionId
    ~Date paidAt
    ~number paidBy
    ~string documentAttachment
    ~number createdBy
    -Date createdAt
  }
  PurchaseDetail "0..*" --> "1" Purchase : purchase
  PurchaseRequestDetail "0..*" --> "1" PurchaseRequest : request
  PurchaseReceipt "0..*" --> "1" Purchase : purchase
  PurchaseReceiptDetail "0..*" --> "1" PurchaseReceipt : receipt
  PurchaseReceiptDetail "0..*" --> "1" PurchaseDetail : purchaseDetail
  SupplierInvoice "0..*" --> "1" Purchase : purchase
```

## Ventas Caja y Pedidos

```mermaid
classDiagram
  class Sale {
    <<TB_SALE>>
    +number id PK
    -number branchId
    -number employeeId
    ~number customerId
    -Date saleDate
    -number subtotal
    -number tax
    -number total
    -string status
    -string paymentMethod
    ~number cashSessionId
    -string felStatus
    -string saleChannel
    ~number originalOrderId
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SaleDetail {
    <<TB_SALE_DETAIL>>
    +number id PK
    -number saleId
    -number medicineId
    -number quantity
    -number unitPrice
    -number total
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SalePayment {
    <<TB_SALE_PAYMENT>>
    +number id PK
    -number saleId
    -number branchId
    -string method
    -decimal amount
    ~decimal receivedAmount
    ~decimal changeAmount
    ~string cardBrand
    ~string cardLast4
    ~string authorizationCode
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SaleReceipt {
    <<TB_SALE_RECEIPT>>
    +number id PK
    -number saleId
    -number branchId
    -string receiptNumber
    -string documentType
    ~string customerTaxId
    ~string customerName
    -decimal subtotal
    -decimal tax
    -decimal total
    -decimal paidTotal
    -decimal changeAmount
    -Date issuedAt
    -string status
    -Date createdAt
    ~number createdBy
  }
  class SaleReturn {
    <<TB_SALE_RETURN>>
    +number id PK
    -number saleId
    -number branchId
    -number cashSessionId
    -Date returnDate
    -string reason
    -string refundMethod
    -decimal total
    -number authorizedBy
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SaleReturnDetail {
    <<TB_SALE_RETURN_DETAIL>>
    +number id PK
    -number saleReturnId
    -number branchId
    -number saleDetailId
    -number medicineId
    -decimal quantity
    -decimal unitPrice
    -decimal total
    -boolean restockInventory
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class SaleLotDetail {
    <<TB_SALE_LOT_DETAIL>>
    +number id PK
    -number saleDetailId
    -number branchId
    -number inventoryLotId
    -string lotNumber
    -Date expirationDate
    -decimal quantity
    -Date createdAt
    ~number createdBy
  }
  class CashRegister {
    <<TB_CASH_REGISTER>>
    +number id PK
    -number branchId
    -string name
    -string code
    ~decimal cashLimit
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CashSession {
    <<TB_CASH_SESSION>>
    +number id PK
    -number cashRegisterId
    -number branchId
    -Date openingDate
    ~Date closingDate
    -number openingAmount
    ~number closingAmount
    ~number expectedAmount
    ~number differenceAmount
    ~clob countedBreakdown
    ~string differenceExplanation
    ~number authorizedBy
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CashMovement {
    <<TB_CASH_MOVEMENT>>
    +number id PK
    -number cashSessionId
    -number branchId
    -number movementTypeId
    -decimal amount
    ~string description
    ~number referenceId
    ~string referenceType
    ~number authorizedBy
    ~number reversalOfId
    -Date movementDate
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CashMovementType {
    <<TB_CASH_MOVEMENT_TYPE>>
    +number id PK
    -string name
    -string code
    -string operation
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CashReconciliation {
    <<TB_CASH_RECONCILIATION>>
    +number id PK
    -number cashSessionId
    -number branchId
    -string method
    -decimal systemAmount
    -decimal declaredAmount
    -decimal differenceAmount
    ~string notes
    ~number authorizedBy
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CustomerOrder {
    <<TB_CUSTOMER_ORDER>>
    +number id PK
    -number branchId
    -Date orderDate
    -string customerName
    -string customerPhone
    -string deliveryAddress
    ~string deliveryReference
    ~decimal deliveryLatitude
    ~decimal deliveryLongitude
    -string paymentMethod
    -string paymentStatus
    ~number saleId
    -number estimatedDeliveryMinutes
    -decimal subtotal
    -decimal deliveryFee
    -decimal total
    -string status
    ~string notes
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class CustomerOrderDetail {
    <<TB_CUSTOMER_ORDER_DETAIL>>
    +number id PK
    -number orderId
    -number medicineId
    -decimal quantity
    -decimal unitPrice
    -decimal subtotal
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class DeliveryRequest {
    <<TB_DELIVERY_REQUEST>>
    +number id PK
    -number requestingBranchId
    -number fulfillmentBranchId
    ~number movementId
    ~string customerName
    ~string customerContact
    -Date requestedAt
    ~Date neededAt
    ~Date deliveredAt
    ~string notes
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class DeliveryRequestDetail {
    <<TB_DELIVERY_REQUEST_DETAIL>>
    +number id PK
    -number requestId
    -number medicineId
    -decimal quantity
    -decimal unitCost
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  SaleDetail "0..*" --> "1" Sale : sale
  SalePayment "0..*" --> "1" Sale : sale
  SaleReceipt "0..*" --> "1" Sale : sale
  SaleReturn "0..*" --> "1" Sale : sale
  SaleReturn "0..*" --> "1" CashSession : cashSession
  SaleReturnDetail "0..*" --> "1" SaleReturn : saleReturn
  SaleLotDetail "0..*" --> "1" SaleDetail : saleDetail
  CashSession "0..*" --> "1" CashRegister : cashRegister
  CashMovement "0..*" --> "1" CashSession : cashSession
  CashMovement "0..*" --> "1" CashMovementType : cashMovementType
  CashReconciliation "0..*" --> "1" CashSession : cashSession
  CustomerOrder "1" --> "0..*" CustomerOrderDetail : details
  CustomerOrderDetail "0..*" --> "1" CustomerOrder : order
  DeliveryRequestDetail "0..*" --> "1" DeliveryRequest : request
```

## Nomina Activos y Tesoreria

```mermaid
classDiagram
  class PayrollPosition {
    <<TB_PAYROLL_POSITION>>
    +number id PK
    -string name
    ~string description
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class EmployeeSalary {
    <<TB_EMPLOYEE_SALARY>>
    +number id PK
    -number employeeId
    -number positionId
    -number branchId
    -decimal baseSalary
    -Date effectiveFrom
    ~Date effectiveTo
    -string status
    ~string notes
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PayrollConcept {
    <<TB_PAYROLL_CONCEPT>>
    +number id PK
    -string code
    -string name
    -string type
    -boolean isAutomatic
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PayrollPeriod {
    <<TB_PAYROLL_PERIOD>>
    +number id PK
    -string name
    ~number branchId
    -Date dateStart
    -Date dateEnd
    -Date payDate
    -string periodType
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PayrollDetail {
    <<TB_PAYROLL_DETAIL>>
    +number id PK
    -number payrollPaymentId
    -number branchId
    ~number conceptId
    -string type
    -decimal amount
    ~string description
    -Date createdAt
  }
  class PayrollPayment {
    <<TB_PAYROLL_PAYMENT>>
    +number id PK
    -number employeeId
    -number branchId
    ~number salaryId
    ~number positionId
    ~number periodId
    -Date paymentDate
    -Date periodStart
    -Date periodEnd
    -decimal baseSalary
    -decimal bonuses
    -decimal deductions
    -decimal total
    -string status
    ~string notes
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class PayrollAdjustment {
    <<TB_PAYROLL_ADJUSTMENT>>
    +number id PK
    -number employeeId
    -number branchId
    -Date adjustmentDate
    -string type
    -decimal amount
    -string reason
    -string status
    ~number payrollPaymentId
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class FixedAsset {
    <<TB_FIXED_ASSET>>
    +number id PK
    -number branchId
    -string code
    -string name
    -string category
    ~string brand
    ~string model
    ~string serialNumber
    ~string location
    ~string responsible
    -Date purchaseDate
    -decimal purchaseCost
    -decimal accumulatedDepreciation
    ~string supplier
    ~number usefulLifeMonths
    -string condition
    ~clob attributes
    ~string notes
    ~Date retiredAt
    ~string retiredReason
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class FixedAssetHistory {
    <<TB_FIXED_ASSET_HISTORY>>
    +number id PK
    -number fixedAssetId
    -string action
    ~number branchFromId
    ~number branchToId
    ~string locationFrom
    ~string locationTo
    ~string responsibleFrom
    ~string responsibleTo
    -string reason
    -Date createdAt
    ~number createdBy
  }
  class FinancialAccount {
    <<TB_FINANCIAL_ACCOUNT>>
    +number id PK
    -string name
    -string type
    ~string accountNumber
    -decimal openingBalance
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  class FinancialMovement {
    <<TB_FINANCIAL_MOVEMENT>>
    +number id PK
    ~number financialAccountId
    ~number cashSessionId
    ~number branchId
    -string sourceType
    -string operation
    -decimal amount
    -string description
    ~string referenceType
    ~number referenceId
    ~number reversalOfId
    ~Date reconciledAt
    ~string reconciliationNote
    -Date movementDate
    -string status
    -Date createdAt
    ~Date updatedAt
    ~number createdBy
    ~number updatedBy
  }
  EmployeeSalary "0..*" --> "1" PayrollPosition : position
  PayrollDetail "0..*" --> "1" PayrollPayment : payrollPayment
  PayrollDetail "0..*" --> "1" PayrollConcept : concept
  PayrollPayment "0..*" --> "1" EmployeeSalary : salary
  PayrollPayment "0..*" --> "1" PayrollPeriod : period
  PayrollPayment "0..*" --> "1" PayrollPosition : position
  PayrollAdjustment "0..*" --> "1" PayrollPayment : payrollPayment
  FixedAsset "1" --> "0..*" FixedAssetHistory : history
  FixedAssetHistory "0..*" --> "1" FixedAsset : fixedAsset
  FinancialAccount "1" --> "0..*" FinancialMovement : movements
  FinancialMovement "0..*" --> "1" FinancialAccount : account
  FinancialMovement "0..*" --> "1" FinancialMovement : reversalOf
```

## Relaciones Cross-Domain

```mermaid
classDiagram
  CashMovement "0..*" --> "1" Branch : branch
  CashReconciliation "0..*" --> "1" Branch : branch
  CashRegister "0..*" --> "1" Branch : branch
  CashSession "0..*" --> "1" Branch : branch
  CustomerOrder "0..*" --> "1" Branch : branch
  CustomerOrderDetail "0..*" --> "1" Medicine : medicine
  DeliveryRequest "0..*" --> "1" Branch : fulfillmentBranch
  DeliveryRequest "0..*" --> "1" Branch : requestingBranch
  DeliveryRequest "0..*" --> "1" MoveInventory : movement
  DeliveryRequestDetail "0..*" --> "1" Medicine : medicine
  EmployeeSalary "0..*" --> "1" Branch : branch
  EmployeeSalary "0..*" --> "1" Employee : employee
  FinancialMovement "0..*" --> "1" Branch : branch
  FinancialMovement "0..*" --> "1" CashSession : cashSession
  FixedAsset "0..*" --> "1" Branch : branch
  FixedAssetHistory "0..*" --> "1" Branch : branchFrom
  FixedAssetHistory "0..*" --> "1" Branch : branchTo
  Inventory "0..*" --> "1" Branch : branch
  Inventory "0..*" --> "1" Medicine : medicine
  InventoryAdjustment "0..*" --> "1" Branch : branch
  InventoryAdjustment "0..*" --> "1" Medicine : medicine
  InventoryKardex "0..*" --> "1" Branch : branch
  InventoryKardex "0..*" --> "1" Medicine : medicine
  InventoryLot "0..*" --> "1" Branch : branch
  InventoryLot "0..*" --> "1" Medicine : medicine
  InventoryLot "0..*" --> "1" Supplier : supplier
  InventoryReservation "0..*" --> "1" Branch : branch
  InventoryReservation "0..*" --> "1" CustomerOrder : customerOrder
  InventoryReservation "0..*" --> "1" Medicine : medicine
  MoveInventory "0..*" --> "1" Branch : branchDestination
  MoveInventory "0..*" --> "1" Branch : branchOrigin
  MoveInventoryDetail "0..*" --> "1" Medicine : medicine
  PayrollAdjustment "0..*" --> "1" Branch : branch
  PayrollAdjustment "0..*" --> "1" Employee : employee
  PayrollDetail "0..*" --> "1" Branch : branch
  PayrollPayment "0..*" --> "1" Branch : branch
  PayrollPayment "0..*" --> "1" Employee : employee
  PayrollPeriod "0..*" --> "1" Branch : branch
  Purchase "0..*" --> "1" Branch : branch
  Purchase "0..*" --> "1" Supplier : supplier
  PurchaseDetail "0..*" --> "1" Medicine : medicine
  PurchaseReceiptDetail "0..*" --> "1" Medicine : medicine
  PurchaseRequest "0..*" --> "1" Branch : branch
  PurchaseRequestDetail "0..*" --> "1" Medicine : medicine
  Sale "0..*" --> "1" Branch : branch
  Sale "0..*" --> "1" Employee : employee
  SaleDetail "0..*" --> "1" Medicine : medicine
  SaleLotDetail "0..*" --> "1" Branch : branch
  SaleLotDetail "0..*" --> "1" InventoryLot : inventoryLot
  SaleReceipt "0..*" --> "1" Branch : branch
  SaleReturn "0..*" --> "1" Branch : branch
  SaleReturnDetail "0..*" --> "1" Medicine : medicine
  SupplierInvoice "0..*" --> "1" Supplier : supplier
  User "1" --> "0..1" Employee : employee
```

## Trazabilidad Clase-Tabla

| Clase | Tabla | Atributos | Relaciones declaradas |
|---|---|---:|---:|
| AuditTrailLog | TB_AUDIT_TRAIL_LOG | 8 | 0 |
| Branch | TB_BRANCH | 22 | 4 |
| CashMovement | TB_CASH_MOVEMENT | 16 | 3 |
| CashMovementType | TB_CASH_MOVEMENT_TYPE | 9 | 0 |
| CashReconciliation | TB_CASH_RECONCILIATION | 14 | 2 |
| CashRegister | TB_CASH_REGISTER | 10 | 1 |
| CashSession | TB_CASH_SESSION | 17 | 2 |
| Company | TB_COMPANY | 13 | 0 |
| CustomerOrder | TB_CUSTOMER_ORDER | 22 | 2 |
| CustomerOrderDetail | TB_CUSTOMER_ORDER_DETAIL | 11 | 2 |
| DeliveryRequest | TB_DELIVERY_REQUEST | 15 | 3 |
| DeliveryRequestDetail | TB_DELIVERY_REQUEST_DETAIL | 9 | 2 |
| Department | TB_DEPARTMENT | 5 | 0 |
| Employee | TB_EMPLOYEE | 16 | 2 |
| EmployeeSalary | TB_EMPLOYEE_SALARY | 13 | 3 |
| FinancialAccount | TB_FINANCIAL_ACCOUNT | 10 | 1 |
| FinancialMovement | TB_FINANCIAL_MOVEMENT | 19 | 4 |
| FixedAsset | TB_FIXED_ASSET | 25 | 2 |
| FixedAssetHistory | TB_FIXED_ASSET_HISTORY | 12 | 3 |
| Inventory | TB_INVENTORY | 11 | 2 |
| InventoryAdjustment | TB_INVENTORY_ADJUSTMENT | 11 | 3 |
| InventoryKardex | TB_INVENTORY_KARDEX | 16 | 3 |
| InventoryLot | TB_INVENTORY_LOT | 22 | 3 |
| InventoryReservation | TB_INVENTORY_RESERVATION | 12 | 3 |
| Medicine | TB_MEDICINE | 16 | 5 |
| MedicineCategory | TB_MEDICINE_CATEGORY | 7 | 1 |
| MedicineLaboratory | TB_MEDICINE_LABORATORY | 7 | 1 |
| MedicinePresentation | TB_MEDICINE_PRESENTATION | 7 | 1 |
| Menu | TB_MENU | 11 | 1 |
| MoveInventory | TB_MOVE_INVENTORY | 11 | 3 |
| MoveInventoryDetail | TB_MOVE_INVENTORY_DETAIL | 9 | 2 |
| MovementType | TB_MOVEMENT_TYPE | 7 | 0 |
| Municipality | TB_MUNICIPALITY | 6 | 1 |
| PayrollAdjustment | TB_PAYROLL_ADJUSTMENT | 13 | 3 |
| PayrollConcept | TB_PAYROLL_CONCEPT | 10 | 0 |
| PayrollDetail | TB_PAYROLL_DETAIL | 8 | 3 |
| PayrollPayment | TB_PAYROLL_PAYMENT | 19 | 5 |
| PayrollPeriod | TB_PAYROLL_PERIOD | 12 | 1 |
| PayrollPosition | TB_PAYROLL_POSITION | 8 | 0 |
| Permission | TB_PERMISSION | 6 | 1 |
| Purchase | TB_PURCHASE | 28 | 2 |
| PurchaseDetail | TB_PURCHASE_DETAIL | 24 | 2 |
| PurchaseReceipt | TB_PURCHASE_RECEIPT | 12 | 1 |
| PurchaseReceiptDetail | TB_PURCHASE_RECEIPT_DETAIL | 19 | 3 |
| PurchaseRequest | TB_PURCHASE_REQUEST | 16 | 1 |
| PurchaseRequestDetail | TB_PURCHASE_REQUEST_DETAIL | 13 | 2 |
| PurchaseReturn | TB_PURCHASE_RETURN | 12 | 0 |
| Role | TB_ROLE | 7 | 0 |
| RoleMenu | TB_ROLE_MENU | 8 | 2 |
| RolePermission | T_ROLE_PERMISSION | 10 | 2 |
| Sale | TB_SALE | 18 | 2 |
| SaleDetail | TB_SALE_DETAIL | 11 | 2 |
| SaleLotDetail | TB_SALE_LOT_DETAIL | 9 | 3 |
| SalePayment | TB_SALE_PAYMENT | 15 | 1 |
| SaleReceipt | TB_SALE_RECEIPT | 16 | 2 |
| SaleReturn | TB_SALE_RETURN | 14 | 3 |
| SaleReturnDetail | TB_SALE_RETURN_DETAIL | 14 | 2 |
| Supplier | TB_SUPPLIER | 8 | 1 |
| SupplierInvoice | TB_SUPPLIER_INVOICE | 23 | 2 |
| SupplierMedicine | TB_SUPPLIER_MEDICINE | 8 | 2 |
| UnitMeasurement | TB_UNIT_MEASUREMENT | 7 | 1 |
| User | TB_USER | 14 | 2 |
