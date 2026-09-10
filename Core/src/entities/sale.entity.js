import { EntitySchema } from 'typeorm';

export const SaleEntity = new EntitySchema({

  name: 'Sale',

  tableName: 'TB_SALE',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    branchId: { name: 'BRANCH_ID', type: Number },

    employeeId: { name: 'EMPLOYEE_ID', type: Number },

    customerId: { name: 'CUSTOMER_ID', type: Number, nullable: true },

    saleDate: { name: 'SALE_DATE', type: 'timestamp' },

    subtotal: { name: 'SUBTOTAL', type: Number },

    tax: { name: 'TAX', type: Number },

    total: { name: 'TOTAL', type: Number },

    status: { name: 'STATUS', type: String, length: 2, default: 'E' },

    paymentMethod: { name: 'PAYMENT_METHOD', type: String, length: 30 },

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
    },

    employee: {
      type: 'many-to-one',
      target: 'Employee',
      joinColumn: { name: 'EMPLOYEE_ID' }
    }

  }

});