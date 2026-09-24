import { EntitySchema } from 'typeorm';

export const PurchaseReceiptEntity = new EntitySchema({
  name: 'PurchaseReceipt',
  tableName: 'TB_PURCHASE_RECEIPT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    receiptNumber: { name: 'RECEIPT_NUMBER', type: String, length: 40 },
    purchaseId: { name: 'PURCHASE_ID', type: Number },

    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    warehouseId: { name: 'WAREHOUSE_ID', type: Number, nullable: true },
    receivedAt: { name: 'RECEIVED_AT', type: 'timestamp', createDate: true },
    receivedBy: { name: 'RECEIVED_BY', type: Number, nullable: true },
    verifiedBy: { name: 'VERIFIED_BY', type: Number, nullable: true },
    supplierDeliveryDocument: { name: 'SUPPLIER_DELIVERY_DOCUMENT', type: String, length: 100, nullable: true },
    status: { name: 'STATUS', type: String, length: 30, default: 'RECEIVED' },
    notes: { name: 'NOTES', type: String, length: 1000, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  },
  relations: {
    purchase: { type: 'many-to-one', target: 'Purchase', joinColumn: { name: 'PURCHASE_ID' } }
  }
});
