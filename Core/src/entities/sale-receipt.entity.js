import { EntitySchema } from 'typeorm';

export const SaleReceiptEntity = new EntitySchema({
  name: 'SaleReceipt',
  tableName: 'TB_SALE_RECEIPT',
  uniques: [
    { name: 'UK_SALE_RECEIPT_SALE', columns: ['saleId'] },
    { name: 'UK_SALE_RECEIPT_NUMBER', columns: ['receiptNumber'] }
  ],
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    saleId: { name: 'SALE_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    receiptNumber: { name: 'RECEIPT_NUMBER', type: String, length: 40 },
    documentType: { name: 'DOCUMENT_TYPE', type: String, length: 20, default: 'RECEIPT' },
    customerTaxId: { name: 'CUSTOMER_TAX_ID', type: String, length: 30, nullable: true },
    customerName: { name: 'CUSTOMER_NAME', type: String, length: 120, nullable: true },
    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 12, scale: 2 },
    tax: { name: 'TAX', type: 'decimal', precision: 12, scale: 2 },
    total: { name: 'TOTAL', type: 'decimal', precision: 12, scale: 2 },
    paidTotal: { name: 'PAID_TOTAL', type: 'decimal', precision: 12, scale: 2 },
    changeAmount: { name: 'CHANGE_AMOUNT', type: 'decimal', precision: 12, scale: 2, default: 0 },
    issuedAt: { name: 'ISSUED_AT', type: 'timestamp' },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true }
  },
  relations: {
    sale: { type: 'many-to-one', target: 'Sale', joinColumn: { name: 'SALE_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } }
  }
});
