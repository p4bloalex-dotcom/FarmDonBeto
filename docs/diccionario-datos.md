# Diccionario de datos de la base de datos

Documento generado a partir de las entidades TypeORM ubicadas en `Core/src/entities`.

## TB_AUDIT_TRAIL_LOG

Entidad: `AuditTrailLog`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| TABLE_NAME | VARCHAR2(80) | NOT NULL | Nombre del registro. |
| ACTION | VARCHAR2(20) | NOT NULL | Dato de action. |
| RECORD_ID | VARCHAR2(80) | NULL | Referencia a record id. |
| USER_ID | NUMBER | NULL | Referencia a user id. |
| OLD_VALUES | CLOB | NULL | Dato de old values. |
| NEW_VALUES | CLOB | NULL | Dato de new values. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_BRANCH

Entidad: `Branch`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| PHONE | VARCHAR2(20) | NULL | Telefono de contacto. |
| EMAIL | VARCHAR2(120) | NULL | Correo electronico. |
| ADDRESS | VARCHAR2(150) | NULL | Direccion registrada. |
| BRANCH_TYPE | VARCHAR2(30) | NOT NULL, DEFAULT "CENTRO_COMERCIAL" | Dato de branch type. |
| ID_DEPARTMENT | NUMBER | FK -> Department, NULL | Referencia a identificador de department. |
| ID_MUNICIPALITY | NUMBER | FK -> Municipality, NULL | Referencia a identificador de municipality. |
| COMPANY_ID | NUMBER | FK -> Company, NULL | Referencia a company id. |
| STATUS | VARCHAR2(1) | NOT NULL, DEFAULT "E" | Estado del registro. |
| IS_MAIN | NUMBER | NOT NULL, DEFAULT 0 | Dato de is main. |
| LATITUDE | DECIMAL(10,7) | NULL | Dato de latitude. |
| LONGITUDE | DECIMAL(10,7) | NULL | Dato de longitude. |
| COVERAGE_RADIUS_KM | DECIMAL(8,2) | NOT NULL, DEFAULT 8 | Dato de coverage radius km. |
| AVERAGE_DELIVERY_MINUTES | NUMBER | NOT NULL, DEFAULT 25 | Dato de average delivery minutes. |
| TECHNICAL_DIRECTOR_EMPLOYEE_ID | NUMBER | FK -> Employee, NULL | Referencia a technical director employee id. |
| SANITARY_LICENSE_NUMBER | VARCHAR2(80) | NULL | Dato de sanitary license number. |
| SANITARY_LICENSE_EXPIRES_AT | TIMESTAMP | NULL | Dato de sanitary license expires at. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CASH_MOVEMENT_TYPE

Entidad: `CashMovementType`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| CODE | VARCHAR2(30) | UNIQUE, NOT NULL | Codigo del registro. |
| OPERATION | VARCHAR2(1) | NOT NULL, DEFAULT "E" | Dato de operation. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CASH_MOVEMENT

Entidad: `CashMovement`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| CASH_SESSION_ID | NUMBER | FK -> CashSession, NOT NULL | Referencia a cash session id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| MOVEMENT_TYPE_ID | NUMBER | FK -> CashMovementType, NOT NULL | Referencia a movement type id. |
| AMOUNT | DECIMAL(12,2) | NOT NULL | Monto de amount. |
| DESCRIPTION | VARCHAR2(255) | NULL | Descripcion del registro. |
| REFERENCE_ID | NUMBER | NULL | Referencia a reference id. |
| REFERENCE_TYPE | VARCHAR2(50) | NULL | Dato de reference type. |
| AUTHORIZED_BY | NUMBER | NULL | Dato de authorized by. |
| REVERSAL_OF_ID | NUMBER | NULL | Referencia a reversal of id. |
| MOVEMENT_DATE | TIMESTAMP | NOT NULL | Fecha de movement date. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CASH_RECONCILIATION

Entidad: `CashReconciliation`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| CASH_SESSION_ID | NUMBER | FK -> CashSession, NOT NULL | Referencia a cash session id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| METHOD | VARCHAR2(30) | NOT NULL | Dato de method. |
| SYSTEM_AMOUNT | DECIMAL(12,2) | NOT NULL | Monto de system amount. |
| DECLARED_AMOUNT | DECIMAL(12,2) | NOT NULL | Monto de declared amount. |
| DIFFERENCE_AMOUNT | DECIMAL(12,2) | NOT NULL | Monto de difference amount. |
| NOTES | VARCHAR2(500) | NULL | Dato de notes. |
| AUTHORIZED_BY | NUMBER | NULL | Dato de authorized by. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CASH_REGISTER

Entidad: `CashRegister`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| CODE | VARCHAR2(30) | UNIQUE, NOT NULL | Codigo del registro. |
| CASH_LIMIT | DECIMAL(12,2) | NULL | Dato de cash limit. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CASH_SESSION

Entidad: `CashSession`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| CASH_REGISTER_ID | NUMBER | FK -> CashRegister, NOT NULL | Referencia a cash register id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| OPENING_DATE | TIMESTAMP | NOT NULL | Fecha de opening date. |
| CLOSING_DATE | TIMESTAMP | NULL | Fecha de closing date. |
| OPENING_AMOUNT | NUMBER | NOT NULL | Monto de opening amount. |
| CLOSING_AMOUNT | NUMBER | NULL | Monto de closing amount. |
| EXPECTED_AMOUNT | NUMBER | NULL | Monto de expected amount. |
| DIFFERENCE_AMOUNT | NUMBER | NULL | Monto de difference amount. |
| COUNTED_BREAKDOWN | CLOB | NULL | Dato de counted breakdown. |
| DIFFERENCE_EXPLANATION | VARCHAR2(500) | NULL | Dato de difference explanation. |
| AUTHORIZED_BY | NUMBER | NULL | Dato de authorized by. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_COMPANY

Entidad: `Company`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| PHONE | VARCHAR2(20) | NOT NULL | Telefono de contacto. |
| ID_DEPARTMENT | NUMBER | NOT NULL | Referencia a identificador de department. |
| ID_MUNICIPALITY | NUMBER | NOT NULL | Referencia a identificador de municipality. |
| ADDRESS | VARCHAR2(100) | NULL | Direccion registrada. |
| EMAIL | VARCHAR2(40) | NOT NULL | Correo electronico. |
| LOGO | CLOB | NULL | Dato de logo. |
| STATUS | VARCHAR2(2) | NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CUSTOMER_ORDER_DETAIL

Entidad: `CustomerOrderDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| ORDER_ID | NUMBER | FK -> CustomerOrder, NOT NULL | Referencia a order id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | DECIMAL(12,2) | NOT NULL | Cantidad de quantity. |
| UNIT_PRICE | DECIMAL(14,2) | NOT NULL | Precio de unit price. |
| SUBTOTAL | DECIMAL(14,2) | NOT NULL | Monto de subtotal. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_CUSTOMER_ORDER

Entidad: `CustomerOrder`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| ORDER_DATE | TIMESTAMP | NOT NULL | Fecha de order date. |
| CUSTOMER_NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| CUSTOMER_PHONE | VARCHAR2(30) | NOT NULL | Telefono de contacto. |
| DELIVERY_ADDRESS | VARCHAR2(255) | NOT NULL | Direccion registrada. |
| DELIVERY_REFERENCE | VARCHAR2(255) | NULL | Dato de delivery reference. |
| DELIVERY_LATITUDE | DECIMAL(10,7) | NULL | Dato de delivery latitude. |
| DELIVERY_LONGITUDE | DECIMAL(10,7) | NULL | Dato de delivery longitude. |
| PAYMENT_METHOD | VARCHAR2(20) | NOT NULL | Dato de payment method. |
| PAYMENT_STATUS | VARCHAR2(20) | NOT NULL, DEFAULT "PENDING" | Dato de payment status. |
| SALE_ID | NUMBER | NULL | Referencia a sale id. |
| ESTIMATED_DELIVERY_MINUTES | NUMBER | NOT NULL | Dato de estimated delivery minutes. |
| SUBTOTAL | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de subtotal. |
| DELIVERY_FEE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de delivery fee. |
| TOTAL | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de total. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "P" | Estado del registro. |
| NOTES | VARCHAR2(255) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_DELIVERY_REQUEST_DETAIL

Entidad: `DeliveryRequestDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| REQUEST_ID | NUMBER | FK -> DeliveryRequest, NOT NULL | Referencia a request id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | DECIMAL(12,2) | NOT NULL | Cantidad de quantity. |
| UNIT_COST | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Dato de unit cost. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_DELIVERY_REQUEST

Entidad: `DeliveryRequest`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| REQUESTING_BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a requesting branch id. |
| FULFILLMENT_BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a fulfillment branch id. |
| MOVEMENT_ID | NUMBER | FK -> MoveInventory, NULL | Referencia a movement id. |
| CUSTOMER_NAME | VARCHAR2(120) | NULL | Nombre del registro. |
| CUSTOMER_CONTACT | VARCHAR2(80) | NULL | Dato de customer contact. |
| REQUESTED_AT | TIMESTAMP | NOT NULL | Dato de requested at. |
| NEEDED_AT | TIMESTAMP | NULL | Dato de needed at. |
| DELIVERED_AT | TIMESTAMP | NULL | Dato de delivered at. |
| NOTES | VARCHAR2(255) | NULL | Dato de notes. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "P" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_DEPARTMENT

Entidad: `Department`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | UNIQUE, NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |

## TB_EMPLOYEE_SALARY

Entidad: `EmployeeSalary`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| EMPLOYEE_ID | NUMBER | FK -> Employee, NOT NULL | Referencia a employee id. |
| POSITION_ID | NUMBER | FK -> PayrollPosition, NOT NULL | Referencia a position id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| BASE_SALARY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de base salary. |
| EFFECTIVE_FROM | TIMESTAMP | NOT NULL | Dato de effective from. |
| EFFECTIVE_TO | TIMESTAMP | NULL | Dato de effective to. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "A" | Estado del registro. |
| NOTES | VARCHAR2(255) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_EMPLOYEE

Entidad: `Employee`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| FIRST_NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| MIDDLE_NAME | VARCHAR2(100) | NULL | Nombre del registro. |
| OTHER_NAMES | VARCHAR2(100) | NULL | Nombre del registro. |
| LAST_NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| SECOND_LASTNAME | VARCHAR2(100) | NULL | Nombre del registro. |
| PHONE | VARCHAR2(20) | NOT NULL | Telefono de contacto. |
| GENDER | VARCHAR2(1) | NOT NULL | Dato de gender. |
| EMAIL | VARCHAR2(120) | UNIQUE, NOT NULL | Correo electronico. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| COMPANY_ID | NUMBER | FK -> Company, NULL | Referencia a company id. |
| BRANCH_ID | NUMBER | FK -> Branch, NULL | Referencia a branch id. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_FINANCIAL_ACCOUNT

Entidad: `FinancialAccount`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| TYPE | VARCHAR2(20) | NOT NULL | Dato de type. |
| ACCOUNT_NUMBER | VARCHAR2(60) | NULL | Dato de account number. |
| OPENING_BALANCE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de opening balance. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_FINANCIAL_MOVEMENT

Entidad: `FinancialMovement`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| FINANCIAL_ACCOUNT_ID | NUMBER | FK -> FinancialAccount, NULL | Referencia a financial account id. |
| CASH_SESSION_ID | NUMBER | FK -> CashSession, NULL | Referencia a cash session id. |
| BRANCH_ID | NUMBER | FK -> Branch, NULL | Referencia a branch id. |
| SOURCE_TYPE | VARCHAR2(20) | NOT NULL | Dato de source type. |
| OPERATION | VARCHAR2(1) | NOT NULL | Dato de operation. |
| AMOUNT | DECIMAL(14,2) | NOT NULL | Monto de amount. |
| DESCRIPTION | VARCHAR2(255) | NOT NULL | Descripcion del registro. |
| REFERENCE_TYPE | VARCHAR2(40) | NULL | Dato de reference type. |
| REFERENCE_ID | NUMBER | NULL | Referencia a reference id. |
| REVERSAL_OF_ID | NUMBER | FK -> FinancialMovement, NULL | Referencia a reversal of id. |
| RECONCILED_AT | TIMESTAMP | NULL | Dato de reconciled at. |
| RECONCILIATION_NOTE | VARCHAR2(255) | NULL | Dato de reconciliation note. |
| MOVEMENT_DATE | TIMESTAMP | NOT NULL | Fecha de movement date. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_FIXED_ASSET_HISTORY

Entidad: `FixedAssetHistory`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| FIXED_ASSET_ID | NUMBER | FK -> FixedAsset, NOT NULL | Referencia a fixed asset id. |
| ACTION | VARCHAR2(20) | NOT NULL | Dato de action. |
| BRANCH_FROM_ID | NUMBER | FK -> Branch, NULL | Referencia a branch from id. |
| BRANCH_TO_ID | NUMBER | FK -> Branch, NULL | Referencia a branch to id. |
| LOCATION_FROM | VARCHAR2(120) | NULL | Dato de location from. |
| LOCATION_TO | VARCHAR2(120) | NULL | Dato de location to. |
| RESPONSIBLE_FROM | VARCHAR2(120) | NULL | Dato de responsible from. |
| RESPONSIBLE_TO | VARCHAR2(120) | NULL | Dato de responsible to. |
| REASON | VARCHAR2(255) | NOT NULL | Dato de reason. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |

## TB_FIXED_ASSET

Entidad: `FixedAsset`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| CODE | VARCHAR2(40) | NOT NULL | Codigo del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| CATEGORY | VARCHAR2(80) | NOT NULL | Dato de category. |
| BRAND | VARCHAR2(80) | NULL | Dato de brand. |
| MODEL | VARCHAR2(80) | NULL | Dato de model. |
| SERIAL_NUMBER | VARCHAR2(80) | NULL | Dato de serial number. |
| LOCATION | VARCHAR2(120) | NULL | Dato de location. |
| RESPONSIBLE | VARCHAR2(120) | NULL | Dato de responsible. |
| PURCHASE_DATE | TIMESTAMP | NOT NULL | Fecha de purchase date. |
| PURCHASE_COST | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de purchase cost. |
| ACCUMULATED_DEPRECIATION | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de accumulated depreciation. |
| SUPPLIER | VARCHAR2(120) | NULL | Dato de supplier. |
| USEFUL_LIFE_MONTHS | NUMBER | NULL | Dato de useful life months. |
| CONDITION | VARCHAR2(10) | NOT NULL, DEFAULT "BUENO" | Dato de condition. |
| ATTRIBUTES | CLOB | NULL | Dato de attributes. |
| NOTES | VARCHAR2(255) | NULL | Dato de notes. |
| RETIRED_AT | TIMESTAMP | NULL | Dato de retired at. |
| RETIRED_REASON | VARCHAR2(255) | NULL | Dato de retired reason. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_INVENTORY_ADJUSTMENT

Entidad: `InventoryAdjustment`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| INVENTORY_LOT_ID | NUMBER | FK -> InventoryLot, NULL | Referencia a inventory lot id. |
| ADJUSTMENT_DATE | TIMESTAMP | NOT NULL | Fecha de adjustment date. |
| QUANTITY_BEFORE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity before. |
| QUANTITY_AFTER | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity after. |
| DELTA | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de delta. |
| REASON | VARCHAR2(255) | NOT NULL | Dato de reason. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |

## TB_INVENTORY_KARDEX

Entidad: `InventoryKardex`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| INVENTORY_LOT_ID | NUMBER | FK -> InventoryLot, NULL | Referencia a inventory lot id. |
| MOVEMENT_DATE | TIMESTAMP | NOT NULL | Fecha de movement date. |
| MOVEMENT_TYPE | VARCHAR2(30) | NOT NULL | Dato de movement type. |
| QUANTITY_IN | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity in. |
| QUANTITY_OUT | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity out. |
| PREVIOUS_BALANCE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de previous balance. |
| BALANCE_AFTER | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de balance after. |
| UNIT_COST | DECIMAL(14,2) | NULL | Dato de unit cost. |
| REFERENCE_TYPE | VARCHAR2(50) | NULL | Dato de reference type. |
| REFERENCE_ID | NUMBER | NULL | Referencia a reference id. |
| REASON | VARCHAR2(255) | NULL | Dato de reason. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |

## TB_INVENTORY_LOT

Entidad: `InventoryLot`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| SUPPLIER_ID | NUMBER | FK -> Supplier, NULL | Referencia a supplier id. |
| LOT_NUMBER | VARCHAR2(60) | NOT NULL | Dato de lot number. |
| EXPIRATION_DATE | TIMESTAMP | NOT NULL | Fecha de expiration date. |
| QUANTITY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity. |
| QUANTITY_AVAILABLE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity available. |
| QUANTITY_RESERVED | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity reserved. |
| QUANTITY_IN_TRANSIT | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity in transit. |
| QUANTITY_QUARANTINE | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity quarantine. |
| QUANTITY_DAMAGED | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity damaged. |
| QUANTITY_EXPIRED | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity expired. |
| SANITARY_STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "APPROVED" | Dato de sanitary status. |
| SANITARY_BLOCK_REASON | VARCHAR2(500) | NULL | Dato de sanitary block reason. |
| PURCHASE_PRICE | DECIMAL(14,2) | NULL | Precio de purchase price. |
| RECEIVED_AT | TIMESTAMP | NULL | Dato de received at. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_INVENTORY_RESERVATION

Entidad: `InventoryReservation`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| CUSTOMER_ORDER_ID | NUMBER | FK -> CustomerOrder, NULL | Referencia a customer order id. |
| QUANTITY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity. |
| RESERVED_AT | TIMESTAMP | NOT NULL | Dato de reserved at. |
| EXPIRES_AT | TIMESTAMP | NULL | Dato de expires at. |
| STATUS | VARCHAR2(20) | NOT NULL, DEFAULT "ACTIVE" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_INVENTORY

Entidad: `Inventory`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| STOCK_AVAILABLE | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cantidad de stock available. |
| RESERVE | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Dato de reserve. |
| STOCK_MIN | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cantidad de stock min. |
| STOCK_MAX | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cantidad de stock max. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MEDICINE_CATEGORY

Entidad: `MedicineCategory`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MEDICINE_LABORATORY

Entidad: `MedicineLaboratory`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(150) | NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MEDICINE_PRESENTATION

Entidad: `MedicinePresentation`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MEDICINE

Entidad: `Medicine`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| LABORATORY_ID | NUMBER | FK -> MedicineLaboratory, NOT NULL | Referencia a laboratory id. |
| PRESENTATION_ID | NUMBER | FK -> MedicinePresentation, NOT NULL | Referencia a presentation id. |
| CATEGORY_ID | NUMBER | FK -> MedicineCategory, NOT NULL | Referencia a category id. |
| UNIT_MEASUREMENT_ID | NUMBER | FK -> UnitMeasurement, NOT NULL | Referencia a unit measurement id. |
| CODE | VARCHAR2(50) | UNIQUE, NOT NULL | Codigo del registro. |
| NAME | VARCHAR2(150) | NOT NULL | Nombre del registro. |
| DESCRIPTION | VARCHAR2(500) | NULL | Descripcion del registro. |
| IMAGE_URL | VARCHAR2(500) | NULL | Dato de image url. |
| PRICE_BUY | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Precio de price buy. |
| PRICE_SELL | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Precio de price sell. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MENU

Entidad: `Menu`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(50) | NOT NULL | Nombre del registro. |
| ICON | VARCHAR2(50) | NOT NULL | Dato de icon. |
| ID_MENU_FATHER | NUMBER | FK -> Menu, NULL | Referencia a identificador de menu father. |
| PATH | VARCHAR2(200) | NOT NULL | Dato de path. |
| STATUS | VARCHAR2(1) | NOT NULL, DEFAULT "E" | Estado del registro. |
| MENU_ORDER | NUMBER | NOT NULL, DEFAULT 0 | Dato de menu order. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MOVE_INVENTORY_DETAIL

Entidad: `MoveInventoryDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| MOVEMENT_ID | NUMBER | FK -> MoveInventory, NOT NULL | Referencia a movement id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | DECIMAL(12,2) | NOT NULL | Cantidad de quantity. |
| UNIT_COST | DECIMAL(12,2) | NOT NULL | Dato de unit cost. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MOVE_INVENTORY

Entidad: `MoveInventory`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ORIGIN_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch origin id. |
| BRANCH_DESTINATION_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch destination id. |
| MOVEMENT_TYPE_ID | NUMBER | FK -> MovementType, NOT NULL | Referencia a movement type id. |
| MOVEMENT_DATE | TIMESTAMP | NOT NULL | Fecha de movement date. |
| DESCRIPTION | VARCHAR2(255) | NULL | Descripcion del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MOVEMENT_TYPE

Entidad: `MovementType`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_MUNICIPALITY

Entidad: `Municipality`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| ID_DEPARTMENT | NUMBER | FK -> Department, NOT NULL | Referencia a identificador de department. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |

## TB_PAYROLL_ADJUSTMENT

Entidad: `PayrollAdjustment`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| EMPLOYEE_ID | NUMBER | FK -> Employee, NOT NULL | Referencia a employee id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| ADJUSTMENT_DATE | TIMESTAMP | NOT NULL | Fecha de adjustment date. |
| TYPE | VARCHAR2(1) | NOT NULL | Dato de type. |
| AMOUNT | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de amount. |
| REASON | VARCHAR2(255) | NOT NULL | Dato de reason. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "P" | Estado del registro. |
| PAYROLL_PAYMENT_ID | NUMBER | FK -> PayrollPayment, NULL | Referencia a payroll payment id. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PAYROLL_CONCEPT

Entidad: `PayrollConcept`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| CODE | VARCHAR2(30) | UNIQUE, NOT NULL | Codigo del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| TYPE | VARCHAR2(20) | NOT NULL | Dato de type. |
| IS_AUTOMATIC | BOOLEAN | NOT NULL, DEFAULT false | Dato de is automatic. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PAYROLL_DETAIL

Entidad: `PayrollDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| PAYROLL_PAYMENT_ID | NUMBER | FK -> PayrollPayment, NOT NULL | Referencia a payroll payment id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| CONCEPT_ID | NUMBER | FK -> PayrollConcept, NULL | Referencia a concept id. |
| TYPE | VARCHAR2(20) | NOT NULL | Dato de type. |
| AMOUNT | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de amount. |
| DESCRIPTION | VARCHAR2(255) | NULL | Descripcion del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_PAYROLL_PAYMENT

Entidad: `PayrollPayment`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| EMPLOYEE_ID | NUMBER | FK -> Employee, NOT NULL | Referencia a employee id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| SALARY_ID | NUMBER | FK -> EmployeeSalary, NULL | Referencia a salary id. |
| POSITION_ID | NUMBER | FK -> PayrollPosition, NULL | Referencia a position id. |
| PERIOD_ID | NUMBER | FK -> PayrollPeriod, NULL | Referencia a period id. |
| PAYMENT_DATE | TIMESTAMP | NOT NULL | Fecha de payment date. |
| PERIOD_START | TIMESTAMP | NOT NULL | Dato de period start. |
| PERIOD_END | TIMESTAMP | NOT NULL | Dato de period end. |
| BASE_SALARY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de base salary. |
| BONUSES | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de bonuses. |
| DEDUCTIONS | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de deductions. |
| TOTAL | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de total. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| NOTES | VARCHAR2(255) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PAYROLL_PERIOD

Entidad: `PayrollPeriod`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NULL | Referencia a branch id. |
| DATE_START | TIMESTAMP | NOT NULL | Fecha de date start. |
| DATE_END | TIMESTAMP | NOT NULL | Fecha de date end. |
| PAY_DATE | TIMESTAMP | NOT NULL | Fecha de pay date. |
| PERIOD_TYPE | VARCHAR2(20) | NOT NULL | Dato de period type. |
| STATUS | VARCHAR2(20) | NOT NULL, DEFAULT "DRAFT" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PAYROLL_POSITION

Entidad: `PayrollPosition`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(120) | NOT NULL | Nombre del registro. |
| DESCRIPTION | VARCHAR2(255) | NULL | Descripcion del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PERMISSION

Entidad: `Permission`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(80) | NOT NULL | Nombre del registro. |
| DESCRIPTION | VARCHAR2(200) | NULL | Descripcion del registro. |
| STATUS | VARCHAR2(5) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CATEGORY | VARCHAR2(80) | NOT NULL | Dato de category. |
| MENU_ID | NUMBER | FK -> Menu, NULL | Referencia a menu id. |

## TB_PURCHASE_DETAIL

Entidad: `PurchaseDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| PURCHASE_ID | NUMBER | FK -> Purchase, NOT NULL | Referencia a purchase id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | DECIMAL(12,2) | NOT NULL | Cantidad de quantity. |
| QUANTITY_ORDERED | DECIMAL(12,2) | NULL | Cantidad de quantity ordered. |
| QUANTITY_RECEIVED | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity received. |
| QUANTITY_PENDING | DECIMAL(12,2) | NULL | Cantidad de quantity pending. |
| QUANTITY_REJECTED | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity rejected. |
| UNIT_OF_MEASURE_ID | NUMBER | NULL | Referencia a unit of measure id. |
| UNIT_PRICE | DECIMAL(12,2) | NOT NULL | Precio de unit price. |
| DISCOUNT_PERCENTAGE | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Dato de discount percentage. |
| DISCOUNT_AMOUNT | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Monto de discount amount. |
| TAX_PERCENTAGE | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Dato de tax percentage. |
| TAX_AMOUNT | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Monto de tax amount. |
| SUBTOTAL | DECIMAL(12,2) | NOT NULL | Monto de subtotal. |
| TOTAL | DECIMAL(12,2) | NULL | Monto de total. |
| LOT_NUMBER | VARCHAR2(60) | NULL | Dato de lot number. |
| EXPIRATION_DATE | TIMESTAMP | NULL | Fecha de expiration date. |
| EXPECTED_DELIVERY_DATE | TIMESTAMP | NULL | Fecha de expected delivery date. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "ORDERED" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PURCHASE_RECEIPT_DETAIL

Entidad: `PurchaseReceiptDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| RECEIPT_ID | NUMBER | FK -> PurchaseReceipt, NOT NULL | Referencia a receipt id. |
| BRANCH_ID | NUMBER | NULL | Referencia a branch id. |
| PURCHASE_DETAIL_ID | NUMBER | FK -> PurchaseDetail, NOT NULL | Referencia a purchase detail id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY_RECEIVED | DECIMAL(14,2) | NOT NULL | Cantidad de quantity received. |
| QUANTITY_ACCEPTED | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity accepted. |
| QUANTITY_REJECTED | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity rejected. |
| BATCH_NUMBER | VARCHAR2(60) | NULL | Dato de batch number. |
| MANUFACTURING_DATE | TIMESTAMP | NULL | Fecha de manufacturing date. |
| EXPIRATION_DATE | TIMESTAMP | NULL | Fecha de expiration date. |
| STORAGE_CONDITION | VARCHAR2(120) | NULL | Dato de storage condition. |
| TEMPERATURE_AT_RECEPTION | DECIMAL(8,2) | NULL | Dato de temperature at reception. |
| WAREHOUSE_ID | NUMBER | NULL | Referencia a warehouse id. |
| LOCATION_ID | NUMBER | NULL | Referencia a location id. |
| QUALITY_STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "AVAILABLE" | Dato de quality status. |
| REJECTION_REASON | VARCHAR2(500) | NULL | Dato de rejection reason. |
| RECEIVED_BY | NUMBER | NULL | Dato de received by. |
| VERIFIED_BY | NUMBER | NULL | Dato de verified by. |

## TB_PURCHASE_RECEIPT

Entidad: `PurchaseReceipt`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| RECEIPT_NUMBER | VARCHAR2(40) | NOT NULL | Dato de receipt number. |
| PURCHASE_ID | NUMBER | FK -> Purchase, NOT NULL | Referencia a purchase id. |
| BRANCH_ID | NUMBER | NULL | Referencia a branch id. |
| WAREHOUSE_ID | NUMBER | NULL | Referencia a warehouse id. |
| RECEIVED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| RECEIVED_BY | NUMBER | NULL | Dato de received by. |
| VERIFIED_BY | NUMBER | NULL | Dato de verified by. |
| SUPPLIER_DELIVERY_DOCUMENT | VARCHAR2(100) | NULL | Dato de supplier delivery document. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "RECEIVED" | Estado del registro. |
| NOTES | VARCHAR2(1000) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_PURCHASE_REQUEST_DETAIL

Entidad: `PurchaseRequestDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| REQUEST_ID | NUMBER | FK -> PurchaseRequest, NOT NULL | Referencia a request id. |
| BRANCH_ID | NUMBER | NULL | Referencia a branch id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| UNIT_OF_MEASURE_ID | NUMBER | NULL | Referencia a unit of measure id. |
| CURRENT_STOCK | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de current stock. |
| AVAILABLE_STOCK | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de available stock. |
| MINIMUM_STOCK | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de minimum stock. |
| MAXIMUM_STOCK | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de maximum stock. |
| AVERAGE_CONSUMPTION | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de average consumption. |
| SUGGESTED_QUANTITY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de suggested quantity. |
| REQUESTED_QUANTITY | DECIMAL(14,2) | NOT NULL | Cantidad de requested quantity. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_PURCHASE_REQUEST

Entidad: `PurchaseRequest`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| REQUEST_NUMBER | VARCHAR2(40) | NOT NULL | Dato de request number. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| WAREHOUSE_ID | NUMBER | NULL | Referencia a warehouse id. |
| REQUESTED_BY | NUMBER | NULL | Dato de requested by. |
| REQUEST_DATE | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| REQUIRED_DATE | TIMESTAMP | NULL | Fecha de required date. |
| PRIORITY | VARCHAR2(20) | NOT NULL, DEFAULT "NORMAL" | Dato de priority. |
| REASON | VARCHAR2(500) | NULL | Dato de reason. |
| SOURCE | VARCHAR2(20) | NOT NULL, DEFAULT "MANUAL" | Dato de source. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "DRAFT" | Estado del registro. |
| NOTES | VARCHAR2(1000) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_PURCHASE_RETURN

Entidad: `PurchaseReturn`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SUPPLIER_ID | NUMBER | NOT NULL | Referencia a supplier id. |
| BRANCH_ID | NUMBER | NULL | Referencia a branch id. |
| PURCHASE_ID | NUMBER | NOT NULL | Referencia a purchase id. |
| RECEIPT_ID | NUMBER | NULL | Referencia a receipt id. |
| MEDICINE_ID | NUMBER | NOT NULL | Referencia a medicine id. |
| BATCH_NUMBER | VARCHAR2(60) | NULL | Dato de batch number. |
| QUANTITY | DECIMAL(14,2) | NOT NULL | Cantidad de quantity. |
| REASON | VARCHAR2(500) | NOT NULL | Dato de reason. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "REGISTERED" | Estado del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_PURCHASE

Entidad: `Purchase`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| PURCHASE_NUMBER | VARCHAR2(40) | NULL | Dato de purchase number. |
| SUPPLIER_ID | NUMBER | FK -> Supplier, NOT NULL | Referencia a supplier id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| WAREHOUSE_ID | NUMBER | NULL | Referencia a warehouse id. |
| PURCHASE_REQUEST_ID | NUMBER | NULL | Referencia a purchase request id. |
| QUOTATION_ID | NUMBER | NULL | Referencia a quotation id. |
| PURCHASE_DATE | TIMESTAMP | NOT NULL | Fecha de purchase date. |
| EXPECTED_DELIVERY_DATE | TIMESTAMP | NULL | Fecha de expected delivery date. |
| INVOICE_NUMBER | VARCHAR2(50) | NULL | Dato de invoice number. |
| CURRENCY_ID | NUMBER | NULL | Referencia a currency id. |
| EXCHANGE_RATE | DECIMAL(12,4) | NOT NULL, DEFAULT 1 | Dato de exchange rate. |
| SUBTOTAL | DECIMAL(12,2) | NOT NULL | Monto de subtotal. |
| DISCOUNT | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Dato de discount. |
| TAX | DECIMAL(12,2) | NOT NULL | Dato de tax. |
| SHIPPING_COST | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Dato de shipping cost. |
| OTHER_CHARGES | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Dato de other charges. |
| TOTAL | DECIMAL(12,2) | NOT NULL | Monto de total. |
| PAYMENT_TERMS_ID | NUMBER | NULL | Referencia a payment terms id. |
| DELIVERY_TERMS | VARCHAR2(500) | NULL | Dato de delivery terms. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "DRAFT" | Estado del registro. |
| APPROVED_BY | NUMBER | NULL | Dato de approved by. |
| APPROVED_AT | TIMESTAMP | NULL | Dato de approved at. |
| NOTES | VARCHAR2(1000) | NULL | Dato de notes. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_ROLE_MENU

Entidad: `RoleMenu`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| ID_ROLE | NUMBER | FK -> Role, NOT NULL | Referencia a identificador de role. |
| ID_MENU | NUMBER | FK -> Menu, NOT NULL | Referencia a identificador de menu. |
| STATUS | VARCHAR2(5) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## T_ROLE_PERMISSION

Entidad: `RolePermission`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| ID_ROLE | NUMBER | FK -> Role, NOT NULL | Referencia a identificador de role. |
| ID_PERMISSION | NUMBER | FK -> Permission, NOT NULL | Referencia a identificador de permission. |
| STATUS | VARCHAR2(5) | NOT NULL, DEFAULT "E" | Estado del registro. |
| IS_CHECK | BOOLEAN | NOT NULL, DEFAULT false | Dato de is check. |
| IS_GLOBAL | BOOLEAN | NOT NULL, DEFAULT false | Dato de is global. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_ROLE

Entidad: `Role`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(40) | UNIQUE, NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SALE_DETAIL

Entidad: `SaleDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_ID | NUMBER | FK -> Sale, NOT NULL | Referencia a sale id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | NUMBER | NOT NULL | Cantidad de quantity. |
| UNIT_PRICE | NUMBER | NOT NULL | Precio de unit price. |
| TOTAL | NUMBER | NOT NULL | Monto de total. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SALE_LOT_DETAIL

Entidad: `SaleLotDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_DETAIL_ID | NUMBER | FK -> SaleDetail, NOT NULL | Referencia a sale detail id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| INVENTORY_LOT_ID | NUMBER | FK -> InventoryLot, NOT NULL | Referencia a inventory lot id. |
| LOT_NUMBER | VARCHAR2(60) | NOT NULL | Dato de lot number. |
| EXPIRATION_DATE | TIMESTAMP | NOT NULL | Fecha de expiration date. |
| QUANTITY | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Cantidad de quantity. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |

## TB_SALE_PAYMENT

Entidad: `SalePayment`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_ID | NUMBER | FK -> Sale, NOT NULL | Referencia a sale id. |
| BRANCH_ID | NUMBER | NOT NULL | Referencia a branch id. |
| METHOD | VARCHAR2(30) | NOT NULL | Dato de method. |
| AMOUNT | DECIMAL(12,2) | NOT NULL | Monto de amount. |
| RECEIVED_AMOUNT | DECIMAL(12,2) | NULL | Monto de received amount. |
| CHANGE_AMOUNT | DECIMAL(12,2) | NULL | Monto de change amount. |
| CARD_BRAND | VARCHAR2(30) | NULL | Dato de card brand. |
| CARD_LAST4 | VARCHAR2(4) | NULL | Dato de card last4. |
| AUTHORIZATION_CODE | VARCHAR2(60) | NULL | Codigo del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SALE_RECEIPT

Entidad: `SaleReceipt`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_ID | NUMBER | FK -> Sale, NOT NULL | Referencia a sale id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| RECEIPT_NUMBER | VARCHAR2(40) | NOT NULL | Dato de receipt number. |
| DOCUMENT_TYPE | VARCHAR2(20) | NOT NULL, DEFAULT "RECEIPT" | Dato de document type. |
| CUSTOMER_TAX_ID | VARCHAR2(30) | NULL | Referencia a customer tax id. |
| CUSTOMER_NAME | VARCHAR2(120) | NULL | Nombre del registro. |
| SUBTOTAL | DECIMAL(12,2) | NOT NULL | Monto de subtotal. |
| TAX | DECIMAL(12,2) | NOT NULL | Dato de tax. |
| TOTAL | DECIMAL(12,2) | NOT NULL | Monto de total. |
| PAID_TOTAL | DECIMAL(12,2) | NOT NULL | Monto de paid total. |
| CHANGE_AMOUNT | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Monto de change amount. |
| ISSUED_AT | TIMESTAMP | NOT NULL | Dato de issued at. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |

## TB_SALE_RETURN_DETAIL

Entidad: `SaleReturnDetail`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_RETURN_ID | NUMBER | FK -> SaleReturn, NOT NULL | Referencia a sale return id. |
| BRANCH_ID | NUMBER | NOT NULL | Referencia a branch id. |
| SALE_DETAIL_ID | NUMBER | NOT NULL | Referencia a sale detail id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| QUANTITY | DECIMAL(12,3) | NOT NULL | Cantidad de quantity. |
| UNIT_PRICE | DECIMAL(12,2) | NOT NULL | Precio de unit price. |
| TOTAL | DECIMAL(12,2) | NOT NULL | Monto de total. |
| RESTOCK_INVENTORY | BOOLEAN | NOT NULL, DEFAULT true | Cantidad de restock inventory. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SALE_RETURN

Entidad: `SaleReturn`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SALE_ID | NUMBER | FK -> Sale, NOT NULL | Referencia a sale id. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| CASH_SESSION_ID | NUMBER | FK -> CashSession, NOT NULL | Referencia a cash session id. |
| RETURN_DATE | TIMESTAMP | NOT NULL | Fecha de return date. |
| REASON | VARCHAR2(500) | NOT NULL | Dato de reason. |
| REFUND_METHOD | VARCHAR2(30) | NOT NULL | Dato de refund method. |
| TOTAL | DECIMAL(12,2) | NOT NULL | Monto de total. |
| AUTHORIZED_BY | NUMBER | NOT NULL | Dato de authorized by. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SALE

Entidad: `Sale`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| BRANCH_ID | NUMBER | FK -> Branch, NOT NULL | Referencia a branch id. |
| EMPLOYEE_ID | NUMBER | FK -> Employee, NOT NULL | Referencia a employee id. |
| CUSTOMER_ID | NUMBER | NULL | Referencia a customer id. |
| SALE_DATE | TIMESTAMP | NOT NULL | Fecha de sale date. |
| SUBTOTAL | NUMBER | NOT NULL | Monto de subtotal. |
| TAX | NUMBER | NOT NULL | Dato de tax. |
| TOTAL | NUMBER | NOT NULL | Monto de total. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| PAYMENT_METHOD | VARCHAR2(30) | NOT NULL | Dato de payment method. |
| CASH_SESSION_ID | NUMBER | NULL | Referencia a cash session id. |
| FEL_STATUS | VARCHAR2(20) | NOT NULL, DEFAULT "PENDING" | Dato de fel status. |
| SALE_CHANNEL | VARCHAR2(30) | NOT NULL, DEFAULT "IN_STORE" | Dato de sale channel. |
| ORIGINAL_ORDER_ID | NUMBER | NULL | Referencia a original order id. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SUPPLIER_INVOICE

Entidad: `SupplierInvoice`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SUPPLIER_ID | NUMBER | FK -> Supplier, NOT NULL | Referencia a supplier id. |
| BRANCH_ID | NUMBER | NULL | Referencia a branch id. |
| PURCHASE_ID | NUMBER | FK -> Purchase, NOT NULL | Referencia a purchase id. |
| INVOICE_NUMBER | VARCHAR2(60) | NOT NULL | Dato de invoice number. |
| INVOICE_DATE | TIMESTAMP | NOT NULL | Fecha de invoice date. |
| DUE_DATE | TIMESTAMP | NULL | Fecha de due date. |
| CURRENCY_ID | NUMBER | NULL | Referencia a currency id. |
| EXCHANGE_RATE | DECIMAL(12,4) | NOT NULL, DEFAULT 1 | Dato de exchange rate. |
| SUBTOTAL | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de subtotal. |
| TAX | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de tax. |
| DISCOUNT | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Dato de discount. |
| TOTAL | DECIMAL(14,2) | NOT NULL, DEFAULT 0 | Monto de total. |
| MATCHING_STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "PENDING" | Dato de matching status. |
| STATUS | VARCHAR2(30) | NOT NULL, DEFAULT "REGISTERED" | Estado del registro. |
| PAYMENT_SOURCE_TYPE | VARCHAR2(20) | NULL | Dato de payment source type. |
| FINANCIAL_ACCOUNT_ID | NUMBER | NULL | Referencia a financial account id. |
| CASH_SESSION_ID | NUMBER | NULL | Referencia a cash session id. |
| PAID_AT | TIMESTAMP | NULL | Dato de paid at. |
| PAID_BY | NUMBER | NULL | Dato de paid by. |
| DOCUMENT_ATTACHMENT | VARCHAR2(500) | NULL | Dato de document attachment. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |

## TB_SUPPLIER_MEDICINE

Entidad: `SupplierMedicine`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| SUPPLIER_ID | NUMBER | FK -> Supplier, NOT NULL | Referencia a supplier id. |
| MEDICINE_ID | NUMBER | FK -> Medicine, NOT NULL | Referencia a medicine id. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_SUPPLIER

Entidad: `Supplier`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(150) | NOT NULL | Nombre del registro. |
| ADDRESS | VARCHAR2(255) | NULL | Direccion registrada. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_UNIT_MEASUREMENT

Entidad: `UnitMeasurement`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(100) | NOT NULL | Nombre del registro. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

## TB_USER

Entidad: `User`

| Campo | Tipo | Restriccion | Descripcion |
|---|---|---|---|
| ID | NUMBER | PK, NOT NULL, GENERATED increment | Identificador unico del registro. |
| NAME | VARCHAR2(50) | UNIQUE, NOT NULL | Nombre del registro. |
| PASSWORD | VARCHAR2(255) | NOT NULL | Contrasena del usuario. |
| SALT | VARCHAR2(255) | NOT NULL | Salt usado para seguridad. |
| STATUS | VARCHAR2(2) | NOT NULL, DEFAULT "E" | Estado del registro. |
| HAS_CHANGED_PASS | BOOLEAN | NOT NULL, DEFAULT false | Dato de has changed pass. |
| LAST_LOGIN | TIMESTAMP | NULL | Dato de last login. |
| ID_PERSONAL | NUMBER | FK -> Employee, NULL | Referencia a identificador de personal. |
| ID_ROLE | NUMBER | FK -> Role, NOT NULL | Referencia a identificador de role. |
| COMPANY_ID | NUMBER | NULL | Referencia a company id. |
| CREATED_AT | TIMESTAMP | NOT NULL, CREATE DATE | Fecha de creacion del registro. |
| UPDATED_AT | TIMESTAMP | NULL, UPDATE DATE | Fecha de ultima actualizacion. |
| CREATED_BY | NUMBER | NULL | Usuario que creo el registro. |
| UPDATED_BY | NUMBER | NULL | Usuario que actualizo el registro. |

