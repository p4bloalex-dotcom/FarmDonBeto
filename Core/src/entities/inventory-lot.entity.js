import { EntitySchema } from 'typeorm';

export const InventoryLotEntity = new EntitySchema({
  name: 'InventoryLot',
  tableName: 'TB_INVENTORY_LOT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    storageLocationId: { name: 'STORAGE_LOCATION_ID', type: Number, nullable: true },
    supplierId: { name: 'SUPPLIER_ID', type: Number, nullable: true },
    lotNumber: { name: 'LOT_NUMBER', type: String, length: 60 },
    expirationDate: { name: 'EXPIRATION_DATE', type: 'timestamp' },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityAvailable: { name: 'QUANTITY_AVAILABLE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityReserved: { name: 'QUANTITY_RESERVED', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityInTransit: { name: 'QUANTITY_IN_TRANSIT', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityQuarantine: { name: 'QUANTITY_QUARANTINE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityDamaged: { name: 'QUANTITY_DAMAGED', type: 'decimal', precision: 14, scale: 2, default: 0 },
    quantityExpired: { name: 'QUANTITY_EXPIRED', type: 'decimal', precision: 14, scale: 2, default: 0 },
    sanitaryStatus: { name: 'SANITARY_STATUS', type: String, length: 30, default: 'APPROVED' },
    sanitaryBlockReason: { name: 'SANITARY_BLOCK_REASON', type: String, length: 500, nullable: true },
    purchasePrice: { name: 'PURCHASE_PRICE', type: 'decimal', precision: 14, scale: 2, nullable: true },
    receivedAt: { name: 'RECEIVED_AT', type: 'timestamp', nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } },
    storageLocation: { type: 'many-to-one', target: 'StorageLocation', joinColumn: { name: 'STORAGE_LOCATION_ID' } },
    supplier: { type: 'many-to-one', target: 'Supplier', joinColumn: { name: 'SUPPLIER_ID' } }
  }
});
