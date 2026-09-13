import Joi from 'joi';

const parseDate = raw => {
  if (raw === null || raw === '' || raw === undefined) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

const referenceTypes = ['SALE', 'PURCHASE', 'SUPPLIER_PAYMENT', 'SESSION', 'OTHER'];

export const cashMovementSchema = Joi.object({
  cashSessionId: Joi.number().integer(),
  cash_session_id: Joi.number().integer(),
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  movementTypeId: Joi.number().integer(),
  movement_type_id: Joi.number().integer(),
  amount: Joi.number().precision(2).min(0.01).required(),
  description: Joi.string().max(255).allow(null, ''),
  referenceId: Joi.number().integer().allow(null, ''),
  referenceType: Joi.string().valid(...referenceTypes).allow(null, ''),
  movementDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const cashSessionId = value.cashSessionId ?? value.cash_session_id;
  const movementTypeId = value.movementTypeId ?? value.movement_type_id;

  if (!cashSessionId || !movementTypeId) {
    return helpers.error('any.required');
  }

  const movementDate = parseDate(value.movementDate);
  if (movementDate === undefined) {
    return helpers.error('date.base');
  }

  return {
    cashSessionId,
    movementTypeId,
    amount: value.amount,
    description: value.description || null,
    referenceId: value.referenceId || null,
    referenceType: value.referenceType || null,
    movementDate: movementDate ?? new Date(),
    status: value.status ?? 'E'
  };
});