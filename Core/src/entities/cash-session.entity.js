import { EntitySchema } from 'typeorm';

export const CashSessionEntity = new EntitySchema({

  name: 'CashSession',

  tableName: 'TB_CASH_SESSION',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    cashRegisterId: { name: 'CASH_REGISTER_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number },

    openingDate: { name: 'OPENING_DATE', type: 'timestamp' },

    closingDate: { name: 'CLOSING_DATE', type: 'timestamp', nullable: true },

    openingAmount: { name: 'OPENING_AMOUNT', type: Number },

    closingAmount: { name: 'CLOSING_AMOUNT', type: Number, nullable: true },

    expectedAmount: { name: 'EXPECTED_AMOUNT', type: Number, nullable: true },

    differenceAmount: { name: 'DIFFERENCE_AMOUNT', type: Number, nullable: true },

    countedBreakdown: { name: 'COUNTED_BREAKDOWN', type: 'clob', nullable: true },

    differenceExplanation: { name: 'DIFFERENCE_EXPLANATION', type: String, length: 500, nullable: true },

    authorizedBy: { name: 'AUTHORIZED_BY', type: Number, nullable: true },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    cashRegister: {
      type: 'many-to-one',
      target: 'CashRegister',
      joinColumn: { name: 'CASH_REGISTER_ID' }
    },

    branch: {
      type: 'many-to-one',
      target: 'Branch',
      joinColumn: { name: 'BRANCH_ID' }
    }

  }

});
