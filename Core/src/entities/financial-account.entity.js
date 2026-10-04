import { EntitySchema } from 'typeorm';

export const FinancialAccountEntity = new EntitySchema({
  name: 'FinancialAccount',
  tableName: 'TB_FINANCIAL_ACCOUNT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 120 },
    type: { name: 'TYPE', type: String, length: 20 },
    accountNumber: { name: 'ACCOUNT_NUMBER', type: String, length: 60, nullable: true },
    openingBalance: { name: 'OPENING_BALANCE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    movements: { type: 'one-to-many', target: 'FinancialMovement', inverseSide: 'account' }
  }
});
