import { EntitySchema } from 'typeorm';

export const SaleReturnDetailEntity = new EntitySchema({
  name: 'SaleReturnDetail',
  tableName: 'TB_SALE_RETURN_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    saleReturnId: { name: 'SALE_RETURN_ID', type: Number },
    branchId: { name: 'BRANCH_ID', type: Number },
    saleDetailId: { name: 'SALE_DETAIL_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 12, scale: 3 },
    unitPrice: { name: 'UNIT_PRICE', type: 'decimal', precision: 12, scale: 2 },
    total: { name: 'TOTAL', type: 'decimal', precision: 12, scale: 2 },
    restockInventory: { name: 'RESTOCK_INVENTORY', type: Boolean, default: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    saleReturn: { type: 'many-to-one', target: 'SaleReturn', joinColumn: { name: 'SALE_RETURN_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
