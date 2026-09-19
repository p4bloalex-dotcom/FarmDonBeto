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
  category: Joi.string().trim().max(80).allow('', null),
  location: Joi.string().trim().max(120).allow('', null),
  responsible: Joi.string().trim().max(120).allow('', null),
  purchaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null),
  purchase_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null),
  purchaseCost: Joi.number().precision(2).min(0),
  purchase_cost: Joi.number().precision(2).min(0),
  accumulatedDepreciation: Joi.number().precision(2).min(0),
  accumulated_depreciation: Joi.number().precision(2).min(0),
  usefulLifeMonths: Joi.number().integer().min(1).allow(null),
  useful_life_months: Joi.number().integer().min(1).allow(null),
  notes: Joi.string().trim().max(255).allow('', null),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  if (!branchId) return helpers.error('any.required');
  const purchaseDate = parseDate(value.purchaseDate ?? value.purchase_date);
  if (purchaseDate === undefined) return helpers.error('date.base');
  const purchaseCost = Number(value.purchaseCost ?? value.purchase_cost ?? 0);
  const accumulatedDepreciation = Number(value.accumulatedDepreciation ?? value.accumulated_depreciation ?? 0);
  if (accumulatedDepreciation > purchaseCost) return helpers.error('any.custom', { message: 'La depreciacion no puede superar el costo.' });
  return {
    branchId,
    code: value.code,
    name: value.name,
    category: value.category || null,
    location: value.location || null,
    responsible: value.responsible || null,
    purchaseDate,
    purchaseCost,
    accumulatedDepreciation,
    usefulLifeMonths: value.usefulLifeMonths ?? value.useful_life_months ?? null,
    notes: value.notes || null,
    status: value.status ?? 'E'
  };
});

export const fixedAssetStatusSchema = Joi.object({ status: Joi.string().valid('E', 'D', 'I').required() }).unknown(true);

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
