import { EntitySchema } from 'typeorm';

export const PurchaseEntity = new EntitySchema({

  name: 'Purchase',

  tableName: 'TB_PURCHASE',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    purchaseNumber: { name: 'PURCHASE_NUMBER', type: String, length: 40, nullable: true },

    supplierId: { name: 'SUPPLIER_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number },

    warehouseId: { name: 'WAREHOUSE_ID', type: Number, nullable: true },

    purchaseRequestId: { name: 'PURCHASE_REQUEST_ID', type: Number, nullable: true },

    quotationId: { name: 'QUOTATION_ID', type: Number, nullable: true },

    purchaseDate: { name: 'PURCHASE_DATE', type: 'timestamp' },

    expectedDeliveryDate: { name: 'EXPECTED_DELIVERY_DATE', type: 'timestamp', nullable: true },

    invoiceNumber: { name: 'INVOICE_NUMBER', type: String, length: 50, nullable: true },

    currencyId: { name: 'CURRENCY_ID', type: Number, nullable: true },

    exchangeRate: { name: 'EXCHANGE_RATE', type: 'decimal', precision: 12, scale: 4, default: 1 },

    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 12, scale: 2 },

    discount: { name: 'DISCOUNT', type: 'decimal', precision: 12, scale: 2, default: 0 },

    tax: { name: 'TAX', type: 'decimal', precision: 12, scale: 2 },

    shippingCost: { name: 'SHIPPING_COST', type: 'decimal', precision: 12, scale: 2, default: 0 },

    otherCharges: { name: 'OTHER_CHARGES', type: 'decimal', precision: 12, scale: 2, default: 0 },

    total: { name: 'TOTAL', type: 'decimal', precision: 12, scale: 2 },

    paymentTermsId: { name: 'PAYMENT_TERMS_ID', type: Number, nullable: true },

    deliveryTerms: { name: 'DELIVERY_TERMS', type: String, length: 500, nullable: true },

    status: { name: 'STATUS', type: String, length: 30, default: 'DRAFT' },

    approvedBy: { name: 'APPROVED_BY', type: Number, nullable: true },

    approvedAt: { name: 'APPROVED_AT', type: 'timestamp', nullable: true },

    notes: { name: 'NOTES', type: String, length: 1000, nullable: true },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: { name: 'SUPPLIER_ID' }
    },

    branch: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ID' }
    }

  }

});
