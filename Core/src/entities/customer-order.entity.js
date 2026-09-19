import { EntitySchema } from 'typeorm';

export const CustomerOrderEntity = new EntitySchema({
  name: 'CustomerOrder',
  tableName: 'TB_CUSTOMER_ORDER',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    orderDate: { name: 'ORDER_DATE', type: 'timestamp' },
    customerName: { name: 'CUSTOMER_NAME', type: String, length: 120 },
    customerPhone: { name: 'CUSTOMER_PHONE', type: String, length: 30 },
    deliveryAddress: { name: 'DELIVERY_ADDRESS', type: String, length: 255 },
    deliveryReference: { name: 'DELIVERY_REFERENCE', type: String, length: 255, nullable: true },
    paymentMethod: { name: 'PAYMENT_METHOD', type: String, length: 20 },
    estimatedDeliveryMinutes: { name: 'ESTIMATED_DELIVERY_MINUTES', type: Number },
    subtotal: { name: 'SUBTOTAL', type: 'decimal', precision: 14, scale: 2, default: 0 },
    deliveryFee: { name: 'DELIVERY_FEE', type: 'decimal', precision: 14, scale: 2, default: 0 },
    total: { name: 'TOTAL', type: 'decimal', precision: 14, scale: 2, default: 0 },
    status: { name: 'STATUS', type: String, length: 2, default: 'P' },
    notes: { name: 'NOTES', type: String, length: 255, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    details: { type: 'one-to-many', target: 'CustomerOrderDetail', inverseSide: 'order' }
  }
});
