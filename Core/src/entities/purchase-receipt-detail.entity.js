import { EntitySchema } from 'typeorm';

export const PurchaseReceiptDetailEntity = new EntitySchema({
  name: 'PurchaseReceiptDetail',
  tableName: 'TB_PURCHASE_RECEIPT_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    receiptId: { name: 'RECEIPT_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    purchaseDetailId: { name: 'PURCHASE_DETAIL_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    quantityReceived: { name: 'QUANTITY_RECEIVED', type: 'decimal', precision: 14, scale: 2 },
    quantityAccepted: { name: 'QUANTITY_ACCEPTED', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityRejected: { name: 'QUANTITY_REJECTED', type: 'decimal', precision: 14, scale: 2, default: 0 },
    batchNumber: { name: 'BATCH_NUMBER', type: String, length: 60, nullable: true },
    manufacturingDate: { name: 'MANUFACTURING_DATE', type: 'timestamp', nullable: true },
    expirationDate: { name: 'EXPIRATION_DATE', type: 'timestamp', nullable: true },
    storageCondition: { name: 'STORAGE_CONDITION', type: String, length: 120, nullable: true },
    temperatureAtReception: { name: 'TEMPERATURE_AT_RECEPTION', type: 'decimal', precision: 8, scale: 2, nullable: true },
    warehouseId: { name: 'WAREHOUSE_ID', type: Number, nullable: true },
    locationId: { name: 'LOCATION_ID', type: Number, nullable: true },
    qualityStatus: { name: 'QUALITY_STATUS', type: String, length: 30, default: 'AVAILABLE' },
    rejectionReason: { name: 'REJECTION_REASON', type: String, length: 500, nullable: true },
    receivedBy: { name: 'RECEIVED_BY', type: Number, nullable: true },
    verifiedBy: { name: 'VERIFIED_BY', type: Number, nullable: true }
  },
  relations: {
    receipt: { type: 'many-to-one', target: 'PurchaseReceipt', joinColumn: { name: 'RECEIPT_ID' } },
    purchaseDetail: { type: 'many-to-one', target: 'PurchaseDetail', joinColumn: { name: 'PURCHASE_DETAIL_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
