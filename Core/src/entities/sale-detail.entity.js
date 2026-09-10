import { EntitySchema } from 'typeorm';

export const SaleDetailEntity = new EntitySchema({

  name: 'SaleDetail',

  tableName: 'TB_SALE_DETAIL',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    saleId: { name: 'SALE_ID', type: Number },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    quantity: { name: 'QUANTITY', type: Number },

    unitPrice: { name: 'UNIT_PRICE', type: Number },

    total: { name: 'TOTAL', type: Number },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    sale: {
      type: 'many-to-one',
      target: 'Sale',
      joinColumn: { name: 'SALE_ID' }
    },

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: { name: 'MEDICINE_ID' }
    }

  }

});