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
import { MedicineCategoryEntity } from '../entities/medicine-category.entity.js';
import { MedicineLaboratoryEntity } from '../entities/medicine-laboratory.entity.js';
import { MedicinePresentationEntity } from '../entities/medicine-presentation.entity.js';
import { SupplierEntity } from '../entities/supplier.entity.js';
import { SupplierMedicineEntity } from '../entities/supplier-medicine.entity.js';
import { UnitMeasurementEntity } from '../entities/unit-measurement.entity.js';
import { MedicineEntity } from '../entities/medicine.entity.js';

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
    UnitMeasurementEntity
  ],
  migrations: [
    SecurityCodeFirst1725148800000,
    FixAccessMenuFunction1725235200000,
    CatalogCompanyEmployee1725321600000,
    SeedAdminScreens1725408000000,
    LocationBranchSeed1725494400000
  ]
});
