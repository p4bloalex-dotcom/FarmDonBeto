import { EntitySchema } from 'typeorm';

export const SalePaymentEntity = new EntitySchema({
  name: 'SalePayment',
  tableName: 'TB_SALE_PAYMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    saleId: { name: 'SALE_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    method: { name: 'METHOD', type: String, length: 30 },
    amount: { name: 'AMOUNT', type: 'decimal', precision: 12, scale: 2 },
    receivedAmount: { name: 'RECEIVED_AMOUNT', type: 'decimal', precision: 12, scale: 2, nullable: true },
    changeAmount: { name: 'CHANGE_AMOUNT', type: 'decimal', precision: 12, scale: 2, nullable: true },
    cardBrand: { name: 'CARD_BRAND', type: String, length: 30, nullable: true },
    cardLast4: { name: 'CARD_LAST4', type: String, length: 4, nullable: true },
    authorizationCode: { name: 'AUTHORIZATION_CODE', type: String, length: 60, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    sale: { type: 'many-to-one', target: 'Sale', joinColumn: { name: 'SALE_ID' } }
  }
});
