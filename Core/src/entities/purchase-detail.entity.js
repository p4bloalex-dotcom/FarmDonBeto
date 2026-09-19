import { EntitySchema } from 'typeorm';

export const PurchaseDetailEntity = new EntitySchema({

  name: 'PurchaseDetail',

  tableName: 'TB_PURCHASE_DETAIL',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    purchaseId: { name: 'PURCHASE_ID', type: Number },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    quantity: { name: 'QUANTITY', type: 'decimal', precision: 12, scale: 2 },

    unitPrice: { name: 'UNIT_PRICE', type: 'decimal', precision: 12, scale: 2 },

    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 12, scale: 2 },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    purchase: {
      type: 'many-to-one',
      target: 'Purchase',
      joinColumn: { name: 'PURCHASE_ID' }
    },

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: { name: 'MEDICINE_ID' }
    }

  }

});