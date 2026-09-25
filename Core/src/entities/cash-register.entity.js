import { EntitySchema } from 'typeorm';

export const CashRegisterEntity = new EntitySchema({

  name: 'CashRegister',

  tableName: 'TB_CASH_REGISTER',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    branchId: { name: 'BRANCH_ID', type: Number },

    name: { name: 'NAME', type: String, length: 100 },

    code: { name: 'CODE', type: String, length: 30, unique: true },

    cashLimit: { name: 'CASH_LIMIT', type: 'decimal', precision: 12, scale: 2, nullable: true },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    branch: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ID' }
    }

  }

});
