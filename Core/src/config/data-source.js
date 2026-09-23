import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env.js';
import { AuditTrailLogEntity } from '../entities/audit-trail-log.entity.js';
import { BranchEntity } from '../entities/branch.entity.js';
import { CompanyEntity } from '../entities/company.entity.js';
import { DepartmentEntity } from '../entities/department.entity.js';
import { EmployeeEntity } from '../entities/employee.entity.js';
import { MenuEntity } from '../entities/menu.entity.js';
import { MunicipalityEntity } from '../entities/municipality.entity.js';
import { PermissionEntity } from '../entities/permission.entity.js';
import { RoleEntity } from '../entities/role.entity.js';
import { RoleMenuEntity } from '../entities/role-menu.entity.js';
import { RolePermissionEntity } from '../entities/role-permission.entity.js';
import { UserEntity } from '../entities/user.entity.js';
import { SecurityCodeFirst1725148800000 } from '../migrations/1725148800000-security-code-first.js';
import { FixAccessMenuFunction1725235200000 } from '../migrations/1725235200000-fix-access-menu-function.js';
import { CatalogCompanyEmployee1725321600000 } from '../migrations/1725321600000-catalog-company-employee.js';
import { SeedAdminScreens1725408000000 } from '../migrations/1725408000000-seed-admin-screens.js';
import { LocationBranchSeed1725494400000 } from '../migrations/1725494400000-location-branch-seed.js';
import { PharmacyCatalog1725580800000 } from '../migrations/1725580800000-pharmacy-catalog.js';
import { BusinessOperations1725667200000 } from '../migrations/1725667200000-business-operations.js';
import { AddIsGlobalRolePermission1757536440000 } from '../migrations/1757536440000-add-is-global-role-permission.js';
import { BranchRls1757610000000 } from '../migrations/1757610000000-branch-rls.js';
import { BranchRlsFixBranchTable1757865600000 } from '../migrations/1757865600000-branch-rls-fix-branch-table.js';
import { CashBusinessRules1790000000000 } from '../migrations/1790000000000-cash-business-rules.js';
import { PurchaseBusinessRules1791000000000 } from '../migrations/1791000000000-purchase-business-rules.js';
import { StockTransferBusinessRules1792000000000 } from '../migrations/1792000000000-stock-transfer-business-rules.js';
import { MainBranchBusinessRules1793000000000 } from '../migrations/1793000000000-main-branch-business-rules.js';
import { DeliveryRequestBusinessRules1794000000000 } from '../migrations/1794000000000-delivery-request-business-rules.js';
import { OrganizeScreenModules1795000000000 } from '../migrations/1795000000000-organize-screen-modules.js';
import { DedupeOrganizedMenus1796000000000 } from '../migrations/1796000000000-dedupe-organized-menus.js';
import { InventoryOperationSupport1797000000000 } from '../migrations/1797000000000-inventory-operation-support.js';
import { FixedAssetManagement1798000000000 } from '../migrations/1798000000000-fixed-asset-management.js';
import { FixedAssetBusinessFlow1799000000000 } from '../migrations/1799000000000-fixed-asset-business-flow.js';
import { CustomerOrderBusinessRules1800000000000 } from '../migrations/1800000000000-customer-order-business-rules.js';
import { MedicineCategoryEntity } from '../entities/medicine-category.entity.js';
import { MedicineLaboratoryEntity } from '../entities/medicine-laboratory.entity.js';
import { MedicinePresentationEntity } from '../entities/medicine-presentation.entity.js';
import { SupplierEntity } from '../entities/supplier.entity.js';
import { SupplierMedicineEntity } from '../entities/supplier-medicine.entity.js';
import { UnitMeasurementEntity } from '../entities/unit-measurement.entity.js';
import { MedicineEntity } from '../entities/medicine.entity.js';
import { CashMovementEntity } from '../entities/cash-movement.entity.js';
import { CashMovementTypeEntity } from '../entities/cash-movement-type.entity.js';
import { CashRegisterEntity } from '../entities/cash-register.entity.js';
import { CashSessionEntity } from '../entities/cash-session.entity.js';
import { InventoryEntity } from '../entities/inventory.entity.js';
import { MoveInventoryEntity } from '../entities/move-inventory.entity.js';
import { MoveInventoryDetailEntity } from '../entities/move-inventory-detail.entity.js';
import { MovementTypeEntity } from '../entities/movement-type.entity.js';
import { PurchaseDetailEntity } from '../entities/purchase-detail.entity.js';
import { PurchaseEntity } from '../entities/purchase.entity.js';
import { SaleDetailEntity } from '../entities/sale-detail.entity.js';
import { SaleEntity } from '../entities/sale.entity.js';
import { DeliveryRequestEntity } from '../entities/delivery-request.entity.js';
import { DeliveryRequestDetailEntity } from '../entities/delivery-request-detail.entity.js';
import { FixedAssetEntity } from '../entities/fixed-asset.entity.js';
import { FixedAssetHistoryEntity } from '../entities/fixed-asset-history.entity.js';
import { CustomerOrderEntity } from '../entities/customer-order.entity.js';
import { CustomerOrderDetailEntity } from '../entities/customer-order-detail.entity.js';
import { PayrollPaymentEntity } from '../entities/payroll-payment.entity.js';
import { SalesReportsPayroll1801000000000 } from '../migrations/1801000000000-sales-reports-payroll.js';
import { BranchDeliveryGeo1802000000000 } from '../migrations/1802000000000-branch-delivery-geo.js';
import { InventoryKardexEntity } from '../entities/inventory-kardex.entity.js';
import { InventoryLotEntity } from '../entities/inventory-lot.entity.js';
import { InventoryAdjustmentEntity } from '../entities/inventory-adjustment.entity.js';
import { AdvancedInventory1803000000000 } from '../migrations/1803000000000-advanced-inventory.js';
import { PayrollPositionEntity } from '../entities/payroll-position.entity.js';
import { EmployeeSalaryEntity } from '../entities/employee-salary.entity.js';
import { FullPayroll1804000000000 } from '../migrations/1804000000000-full-payroll.js';
import { PayrollAdjustmentEntity } from '../entities/payroll-adjustment.entity.js';
import { LotPayrollAdjustmentsCash1805000000000 } from '../migrations/1805000000000-lot-payroll-adjustments-cash.js';
import { PartitionTransactionTables1806000000000 } from '../migrations/1806000000000-partition-transaction-tables.js';
import { BranchType1807000000000 } from '../migrations/1807000000000-branch-type.js';
import { CustomerOrderFulfillment1808000000000 } from '../migrations/1808000000000-customer-order-fulfillment.js';
import { AuditFieldsSubscriber, installAuditHooks } from '../subscribers/audit-fields.subscriber.js';

installAuditHooks();

export const AppDataSource = new DataSource({
  type: 'oracle',
  username: env.oracle.user,
  password: env.oracle.password,
  connectString: env.oracle.connectString,
  poolSize: env.oracle.poolMax,
  synchronize: false,
  logging: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  entities: [
    RoleEntity,
    MenuEntity,
    PermissionEntity,
    UserEntity,
    RoleMenuEntity,
    RolePermissionEntity,
    DepartmentEntity,
    MunicipalityEntity,
    CompanyEntity,
    BranchEntity,
    EmployeeEntity,
    AuditTrailLogEntity,
    MedicineCategoryEntity,
    MedicineLaboratoryEntity,
    MedicinePresentationEntity,
    MedicineEntity,
    SupplierEntity,
    SupplierMedicineEntity,
    UnitMeasurementEntity,
    CashMovementEntity,
    CashMovementTypeEntity,
    CashRegisterEntity,
    CashSessionEntity,
    InventoryEntity,
    MoveInventoryDetailEntity,
    MoveInventoryEntity,
    MovementTypeEntity,
    PurchaseDetailEntity,
    PurchaseEntity,
    SaleDetailEntity,
    SaleEntity,
    DeliveryRequestEntity,
    DeliveryRequestDetailEntity,
    FixedAssetEntity,
    FixedAssetHistoryEntity,
    CustomerOrderEntity,
    CustomerOrderDetailEntity,
    PayrollPaymentEntity,
    InventoryKardexEntity,
    InventoryLotEntity,
    InventoryAdjustmentEntity,
    PayrollPositionEntity,
    EmployeeSalaryEntity,
    PayrollAdjustmentEntity

  ],
  subscribers: [AuditFieldsSubscriber],
  migrations: [
    SecurityCodeFirst1725148800000,
    FixAccessMenuFunction1725235200000,
    CatalogCompanyEmployee1725321600000,
    SeedAdminScreens1725408000000,
    LocationBranchSeed1725494400000,
    PharmacyCatalog1725580800000,
    BusinessOperations1725667200000,
    AddIsGlobalRolePermission1757536440000,
    BranchRls1757610000000,
    BranchRlsFixBranchTable1757865600000,
    CashBusinessRules1790000000000,
    PurchaseBusinessRules1791000000000,
    StockTransferBusinessRules1792000000000,
    MainBranchBusinessRules1793000000000,
    DeliveryRequestBusinessRules1794000000000,
    OrganizeScreenModules1795000000000,
    DedupeOrganizedMenus1796000000000,
    InventoryOperationSupport1797000000000,
    FixedAssetManagement1798000000000,
    FixedAssetBusinessFlow1799000000000,
    CustomerOrderBusinessRules1800000000000,
    SalesReportsPayroll1801000000000,
    BranchDeliveryGeo1802000000000,
    AdvancedInventory1803000000000,
    FullPayroll1804000000000,
    LotPayrollAdjustmentsCash1805000000000,
    PartitionTransactionTables1806000000000,
    BranchType1807000000000,
    CustomerOrderFulfillment1808000000000
  ]
});
