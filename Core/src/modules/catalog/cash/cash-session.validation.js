import Joi from 'joi';

const parseDate = raw => {
  if (raw === null || raw === '' || raw === undefined) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

export const openSessionSchema = Joi.object({
  cashRegisterId: Joi.number().integer(),
  cash_register_id: Joi.number().integer(),
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  openingDate: Joi.alternatives().try(Joi.date(), Joi.string()),
  openingAmount: Joi.number().precision(2).min(0)
}).custom((value, helpers) => {
  const cashRegisterId = value.cashRegisterId ?? value.cash_register_id;

  if (!cashRegisterId) {
    return helpers.error('any.required');
  }

  const openingDate = parseDate(value.openingDate);
  if (openingDate === undefined) {
    return helpers.error('date.base');
  }

  return {
    cashRegisterId,
    openingDate: openingDate ?? new Date(),
    openingAmount: value.openingAmount ?? 0
  };
});

export const closeSessionSchema = Joi.object({
  closingDate: Joi.alternatives().try(Joi.date(), Joi.string()),
  closingAmount: Joi.number().precision(2).min(0).required()
}).custom((value, helpers) => {
  const closingDate = parseDate(value.closingDate);
  if (closingDate === undefined) {
    return helpers.error('date.base');
  }

  return {
    closingAmount: value.closingAmount,
    closingDate: closingDate ?? new Date()
  };
});