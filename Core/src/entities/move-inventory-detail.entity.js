import { EntitySchema } from 'typeorm';

export const MoveInventoryDetailEntity = new EntitySchema({

  name: 'MoveInventoryDetail',

  tableName: 'TB_MOVE_INVENTORY_DETAIL',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    movementId: { name: 'MOVEMENT_ID', type: Number },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    quantity: { name: 'QUANTITY', type: Number },

    unitCost: { name: 'UNIT_COST', type: Number },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    movement: {
      type: 'many-to-one',
      target: 'MoveInventory',
      joinColumn: { name: 'MOVEMENT_ID' }
    },

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: { name: 'MEDICINE_ID' }
    }

  }

});