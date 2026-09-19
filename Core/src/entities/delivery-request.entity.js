import { EntitySchema } from 'typeorm';

export const DeliveryRequestEntity = new EntitySchema({
  name: 'DeliveryRequest',
  tableName: 'TB_DELIVERY_REQUEST',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    requestingBranchId: { name: 'REQUESTING_BRANCH_ID', type: Number },
    fulfillmentBranchId: { name: 'FULFILLMENT_BRANCH_ID', type: Number },
    movementId: { name: 'MOVEMENT_ID', type: Number, nullable: true },
    customerName: { name: 'CUSTOMER_NAME', type: String, length: 120, nullable: true },
    customerContact: { name: 'CUSTOMER_CONTACT', type: String, length: 80, nullable: true },
    requestedAt: { name: 'REQUESTED_AT', type: 'timestamp' },
    neededAt: { name: 'NEEDED_AT', type: 'timestamp', nullable: true },
    deliveredAt: { name: 'DELIVERED_AT', type: 'timestamp', nullable: true },
    notes: { name: 'NOTES', type: String, length: 255, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'P' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    requestingBranch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'REQUESTING_BRANCH_ID' } },
    fulfillmentBranch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'FULFILLMENT_BRANCH_ID' } },
    movement: { type: 'many-to-one', target: 'MoveInventory', joinColumn: { name: 'MOVEMENT_ID' }, nullable: true }
  }
});
