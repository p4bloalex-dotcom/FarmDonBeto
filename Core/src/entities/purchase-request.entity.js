import { EntitySchema } from 'typeorm';

export const PurchaseRequestEntity = new EntitySchema({
  name: 'PurchaseRequest',
  tableName: 'TB_PURCHASE_REQUEST',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    requestNumber: { name: 'REQUEST_NUMBER', type: String, length: 40 },
    branchId: { name: 'BRANCH_ID', type: Number },
    warehouseId: { name: 'WAREHOUSE_ID', type: Number, nullable: true },
    requestedBy: { name: 'REQUESTED_BY', type: Number, nullable: true },
    requestDate: { name: 'REQUEST_DATE', type: 'timestamp', createDate: true },
    requiredDate: { name: 'REQUIRED_DATE', type: 'timestamp', nullable: true },
    priority: { name: 'PRIORITY', type: String, length: 20, default: 'NORMAL' },
    reason: { name: 'REASON', type: String, length: 500, nullable: true },
    source: { name: 'SOURCE', type: String, length: 20, default: 'MANUAL' },
    status: { name: 'STATUS', type: String, length: 30, default: 'DRAFT' },
    notes: { name: 'NOTES', type: String, length: 1000, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } }
  }
});
