import Joi from 'joi';

const itemSchema = Joi.object({
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  quantity: Joi.number().precision(2).min(0.01).required()
}).custom((value, helpers) => {
  const medicineId = value.medicineId ?? value.medicine_id;
  if (!medicineId) return helpers.error('any.required');
  return { medicineId, quantity: value.quantity };
});

export const availabilitySchema = Joi.object({
  deliveryAddress: Joi.string().trim().max(255).allow('', null),
  deliveryLatitude: Joi.number().min(-90).max(90).allow(null),
  delivery_latitude: Joi.number().min(-90).max(90).allow(null),
  deliveryLongitude: Joi.number().min(-180).max(180).allow(null),
  delivery_longitude: Joi.number().min(-180).max(180).allow(null),
  items: Joi.array().items(itemSchema).min(1).required()
}).custom(value => ({
  deliveryAddress: value.deliveryAddress || null,
  deliveryLatitude: value.deliveryLatitude ?? value.delivery_latitude ?? null,
  deliveryLongitude: value.deliveryLongitude ?? value.delivery_longitude ?? null,
  items: value.items
}));

export const customerOrderSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  customerName: Joi.string().trim().min(2).max(120).required(),
  customerPhone: Joi.string().trim().min(6).max(30).required(),
  deliveryAddress: Joi.string().trim().min(5).max(255).required(),
  deliveryReference: Joi.string().trim().max(255).allow('', null),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'TRANSFER', 'COD').required(),
  estimatedDeliveryMinutes: Joi.number().integer().min(10).max(480).required(),
  deliveryFee: Joi.number().precision(2).min(0).default(0),
  notes: Joi.string().trim().max(255).allow('', null),
  items: Joi.array().items(itemSchema).min(1).required()
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  if (!branchId) return helpers.error('any.required');
  return {
    branchId,
    customerName: value.customerName,
    customerPhone: value.customerPhone,
    deliveryAddress: value.deliveryAddress,
    deliveryReference: value.deliveryReference || null,
    paymentMethod: value.paymentMethod,
    estimatedDeliveryMinutes: value.estimatedDeliveryMinutes,
    deliveryFee: value.deliveryFee ?? 0,
    notes: value.notes || null,
    items: value.items
  };
});

export const orderStatusSchema = Joi.object({ status: Joi.string().valid('S', 'D', 'C').required() });
