import { EntitySchema } from 'typeorm';

export const PurchaseDetailEntity = new EntitySchema({

  name: 'PurchaseDetail',

  tableName: 'TB_PURCHASE_DETAIL',

  columns: {

    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },

    purchaseId: { name: 'PURCHASE_ID', type: Number },

    medicineId: { name: 'MEDICINE_ID', type: Number },

    quantity: { name: 'QUANTITY', type: 'decimal', precision: 12, scale: 2 },

    quantityOrdered: { name: 'QUANTITY_ORDERED', type: 'decimal', precision: 12, scale: 2, nullable: true },

    quantityReceived: { name: 'QUANTITY_RECEIVED', type: 'decimal', precision: 12, scale: 2, default: 0 },

    quantityPending: { name: 'QUANTITY_PENDING', type: 'decimal', precision: 12, scale: 2, nullable: true },

    quantityRejected: { name: 'QUANTITY_REJECTED', type: 'decimal', precision: 12, scale: 2, default: 0 },

    unitOfMeasureId: { name: 'UNIT_OF_MEASURE_ID', type: Number, nullable: true },

    unitPrice: { name: 'UNIT_PRICE', type: 'decimal', precision: 12, scale: 2 },

    discountPercentage: { name: 'DISCOUNT_PERCENTAGE', type: 'decimal', precision: 8, scale: 2, default: 0 },

    discountAmount: { name: 'DISCOUNT_AMOUNT', type: 'decimal', precision: 12, scale: 2, default: 0 },

    taxPercentage: { name: 'TAX_PERCENTAGE', type: 'decimal', precision: 8, scale: 2, default: 0 },

    taxAmount: { name: 'TAX_AMOUNT', type: 'decimal', precision: 12, scale: 2, default: 0 },

    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 12, scale: 2 },

    total: { name: 'TOTAL', type: 'decimal', precision: 12, scale: 2, nullable: true },

    lotNumber: { name: 'LOT_NUMBER', type: String, length: 60, nullable: true },

    expirationDate: { name: 'EXPIRATION_DATE', type: 'timestamp', nullable: true },

    expectedDeliveryDate: { name: 'EXPECTED_DELIVERY_DATE', type: 'timestamp', nullable: true },

    status: { name: 'STATUS', type: String, length: 30, default: 'ORDERED' },

    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },

    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },

    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },

    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }

  },

  relations: {

    purchase: {
      type: 'many-to-one',
      target: 'Purchase',
      joinColumn: { name: 'PURCHASE_ID' }
    },

    medicine: {
      type: 'many-to-one',
      target: 'Medicine',
      joinColumn: { name: 'MEDICINE_ID' }
    }

  }

});
