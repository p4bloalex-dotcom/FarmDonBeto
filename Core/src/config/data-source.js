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
import { PurchaseReceiptDetailEntity } from '../entities/purchase-receipt-detail.entity.js';
import { PurchaseReceiptEntity } from '../entities/purchase-receipt.entity.js';
import { PurchaseRequestDetailEntity } from '../entities/purchase-request-detail.entity.js';
import { PurchaseRequestEntity } from '../entities/purchase-request.entity.js';
import { PurchaseReturnEntity } from '../entities/purchase-return.entity.js';
import { SaleDetailEntity } from '../entities/sale-detail.entity.js';
import { SaleEntity } from '../entities/sale.entity.js';
import { DeliveryRequestEntity } from '../entities/delivery-request.entity.js';
import { DeliveryRequestDetailEntity } from '../entities/delivery-request-detail.entity.js';
import { FixedAssetEntity } from '../entities/fixed-asset.entity.js';
import { FixedAssetHistoryEntity } from '../entities/fixed-asset-history.entity.js';
import { CustomerOrderEntity } from '../entities/customer-order.entity.js';
import { CustomerOrderDetailEntity } from '../entities/customer-order-detail.entity.js';
import { PayrollPaymentEntity } from '../entities/payroll-payment.entity.js';
import { InventoryKardexEntity } from '../entities/inventory-kardex.entity.js';
import { InventoryLotEntity } from '../entities/inventory-lot.entity.js';
import { InventoryAdjustmentEntity } from '../entities/inventory-adjustment.entity.js';
import { PayrollPositionEntity } from '../entities/payroll-position.entity.js';
import { EmployeeSalaryEntity } from '../entities/employee-salary.entity.js';
import { PayrollAdjustmentEntity } from '../entities/payroll-adjustment.entity.js';
import { PayrollConceptEntity } from '../entities/payroll-concept.entity.js';
import { PayrollDetailEntity } from '../entities/payroll-detail.entity.js';
import { PayrollPeriodEntity } from '../entities/payroll-period.entity.js';
import { AuditFieldsSubscriber, installAuditHooks } from '../subscribers/audit-fields.subscriber.js';
import { SupplierInvoiceEntity } from '../entities/supplier-invoice.entity.js';
import { SalePaymentEntity } from '../entities/sale-payment.entity.js';
import { SaleReceiptEntity } from '../entities/sale-receipt.entity.js';
import { SaleReturnEntity } from '../entities/sale-return.entity.js';
import { SaleReturnDetailEntity } from '../entities/sale-return-detail.entity.js';
import { CashReconciliationEntity } from '../entities/cash-reconciliation.entity.js';
import { InventoryReservationEntity } from '../entities/inventory-reservation.entity.js';
import { SaleLotDetailEntity } from '../entities/sale-lot-detail.entity.js';
import { FinancialAccountEntity } from '../entities/financial-account.entity.js';
import { FinancialMovementEntity } from '../entities/financial-movement.entity.js';

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
    PurchaseRequestEntity,
    PurchaseRequestDetailEntity,
    PurchaseReceiptEntity,
    PurchaseReceiptDetailEntity,
    SupplierInvoiceEntity,
    PurchaseReturnEntity,
    SaleDetailEntity,
    SalePaymentEntity,
    SaleReceiptEntity,
    SaleReturnEntity,
    SaleReturnDetailEntity,
    CashReconciliationEntity,
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
    PayrollConceptEntity,
    PayrollPeriodEntity,
    PayrollDetailEntity,
    EmployeeSalaryEntity,
    PayrollAdjustmentEntity,
    FinancialAccountEntity,
    FinancialMovementEntity,
    InventoryReservationEntity,
    SaleLotDetailEntity

  ],
  subscribers: [AuditFieldsSubscriber],
  migrations: []
});
