import { EntitySchema } from 'typeorm';

export const PurchaseReturnEntity = new EntitySchema({
  name: 'PurchaseReturn',
  tableName: 'TB_PURCHASE_RETURN',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    supplierId: { name: 'SUPPLIER_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    purchaseId: { name: 'PURCHASE_ID', type: Number },
    receiptId: { name: 'RECEIPT_ID', type: Number, nullable: true },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    batchNumber: { name: 'BATCH_NUMBER', type: String, length: 60, nullable: true },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 14, scale: 2 },
    reason: { name: 'REASON', type: String, length: 500 },
    status: { name: 'STATUS', type: String, length: 30, default: 'REGISTERED' },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  }
});
