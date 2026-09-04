import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env.js';
import { AuditTrailLogEntity } from '../entities/audit-trail-log.entity.js';
import { CompanyEntity } from '../entities/company.entity.js';
import { EmployeeEntity } from '../entities/employee.entity.js';
import { MenuEntity } from '../entities/menu.entity.js';
import { PermissionEntity } from '../entities/permission.entity.js';
import { RoleEntity } from '../entities/role.entity.js';
import { RoleMenuEntity } from '../entities/role-menu.entity.js';
import { RolePermissionEntity } from '../entities/role-permission.entity.js';
import { UserEntity } from '../entities/user.entity.js';
import { SecurityCodeFirst1725148800000 } from '../migrations/1725148800000-security-code-first.js';
import { FixAccessMenuFunction1725235200000 } from '../migrations/1725235200000-fix-access-menu-function.js';
import { CatalogCompanyEmployee1725321600000 } from '../migrations/1725321600000-catalog-company-employee.js';

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
    CompanyEntity,
    EmployeeEntity,
    AuditTrailLogEntity
  ],
  migrations: [SecurityCodeFirst1725148800000, FixAccessMenuFunction1725235200000, CatalogCompanyEmployee1725321600000]
});
