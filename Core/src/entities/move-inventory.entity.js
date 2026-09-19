import { EntitySchema } from 'typeorm';

export const MoveInventoryEntity = new EntitySchema({

  name: 'MoveInventory',

  tableName: 'TB_MOVE_INVENTORY',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    branchOriginId: { name: 'BRANCH_ORIGIN_ID', type: Number },

    branchDestinationId: { name: 'BRANCH_DESTINATION_ID', type: Number },

    movementTypeId: { name: 'MOVEMENT_TYPE_ID', type: Number },

    movementDate: { name: 'MOVEMENT_DATE', type: 'timestamp' },

    description: { name: 'DESCRIPTION', type: String, length: 255, nullable: true },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    branchOrigin: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ORIGIN_ID' }
    },

    branchDestination: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_DESTINATION_ID' }
    },

    movementType: {
      type: 'many-to-one',
      target: 'MovementType',
      joinColumn: { name: 'MOVEMENT_TYPE_ID' }
    }

  }

});