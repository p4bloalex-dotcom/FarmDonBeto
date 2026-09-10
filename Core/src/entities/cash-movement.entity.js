import { EntitySchema } from 'typeorm';

export const CashMovementEntity = new EntitySchema({

  name: 'CashMovement',

  tableName: 'TB_CASH_MOVEMENT',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    cashSessionId: { name: 'CASH_SESSION_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number },

    movementTypeId: { name: 'MOVEMENT_TYPE_ID', type: Number },

    amount: { name: 'AMOUNT', type: Number },

    description: { name: 'DESCRIPTION', type: String, length: 255, nullable: true },

    referenceId: { name: 'REFERENCE_ID', type: Number, nullable: true },

    referenceType: { name: 'REFERENCE_TYPE', type: String, length: 50, nullable: true },

    movementDate: { name: 'MOVEMENT_DATE', type: 'timestamp' },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    cashSession: {
      type: 'many-to-one',
      target: 'CashSession',
      joinColumn: { name: 'CASH_SESSION_ID' }
    },

    branch: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ID' }
    },

    cashMovementType: {
      type: 'many-to-one',
      target: 'CashMovementType',
      joinColumn: { name: 'MOVEMENT_TYPE_ID' }
    }

  }

});