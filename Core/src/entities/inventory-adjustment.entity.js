import { EntitySchema } from 'typeorm';

export const InventoryAdjustmentEntity = new EntitySchema({
  name: 'InventoryAdjustment',
  tableName: 'TB_INVENTORY_ADJUSTMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    adjustmentDate: { name: 'ADJUSTMENT_DATE', type: 'timestamp' },
    quantityBefore: { name: 'QUANTITY_BEFORE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityAfter: { name: 'QUANTITY_AFTER', type: 'decimal', precision: 14, scale: 2, default: 0 },
    delta: { name: 'DELTA', type: 'decimal', precision: 14, scale: 2, default: 0 },
    reason: { name: 'REASON', type: String, length: 255 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
