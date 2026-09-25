import { EntitySchema } from 'typeorm';

export const SaleReturnEntity = new EntitySchema({
  name: 'SaleReturn',
  tableName: 'TB_SALE_RETURN',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    saleId: { name: 'SALE_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    cashSessionId: { name: 'CASH_SESSION_ID', type: Number },
    returnDate: { name: 'RETURN_DATE', type: 'timestamp' },
    reason: { name: 'REASON', type: String, length: 500 },
    refundMethod: { name: 'REFUND_METHOD', type: String, length: 30 },
    total: { name: 'TOTAL', type: 'decimal', precision: 12, scale: 2 },
    authorizedBy: { name: 'AUTHORIZED_BY', type: Number },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    sale: { type: 'many-to-one', target: 'Sale', joinColumn: { name: 'SALE_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    cashSession: { type: 'many-to-one', target: 'CashSession', joinColumn: { name: 'CASH_SESSION_ID' } }
  }
});
