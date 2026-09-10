import { EntitySchema } from 'typeorm';

export const PurchaseEntity = new EntitySchema({

  name: 'Purchase',

  tableName: 'TB_PURCHASE',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    supplierId: { name: 'SUPPLIER_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number },

    purchaseDate: { name: 'PURCHASE_DATE', type: 'timestamp' },

    invoiceNumber: { name: 'INVOICE_NUMBER', type: String, length: 50 },

    subtotal: { name: 'SUBTOTAL', type: Number },

    tax: { name: 'TAX', type: Number },

    total: { name: 'TOTAL', type: Number },

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