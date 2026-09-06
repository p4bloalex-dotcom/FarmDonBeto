import { EntitySchema } from 'typeorm';

export const SupplierMedicineEntity = new EntitySchema({

  name: 'SupplierMedicine',

  tableName: 'TB_SUPPLIER_MEDICINE',

  columns: {

    id: {
      name: 'ID',
      type: Number,
      primary: true,
      generated: 'increment'
    },

    supplierId: {
      name: 'SUPPLIER_ID',
      type: Number
    },

    medicineId: {
      name: 'MEDICINE_ID',
      type: Number
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

    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: {
        name: 'SUPPLIER_ID'
      }
    },

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: {
        name: 'MEDICINE_ID'
      }
    }

  }

});