import { EntitySchema } from 'typeorm';

export const CustomerOrderDetailEntity = new EntitySchema({
  name: 'CustomerOrderDetail',
  tableName: 'TB_CUSTOMER_ORDER_DETAIL',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    orderId: { name: 'ORDER_ID', type: Number },
    medicineId: { name: 'MEDICINE_ID', type: Number },
    quantity: { name: 'QUANTITY', type: 'decimal', precision: 12, scale: 2 },
    unitPrice: { name: 'UNIT_PRICE', type: 'decimal', precision: 14, scale: 2 },
    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 14, scale: 2 },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    order: { type: 'many-to-one', target: 'CustomerOrder', joinColumn: { name: 'ORDER_ID' } },
    medicine: { type: 'many-to-one', target: 'Medicine', joinColumn: { name: 'MEDICINE_ID' } }
  }
});
