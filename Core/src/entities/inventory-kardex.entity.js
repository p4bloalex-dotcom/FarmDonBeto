import { EntitySchema } from 'typeorm';

export const InventoryKardexEntity = new EntitySchema({
  name: 'InventoryKardex',
  tableName: 'TB_INVENTORY_KARDEX',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    inventoryLotId: { name: 'INVENTORY_LOT_ID', type: Number, nullable: true },
    movementDate: { name: 'MOVEMENT_DATE', type: 'timestamp' },
    movementType: { name: 'MOVEMENT_TYPE', type: String, length: 30 },
    quantityIn: { name: 'QUANTITY_IN', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityOut: { name: 'QUANTITY_OUT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    previousBalance: { name: 'PREVIOUS_BALANCE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    balanceAfter: { name: 'BALANCE_AFTER', type: 'decimal', precision: 14, scale: 2, default: 0 },
    unitCost: { name: 'UNIT_COST', type: 'decimal', precision: 14, scale: 2, nullable: true },
    referenceType: { name: 'REFERENCE_TYPE', type: String, length: 50, nullable: true },
    referenceId: { name: 'REFERENCE_ID', type: Number, nullable: true },
    reason: { name: 'REASON', type: String, length: 255, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } },
    inventoryLot: { type: 'many-to-one', target: 'InventoryLot', joinColumn: { name: 'INVENTORY_LOT_ID' } }
  }
});
