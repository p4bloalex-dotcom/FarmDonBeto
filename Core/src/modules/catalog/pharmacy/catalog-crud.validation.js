import Joi from 'joi';

export const statusSchema = Joi.object({ status: Joi.string().valid('E', 'D', 'I').required() }).unknown(true);

export const nameSchema = Joi.object({
  name: Joi.string().max(150).required(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom(value => ({
  name: value.name,
  status: value.status ?? 'E'
}));

export const supplierSchema = Joi.object({
  name: Joi.string().max(150).required(),
  address: Joi.string().max(255).allow(null, ''),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom(value => ({
  name: value.name,
  address: value.address || null,
  status: value.status ?? 'E'
}));

export const medicineSchema = Joi.object({
  laboratoryId: Joi.number().integer(),
  laboratory_id: Joi.number().integer(),
  presentationId: Joi.number().integer(),
  presentation_id: Joi.number().integer(),
  categoryId: Joi.number().integer(),
  category_id: Joi.number().integer(),
  unitMeasurementId: Joi.number().integer(),
  unit_measurement_id: Joi.number().integer(),
  code: Joi.string().max(50).required(),
  name: Joi.string().max(150).required(),
  description: Joi.string().max(500).allow(null, ''),
  imageUrl: Joi.string().uri({ scheme: ['http', 'https'] }).max(500).allow(null, ''),
  image_url: Joi.string().uri({ scheme: ['http', 'https'] }).max(500).allow(null, ''),
  priceBuy: Joi.number().precision(2).min(0),
  price_buy: Joi.number().precision(2).min(0),
  priceSell: Joi.number().precision(2).min(0),
  price_sell: Joi.number().precision(2).min(0),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const laboratoryId = value.laboratoryId ?? value.laboratory_id;
  const presentationId = value.presentationId ?? value.presentation_id;
  const categoryId = value.categoryId ?? value.category_id;
  const unitMeasurementId = value.unitMeasurementId ?? value.unit_measurement_id;

  if (!laboratoryId || !presentationId || !categoryId || !unitMeasurementId) {
    return helpers.error('any.required');
  }

  return {
    laboratoryId,
    presentationId,
    categoryId,
    unitMeasurementId,
    code: value.code,
    name: value.name,
    description: value.description || null,
    imageUrl: (value.imageUrl ?? value.image_url) || null,
    priceBuy: value.priceBuy ?? value.price_buy ?? 0,
    priceSell: value.priceSell ?? value.price_sell ?? 0,
    status: value.status ?? 'E'
  };
});

export const supplierMedicineSchema = Joi.object({
  supplierId: Joi.number().integer(),
  supplier_id: Joi.number().integer(),
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const supplierId = value.supplierId ?? value.supplier_id;
  const medicineId = value.medicineId ?? value.medicine_id;

  if (!supplierId || !medicineId) {
    return helpers.error('any.required');
  }

  return {
    supplierId,
    medicineId,
    status: value.status ?? 'E'
  };
});

export const cashMovementTypeSchema = Joi.object({
  name: Joi.string().max(150).required(),
  code: Joi.string().max(30).required(),
  operation: Joi.string().valid('I', 'E').default('E'),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom(value => ({
  name: value.name,
  code: value.code,
  operation: value.operation ?? 'E',
  status: value.status ?? 'E'
}));
