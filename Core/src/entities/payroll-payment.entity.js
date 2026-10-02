import { EntitySchema } from 'typeorm';

export const PayrollPaymentEntity = new EntitySchema({
  name: 'PayrollPayment',
  tableName: 'TB_PAYROLL_PAYMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    employeeId: { name: 'EMPLOYEE_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    salaryId: { name: 'SALARY_ID', type: Number, nullable: true },
    positionId: { name: 'POSITION_ID', type: Number, nullable: true },
    periodId: { name: 'PERIOD_ID', type: Number, nullable: true },
    paymentDate: { name: 'PAYMENT_DATE', type: 'timestamp' },
    periodStart: { name: 'PERIOD_START', type: 'timestamp' },
    periodEnd: { name: 'PERIOD_END', type: 'timestamp' },
    baseSalary: { name: 'BASE_SALARY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    bonuses: { name: 'BONUSES', type: 'decimal', precision: 14, scale: 2, default: 0 },
    deductions: { name: 'DEDUCTIONS', type: 'decimal', precision: 14, scale: 2, default: 0 },
    total: { name: 'TOTAL', type: 'decimal', precision: 14, scale: 2, default: 0 },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    notes: { name: 'NOTES', type: String, length: 255, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    employee: { type: 'many-to-one', target: 'Employee', joinColumn: { name: 'EMPLOYEE_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    salary: { type: 'many-to-one', target: 'EmployeeSalary', joinColumn: { name: 'SALARY_ID' }, nullable: true },
    period: { type: 'many-to-one', target: 'PayrollPeriod', joinColumn: { name: 'PERIOD_ID' }, nullable: true },
    position: { type: 'many-to-one', target: 'PayrollPosition', joinColumn: { name: 'POSITION_ID' }, nullable: true }
  }
});
