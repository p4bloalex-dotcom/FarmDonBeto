import { EntitySchema } from 'typeorm';

export const PurchaseDetailEntity = new EntitySchema({

  name: 'PurchaseDetail',

  tableName: 'TB_PURCHASE_DETAIL',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    purchaseId: { name: 'PURCHASE_ID', type: Number },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    quantity: { name: 'QUANTITY', type: Number },

    unitPrice: { name: 'UNIT_PRICE', type: Number },

    subtotal: { name: 'SUBTOTAL', type: Number },

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