import { EntitySchema } from 'typeorm';

export const EmployeeSalaryEntity = new EntitySchema({
  name: 'EmployeeSalary',
  tableName: 'TB_EMPLOYEE_SALARY',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    employeeId: { name: 'EMPLOYEE_ID', type: Number },
    positionId: { name: 'POSITION_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    baseSalary: { name: 'BASE_SALARY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    effectiveFrom: { name: 'EFFECTIVE_FROM', type: 'timestamp' },
    effectiveTo: { name: 'EFFECTIVE_TO', type: 'timestamp', nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'A' },
    notes: { name: 'NOTES', type: String, length: 255, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    employee: { type: 'many-to-one', target: 'Employee', joinColumn: { name: 'EMPLOYEE_ID' } },
    position: { type: 'many-to-one', target: 'PayrollPosition', joinColumn: { name: 'POSITION_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } }
  }
});
