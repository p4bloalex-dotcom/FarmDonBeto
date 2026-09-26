import { EntitySchema } from 'typeorm';

export const SaleLotDetailEntity = new EntitySchema({
  name: 'SaleLotDetail',
  tableName: 'TB_SALE_LOT_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    saleDetailId: { name: 'SALE_DETAIL_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    inventoryLotId: { name: 'INVENTORY_LOT_ID', type: Number },
    lotNumber: { name: 'LOT_NUMBER', type: String, length: 60 },
    expirationDate: { name: 'EXPIRATION_DATE', type: 'timestamp' },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true }
  },
  relations: {
    saleDetail: { type: 'many-to-one', target: 'SaleDetail', joinColumn: { name: 'SALE_DETAIL_ID' } },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    inventoryLot: { type: 'many-to-one', target: 'InventoryLot', joinColumn: { name: 'INVENTORY_LOT_ID' } }
  }
});
