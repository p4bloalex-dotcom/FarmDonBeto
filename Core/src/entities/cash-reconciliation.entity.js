import { EntitySchema } from 'typeorm';

export const CashReconciliationEntity = new EntitySchema({
  name: 'CashReconciliation',
  tableName: 'TB_CASH_RECONCILIATION',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    cashSessionId: { name: 'CASH_SESSION_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    method: { name: 'METHOD', type: String, length: 30 },
    systemAmount: { name: 'SYSTEM_AMOUNT', type: 'decimal', precision: 12, scale: 2 },
    declaredAmount: { name: 'DECLARED_AMOUNT', type: 'decimal', precision: 12, scale: 2 },
    differenceAmount: { name: 'DIFFERENCE_AMOUNT', type: 'decimal', precision: 12, scale: 2 },
    notes: { name: 'NOTES', type: String, length: 500, nullable: true },
    authorizedBy: { name: 'AUTHORIZED_BY', type: Number, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    cashSession: { type: 'many-to-one', target: 'CashSession', joinColumn: { name: 'CASH_SESSION_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } }
  }
});
