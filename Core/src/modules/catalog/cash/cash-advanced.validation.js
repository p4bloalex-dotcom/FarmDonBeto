import Joi from 'joi';

const returnDetailSchema = Joi.object({
  saleDetailId: Joi.number().integer().required(),
  medicineId: Joi.number().integer().required(),
  quantity: Joi.number().precision(3).min(0.001).required(),
  restockInventory: Joi.boolean().default(true)
});

export const saleReturnSchema = Joi.object({
  saleId: Joi.number().integer().required(),
  cashSessionId: Joi.number().integer().required(),
  reason: Joi.string().trim().max(500).required(),
  refundMethod: Joi.string().trim().max(30).required(),
  authorizedBy: Joi.number().integer().required(),
  details: Joi.array().items(returnDetailSchema).min(1).required()
});

const reconciliationItemSchema = Joi.object({
  method: Joi.string().trim().max(30).required(),
  declaredAmount: Joi.number().precision(2).min(0).required(),
  notes: Joi.string().trim().max(500).allow(null, ''),
  authorizedBy: Joi.number().integer().allow(null)
});

export const reconciliationSchema = Joi.object({
  items: Joi.array().items(reconciliationItemSchema).min(1).required()
});

export const callCenterOrderSchema = Joi.object({
  branchId: Joi.number().integer().required(),
  customerName: Joi.string().trim().max(120).required(),
  customerPhone: Joi.string().trim().max(30).required(),
  deliveryAddress: Joi.string().trim().max(255).required(),
  deliveryReference: Joi.string().trim().max(255).allow(null, ''),
  deliveryLatitude: Joi.number().required(),
  deliveryLongitude: Joi.number().required(),
  paymentMethod: Joi.string().trim().max(30).required(),
  paymentStatus: Joi.string().trim().max(20).default('PENDING'),
  deliveryFee: Joi.number().precision(2).min(0).default(0),
  notes: Joi.string().trim().max(500).allow(null, ''),
  items: Joi.array().items(Joi.object({
    medicineId: Joi.number().integer().required(),
    quantity: Joi.number().precision(3).min(0.001).required()
  })).min(1).required()
});
