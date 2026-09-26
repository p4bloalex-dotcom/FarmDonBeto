import { EntitySchema } from 'typeorm';

export const InventoryReservationEntity = new EntitySchema({
  name: 'InventoryReservation',
  tableName: 'TB_INVENTORY_RESERVATION',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    customerOrderId: { name: 'CUSTOMER_ORDER_ID', type: Number, nullable: true },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 14, scale: 2, default: 0 },
    reservedAt: { name: 'RESERVED_AT', type: 'timestamp' },
    expiresAt: { name: 'EXPIRES_AT', type: 'timestamp', nullable: true },
    status: { name: 'STATUS', type: String, length: 20, default: 'ACTIVE' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } },
    customerOrder: { type: 'many-to-one', target: 'CustomerOrder', joinColumn: { name: 'CUSTOMER_ORDER_ID' } }
  }
});
