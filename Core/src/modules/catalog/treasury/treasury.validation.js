import Joi from 'joi';

export const financialAccountSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  type: Joi.string().valid('BANK', 'CASH_FUND').required(),
  accountNumber: Joi.string().trim().max(60).allow('', null), account_number: Joi.string().trim().max(60).allow('', null),
  openingBalance: Joi.number().precision(2).default(0), opening_balance: Joi.number().precision(2),
  status: Joi.string().valid('E', 'D').default('E')
}).custom(value => ({
  name: value.name,
  type: value.type,
  accountNumber: value.accountNumber ?? value.account_number ?? null,
  openingBalance: Number(value.openingBalance ?? value.opening_balance ?? 0),
  status: value.status ?? 'E'
}));

export const financialMovementSchema = Joi.object({
  financialAccountId: Joi.number().integer().allow(null, ''), financial_account_id: Joi.number().integer().allow(null, ''),
  cashSessionId: Joi.number().integer().allow(null, ''), cash_session_id: Joi.number().integer().allow(null, ''),
  branchId: Joi.number().integer().allow(null, ''), branch_id: Joi.number().integer().allow(null, ''),
  sourceType: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION').required(), source_type: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION'),
  operation: Joi.string().valid('E', 'S').required(),
  amount: Joi.number().precision(2).min(0.01).required(),
  description: Joi.string().trim().min(3).max(255).required(),
  movementDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), movement_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, '')
}).custom((value, helpers) => {
  const sourceType = value.sourceType ?? value.source_type;
  const financialAccountId = value.financialAccountId ?? value.financial_account_id ?? null;
  const cashSessionId = value.cashSessionId ?? value.cash_session_id ?? null;
  if (sourceType === 'CASH_SESSION' && !cashSessionId) return helpers.error('any.required');
  if (sourceType !== 'CASH_SESSION' && !financialAccountId) return helpers.error('any.required');
  const movementDate = value.movementDate ?? value.movement_date ? new Date(value.movementDate ?? value.movement_date) : new Date();
  if (isNaN(movementDate.getTime())) return helpers.error('date.base');
  return { financialAccountId, cashSessionId, branchId: value.branchId ?? value.branch_id ?? null, sourceType, operation: value.operation, amount: Number(value.amount), description: value.description, movementDate };
});

export const transferSchema = Joi.object({
  fromAccountId: Joi.number().integer().required(), from_account_id: Joi.number().integer(),
  toAccountId: Joi.number().integer().required(), to_account_id: Joi.number().integer(),
  amount: Joi.number().precision(2).min(0.01).required(),
  description: Joi.string().trim().max(255).allow('', null),
  movementDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), movement_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, '')
}).custom((value, helpers) => {
  const fromAccountId = value.fromAccountId ?? value.from_account_id;
  const toAccountId = value.toAccountId ?? value.to_account_id;
  if (fromAccountId === toAccountId) return helpers.error('any.invalid');
  const movementDate = value.movementDate ?? value.movement_date ? new Date(value.movementDate ?? value.movement_date) : new Date();
  if (isNaN(movementDate.getTime())) return helpers.error('date.base');
  return { fromAccountId, toAccountId, amount: Number(value.amount), description: value.description || 'Transferencia entre cuentas', movementDate };
});

export const reconcileSchema = Joi.object({ note: Joi.string().trim().max(255).allow('', null) });
export const reverseSchema = Joi.object({ reason: Joi.string().trim().min(5).max(255).required() });
