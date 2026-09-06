import { EntitySchema } from 'typeorm';

export const MedicineEntity = new EntitySchema({

  name: 'Medicine',

  tableName: 'TB_MEDICINE',

  columns: {

    id: {
      name: 'ID',
      type: Number,
      primary: true,
      generated: 'increment'
    },

    laboratoryId: {
      name: 'LABORATORY_ID',
      type: Number
    },

    presentationId: {
      name: 'PRESENTATION_ID',
      type: Number
    },

    categoryId: {
      name: 'CATEGORY_ID',
      type: Number
    },

    unitMeasurementId: {
      name: 'UNIT_MEASUREMENT_ID',
      type: Number
    },

    code: {
      name: 'CODE',
      type: String,
      length: 50,
      unique: true
    },

    name: {
      name: 'NAME',
      type: String,
      length: 150
    },

    description: {
      name: 'DESCRIPTION',
      type: String,
      length: 500,
      nullable: true
    },

    priceBuy: {
      name: 'PRICE_BUY',
      type: 'decimal',
      precision: 12,
      scale: 2,
      default: 0
    },

    priceSell: {
      name: 'PRICE_SELL',
      type: 'decimal',
      precision: 12,
      scale: 2,
      default: 0
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

    laboratory: {
      type: 'many-to-one',
      target: 'MedicineLaboratory',
      joinColumn: {
        name: 'LABORATORY_ID'
      }
    },

    presentation: {
      type: 'many-to-one',
      target: 'MedicinePresentation',
      joinColumn: {
        name: 'PRESENTATION_ID'
      }
    },

    category: {
      type: 'many-to-one',
      target: 'MedicineCategory',
      joinColumn: {
        name: 'CATEGORY_ID'
      }
    },

    unitMeasurement: {
      type: 'many-to-one',
      target: 'UnitMeasurement',
      joinColumn: {
        name: 'UNIT_MEASUREMENT_ID'
      }
    },

    supplierMedicines: {
      type: 'one-to-many',
      target: 'SupplierMedicine',
      inverseSide: 'medicine'
    }

  }

});