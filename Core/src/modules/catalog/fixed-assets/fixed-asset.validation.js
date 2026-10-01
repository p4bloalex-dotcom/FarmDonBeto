import Joi from 'joi';

const parseDate = raw => {
  if (raw === null || raw === '' || raw === undefined) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

export const fixedAssetSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  code: Joi.string().trim().min(1).max(40).required(),
  name: Joi.string().trim().min(1).max(120).required(),
  category: Joi.string().trim().min(1).max(80).required(),
  brand: Joi.string().trim().max(80).allow('', null),
  model: Joi.string().trim().max(80).allow('', null),
  serialNumber: Joi.string().trim().max(80).allow('', null),
  serial_number: Joi.string().trim().max(80).allow('', null),
  location: Joi.string().trim().max(120).allow('', null),
  responsible: Joi.string().trim().max(120).allow('', null),
  purchaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).required(),
  purchase_date: Joi.alternatives().try(Joi.date(), Joi.string()),
  purchaseCost: Joi.number().precision(2).min(0).required(),
  purchase_cost: Joi.number().precision(2).min(0),
  supplier: Joi.string().trim().max(120).allow('', null),
  usefulLifeMonths: Joi.number().integer().min(1).allow(null),
  useful_life_months: Joi.number().integer().min(1).allow(null),
  condition: Joi.string().valid('BUENO', 'REGULAR', 'MALO').default('BUENO'),
  attributes: Joi.object().unknown(true).default({}),
  notes: Joi.string().trim().max(255).allow('', null),
  status: Joi.string().valid('E', 'M', 'D').default('E')
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  if (!branchId) return helpers.error('any.required');
  const purchaseDate = parseDate(value.purchaseDate ?? value.purchase_date);
  if (!purchaseDate) return helpers.error('date.base');
  const purchaseCost = Number(value.purchaseCost ?? value.purchase_cost ?? 0);
  return {
    branchId,
    code: value.code,
    name: value.name,
    category: value.category,
    brand: value.brand || null,
    model: value.model || null,
    serialNumber: value.serialNumber ?? value.serial_number ?? null,
    location: value.location || null,
    responsible: value.responsible || null,
    purchaseDate,
    purchaseCost,
    supplier: value.supplier || null,
    usefulLifeMonths: value.usefulLifeMonths ?? value.useful_life_months ?? null,
    condition: value.condition ?? 'BUENO',
    attributes: value.attributes ?? {},
    notes: value.notes || null,
    status: value.status ?? 'E'
  };
});

export const fixedAssetStatusSchema = Joi.object({ status: Joi.string().valid('E', 'M', 'D').required() }).unknown(true);

export const fixedAssetRetireSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(255).required()
});

export const fixedAssetTransferSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  location: Joi.string().trim().max(120).allow('', null),
  responsible: Joi.string().trim().max(120).allow('', null),
  reason: Joi.string().trim().min(5).max(255).required()
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  if (!branchId) return helpers.error('any.required');
  return {
    branchId,
    location: value.location || null,
    responsible: value.responsible || null,
    reason: value.reason
  };
});
