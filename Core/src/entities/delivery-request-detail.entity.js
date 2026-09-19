import { EntitySchema } from 'typeorm';

export const DeliveryRequestDetailEntity = new EntitySchema({
  name: 'DeliveryRequestDetail',
  tableName: 'TB_DELIVERY_REQUEST_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    requestId: { name: 'REQUEST_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 12, scale: 2 },
    unitCost: { name: 'UNIT_COST', type: 'decimal', precision: 12, scale: 2, default: 0 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    request: { type: 'many-to-one', target: 'DeliveryRequest', joinColumn: { name: 'REQUEST_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
