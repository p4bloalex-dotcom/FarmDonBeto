import { EntitySchema } from 'typeorm';

export const PayrollPeriodEntity = new EntitySchema({
  name: 'PayrollPeriod',
  tableName: 'TB_PAYROLL_PERIOD',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 120 },
    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    dateStart: { name: 'DATE_START', type: 'timestamp' },
    dateEnd: { name: 'DATE_END', type: 'timestamp' },
    payDate: { name: 'PAY_DATE', type: 'timestamp' },
    periodType: { name: 'PERIOD_TYPE', type: String, length: 20 },
    status: { name: 'STATUS', type: String, length: 20, default: 'DRAFT' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' }, nullable: true }
  }
});
