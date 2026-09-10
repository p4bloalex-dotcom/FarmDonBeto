import { EntitySchema } from 'typeorm';

export const InventoryEntity = new EntitySchema({

  name: 'Inventory',

  tableName: 'TB_INVENTORY',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number },

    stockAvailable: { name: 'STOCK_AVAILABLE', type: Number, default: 0 },

    reserve: { name: 'RESERVE', type: Number, default: 0 },

    stockMin: { name: 'STOCK_MIN', type: Number, default: 0 },

    stockMax: { name: 'STOCK_MAX', type: Number, default: 0 },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: { name: 'MEDICINE_ID' }
    },

    branch: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ID' }
    }

  }

});