import { EntitySchema } from 'typeorm';

export const FinancialMovementEntity = new EntitySchema({
  name: 'FinancialMovement',
  tableName: 'TB_FINANCIAL_MOVEMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    financialAccountId: { name: 'FINANCIAL_ACCOUNT_ID', type: Number, nullable: true },
    cashSessionId: { name: 'CASH_SESSION_ID', type: Number, nullable: true },
    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    sourceType: { name: 'SOURCE_TYPE', type: String, length: 20 },
    operation: { name: 'OPERATION', type: String, length: 1 },
    amount: { name: 'AMOUNT', type: 'decimal', precision: 14, scale: 2 },
    description: { name: 'DESCRIPTION', type: String, length: 255 },
    referenceType: { name: 'REFERENCE_TYPE', type: String, length: 40, nullable: true },
    referenceId: { name: 'REFERENCE_ID', type: Number, nullable: true },
    reversalOfId: { name: 'REVERSAL_OF_ID', type: Number, nullable: true },
    reconciledAt: { name: 'RECONCILED_AT', type: 'timestamp', nullable: true },
    reconciliationNote: { name: 'RECONCILIATION_NOTE', type: String, length: 255, nullable: true },
    movementDate: { name: 'MOVEMENT_DATE', type: 'timestamp' },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    account: { type: 'many-to-one', target: 'FinancialAccount', joinColumn: { name: 'FINANCIAL_ACCOUNT_ID' }, nullable: true },
    cashSession: { type: 'many-to-one', target: 'CashSession', joinColumn: { name: 'CASH_SESSION_ID' }, nullable: true },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' }, nullable: true },
    reversalOf: { type: 'many-to-one', target: 'FinancialMovement', joinColumn: { name: 'REVERSAL_OF_ID' }, nullable: true }
  }
});
