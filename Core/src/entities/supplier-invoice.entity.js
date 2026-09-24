import { EntitySchema } from 'typeorm';

export const SupplierInvoiceEntity = new EntitySchema({
  name: 'SupplierInvoice',
  tableName: 'TB_SUPPLIER_INVOICE',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    supplierId: { name: 'SUPPLIER_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    purchaseId: { name: 'PURCHASE_ID', type: Number },
    invoiceNumber: { name: 'INVOICE_NUMBER', type: String, length: 60 },
    invoiceDate: { name: 'INVOICE_DATE', type: 'timestamp' },
    dueDate: { name: 'DUE_DATE', type: 'timestamp', nullable: true },
    currencyId: { name: 'CURRENCY_ID', type: Number, nullable: true },
    exchangeRate: { name: 'EXCHANGE_RATE', type: 'decimal', precision: 12, scale: 4, default: 1 },
    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 14, scale: 2, default: 0 },
    tax: { name: 'TAX', type: 'decimal', precision: 14, scale: 2, default: 0 },
    discount: { name: 'DISCOUNT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    total: { name: 'TOTAL', type: 'decimal', precision: 14, scale: 2, default: 0 },
    matchingStatus: { name: 'MATCHING_STATUS', type: String, length: 30, default: 'PENDING' },
    status: { name: 'STATUS', type: String, length: 30, default: 'REGISTERED' },
    documentAttachment: { name: 'DOCUMENT_ATTACHMENT', type: String, length: 500, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  },
  relations: {
    supplier: { type: 'many-to-one', target: 'Supplier', joinColumn: { name: 'SUPPLIER_ID' } },
    purchase: { type: 'many-to-one', target: 'Purchase', joinColumn: { name: 'PURCHASE_ID' } }
  }
});
