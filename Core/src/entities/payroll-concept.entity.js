import { EntitySchema } from 'typeorm';

export const PayrollConceptEntity = new EntitySchema({
  name: 'PayrollConcept',
  tableName: 'TB_PAYROLL_CONCEPT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    code: { name: 'CODE', type: String, length: 30, unique: true },
    name: { name: 'NAME', type: String, length: 120 },
    type: { name: 'TYPE', type: String, length: 20 },
    isAutomatic: { name: 'IS_AUTOMATIC', type: Boolean, default: false },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  }
});
