import { EntitySchema } from 'typeorm';

export const PurchaseRequestDetailEntity = new EntitySchema({
  name: 'PurchaseRequestDetail',
  tableName: 'TB_PURCHASE_REQUEST_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    requestId: { name: 'REQUEST_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    unitOfMeasureId: { name: 'UNIT_OF_MEASURE_ID', type: Number, nullable: true },
    currentStock: { name: 'CURRENT_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    availableStock: { name: 'AVAILABLE_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    minimumStock: { name: 'MINIMUM_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    maximumStock: { name: 'MAXIMUM_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    averageConsumption: { name: 'AVERAGE_CONSUMPTION', type: 'decimal', precision: 14, scale: 2, default: 0 },
    suggestedQuantity: { name: 'SUGGESTED_QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    requestedQuantity: { name: 'REQUESTED_QUANTITY', type: 'decimal', precision: 14, scale: 2 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  },
  relations: {
    request: { type: 'many-to-one', target: 'PurchaseRequest', joinColumn: { name: 'REQUEST_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
