import { EntitySchema } from 'typeorm';

export const MedicineCategoryEntity = new EntitySchema({

  name: 'MedicineCategory',

  tableName: 'TB_MEDICINE_CATEGORY',

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
      length: 100
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

    medicines: {
      type: 'one-to-many',
      target: 'Medicine',
      inverseSide: 'category'
    }

  }

});