import Joi from 'joi';

const parseDate = value => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export const positionSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(255).allow('', null),
  status: Joi.string().valid('E', 'D').default('E')
});

export const conceptSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(2).max(30).required(),
  name: Joi.string().trim().min(2).max(120).required(),
  type: Joi.string().valid('INCOME', 'DEDUCTION').required(),
  isAutomatic: Joi.boolean().default(false), is_automatic: Joi.boolean(),
  status: Joi.string().valid('E', 'D').default('E')
}).custom(value => ({ ...value, isAutomatic: value.isAutomatic ?? value.is_automatic ?? false }));

export const periodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  branchId: Joi.number().integer().allow(null, ''), branch_id: Joi.number().integer().allow(null, ''),
  dateStart: Joi.alternatives().try(Joi.date(), Joi.string()).required(), date_start: Joi.alternatives().try(Joi.date(), Joi.string()),
  dateEnd: Joi.alternatives().try(Joi.date(), Joi.string()).required(), date_end: Joi.alternatives().try(Joi.date(), Joi.string()),
  payDate: Joi.alternatives().try(Joi.date(), Joi.string()).required(), pay_date: Joi.alternatives().try(Joi.date(), Joi.string()),
  periodType: Joi.string().valid('MONTHLY', 'BIWEEKLY', 'WEEKLY').required(), period_type: Joi.string().valid('MONTHLY', 'BIWEEKLY', 'WEEKLY'),
  status: Joi.string().valid('DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PAID', 'CLOSED').default('DRAFT')
}).custom((value, helpers) => {
  const dateStart = parseDate(value.dateStart ?? value.date_start);
  const dateEnd = parseDate(value.dateEnd ?? value.date_end);
  const payDate = parseDate(value.payDate ?? value.pay_date);
  if (!dateStart || !dateEnd || !payDate || dateStart > dateEnd) return helpers.error('date.base');
  return { name: value.name, branchId: value.branchId ?? value.branch_id ?? null, dateStart, dateEnd, payDate, periodType: value.periodType ?? value.period_type, status: value.status ?? 'DRAFT' };
});

export const periodStatusSchema = Joi.object({ status: Joi.string().valid('DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PAID', 'CLOSED').required() });

export const salarySchema = Joi.object({
  employeeId: Joi.number().integer(), employee_id: Joi.number().integer(),
  positionId: Joi.number().integer(), position_id: Joi.number().integer(),
  branchId: Joi.number().integer(), branch_id: Joi.number().integer(),
  baseSalary: Joi.number().precision(2).min(0.01), base_salary: Joi.number().precision(2).min(0.01),
  effectiveFrom: Joi.alternatives().try(Joi.date(), Joi.string()), effective_from: Joi.alternatives().try(Joi.date(), Joi.string()),
  effectiveTo: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), effective_to: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  status: Joi.string().valid('A', 'I').default('A'),
  notes: Joi.string().trim().max(255).allow('', null)
}).custom((value, helpers) => {
  const employeeId = value.employeeId ?? value.employee_id;
  const positionId = value.positionId ?? value.position_id;
  const branchId = value.branchId ?? value.branch_id;
  const baseSalary = value.baseSalary ?? value.base_salary;
  const effectiveFrom = parseDate(value.effectiveFrom ?? value.effective_from ?? new Date());
  const effectiveToRaw = value.effectiveTo ?? value.effective_to;
  const effectiveTo = effectiveToRaw ? parseDate(effectiveToRaw) : null;
  if (!employeeId || !positionId || !branchId || baseSalary === undefined || !effectiveFrom) return helpers.error('any.required');
  return { employeeId, positionId, branchId, baseSalary: Number(baseSalary), effectiveFrom, effectiveTo, status: value.status ?? 'A', notes: value.notes || null };
});

export const payrollGenerateSchema = Joi.object({
  periodId: Joi.number().integer().allow(null), period_id: Joi.number().integer().allow(null),
  branchId: Joi.number().integer().allow(null), branch_id: Joi.number().integer().allow(null),
  periodStart: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), period_start: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  periodEnd: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), period_end: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  paymentDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), payment_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  defaultBonus: Joi.number().precision(2).min(0).default(0), default_bonus: Joi.number().precision(2).min(0),
  defaultDeduction: Joi.number().precision(2).min(0).default(0), default_deduction: Joi.number().precision(2).min(0),
  notes: Joi.string().trim().max(255).allow('', null)
}).custom((value, helpers) => {
  const periodStart = parseDate(value.periodStart ?? value.period_start);
  const periodEnd = parseDate(value.periodEnd ?? value.period_end);
  const paymentDate = parseDate(value.paymentDate ?? value.payment_date ?? new Date());
  const periodId = value.periodId ?? value.period_id ?? null;
  if ((!periodId && (!periodStart || !periodEnd || !paymentDate)) || (periodStart && periodEnd && periodStart > periodEnd)) return helpers.error('date.base');
  return {
    periodId,
    branchId: value.branchId ?? value.branch_id ?? null,
    periodStart,
    periodEnd,
    paymentDate,
    defaultBonus: Number(value.defaultBonus ?? value.default_bonus ?? 0),
    defaultDeduction: Number(value.defaultDeduction ?? value.default_deduction ?? 0),
    notes: value.notes || null
  };
});

export const payrollVoidSchema = Joi.object({ reason: Joi.string().trim().min(5).max(255).required() });

export const payrollAdjustmentSchema = Joi.object({
  employeeId: Joi.number().integer(), employee_id: Joi.number().integer(),
  branchId: Joi.number().integer(), branch_id: Joi.number().integer(),
  type: Joi.string().valid('B', 'D').required(),
  amount: Joi.number().precision(2).min(0.01).required(),
  reason: Joi.string().trim().min(5).max(255).required(),
  adjustmentDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), adjustment_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, '')
}).custom((value, helpers) => {
  const employeeId = value.employeeId ?? value.employee_id;
  const branchId = value.branchId ?? value.branch_id;
  const adjustmentDate = parseDate(value.adjustmentDate ?? value.adjustment_date ?? new Date());
  if (!employeeId || !branchId || !adjustmentDate) return helpers.error('any.required');
  return { employeeId, branchId, type: value.type, amount: Number(value.amount), reason: value.reason, adjustmentDate };
});
