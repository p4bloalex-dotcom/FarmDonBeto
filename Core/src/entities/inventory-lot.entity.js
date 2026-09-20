import { EntitySchema } from 'typeorm';

export const InventoryLotEntity = new EntitySchema({
  name: 'InventoryLot',
  tableName: 'TB_INVENTORY_LOT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    lotNumber: { name: 'LOT_NUMBER', type: String, length: 60 },
    expirationDate: { name: 'EXPIRATION_DATE', type: 'timestamp' },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
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
