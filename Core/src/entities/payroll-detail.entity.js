import { EntitySchema } from 'typeorm';

export const PayrollDetailEntity = new EntitySchema({
  name: 'PayrollDetail',
  tableName: 'TB_PAYROLL_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    payrollPaymentId: { name: 'PAYROLL_PAYMENT_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    conceptId: { name: 'CONCEPT_ID', type: Number, nullable: true },
    type: { name: 'TYPE', type: String, length: 20 },
    amount: { name: 'AMOUNT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    description: { name: 'DESCRIPTION', type: String, length: 255, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  },
  relations: {
    payrollPayment: { type: 'many-to-one', target: 'PayrollPayment', joinColumn: { name: 'PAYROLL_PAYMENT_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    concept: { type: 'many-to-one', target: 'PayrollConcept', joinColumn: { name: 'CONCEPT_ID' }, nullable: true }
  }
});
