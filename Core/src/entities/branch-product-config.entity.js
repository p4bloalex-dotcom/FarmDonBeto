import { EntitySchema } from 'typeorm';

export const BranchProductConfigEntity = new EntitySchema({
  name: 'BranchProductConfig',
  tableName: 'TB_BRANCH_PRODUCT_CONFIG',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    minimumStock: { name: 'MINIMUM_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    maximumStock: { name: 'MAXIMUM_STOCK', type: 'decimal', precision: 14, scale: 2, default: 0 },
    reorderPoint: { name: 'REORDER_POINT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    suggestedOrderQuantity: { name: 'SUGGESTED_ORDER_QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    allowAutomaticTransferSuggestion: { name: 'ALLOW_AUTO_TRANSFER_SUGGESTION', type: Boolean, default: true },
    allowAutomaticPurchaseSuggestion: { name: 'ALLOW_AUTO_PURCHASE_SUGGESTION', type: Boolean, default: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
