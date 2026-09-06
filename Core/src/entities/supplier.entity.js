import { EntitySchema } from 'typeorm';

export const SupplierEntity = new EntitySchema({

  name: 'Supplier',

  tableName: 'TB_SUPPLIER',

  columns: {

    id: {
      name: 'ID',
      type: Number,
      primary: true,
      generated: 'increment'
    },

    name: {
      name: 'NAME',
      type: String,
      length: 150
    },

    address: {
      name: 'ADDRESS',
      type: String,
      length: 255,
      nullable: true
    },

    status: {
      name: 'STATUS',
      type: String,
      length: 2,
      default: 'E'
    },

    createdAt: {
      name: 'CREATED_AT',
      type: 'timestamp',
      createDate: true
    },

    updatedAt: {
      name: 'UPDATED_AT',
      type: 'timestamp',
      updateDate: true,
      nullable: true
    },

    createdBy: {
      name: 'CREATED_BY',
      type: Number,
      nullable: true
    },

    updatedBy: {
      name: 'UPDATED_BY',
      type: Number,
      nullable: true
    }

  },

  relations: {

    supplierMedicines: {
      type: 'one-to-many',
      target: 'SupplierMedicine',
      inverseSide: 'supplier'
    }

  }

});