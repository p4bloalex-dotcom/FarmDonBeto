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
    SaleEntity

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
    BranchRlsFixBranchTable1757865600000
  ]
});
