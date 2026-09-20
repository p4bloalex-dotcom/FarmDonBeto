import { EntitySchema } from 'typeorm';

export const PayrollAdjustmentEntity = new EntitySchema({
  name: 'PayrollAdjustment',
  tableName: 'TB_PAYROLL_ADJUSTMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    employeeId: { name: 'EMPLOYEE_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    adjustmentDate: { name: 'ADJUSTMENT_DATE', type: 'timestamp' },
    type: { name: 'TYPE', type: String, length: 1 },
    amount: { name: 'AMOUNT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    reason: { name: 'REASON', type: String, length: 255 },
    status: { name: 'STATUS', type: String, length: 2, default: 'P' },
    payrollPaymentId: { name: 'PAYROLL_PAYMENT_ID', type: Number, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    employee: { type: 'many-to-one', target: 'Employee', joinColumn: { name: 'EMPLOYEE_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    payrollPayment: { type: 'many-to-one', target: 'PayrollPayment', joinColumn: { name: 'PAYROLL_PAYMENT_ID' }, nullable: true }
  }
});
