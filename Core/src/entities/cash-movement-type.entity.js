import { EntitySchema } from 'typeorm';

export const CashMovementTypeEntity = new EntitySchema({

  name: 'CashMovementType',

  tableName: 'TB_CASH_MOVEMENT_TYPE',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    name: { name: 'NAME', type: String, length: 100 },

    code: { name: 'CODE', type: String, length: 30, unique: true },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  }

});