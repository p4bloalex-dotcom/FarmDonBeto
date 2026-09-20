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

export const salarySchema = Joi.object({
  employeeId: Joi.number().integer(), employee_id: Joi.number().integer(),
  positionId: Joi.number().integer(), position_id: Joi.number().integer(),
  branchId: Joi.number().integer(), branch_id: Joi.number().integer(),
  baseSalary: Joi.number().precision(2).min(0), base_salary: Joi.number().precision(2).min(0),
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
  branchId: Joi.number().integer().allow(null), branch_id: Joi.number().integer().allow(null),
  periodStart: Joi.alternatives().try(Joi.date(), Joi.string()).required(), period_start: Joi.alternatives().try(Joi.date(), Joi.string()),
  periodEnd: Joi.alternatives().try(Joi.date(), Joi.string()).required(), period_end: Joi.alternatives().try(Joi.date(), Joi.string()),
  paymentDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''), payment_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  defaultBonus: Joi.number().precision(2).min(0).default(0), default_bonus: Joi.number().precision(2).min(0),
  defaultDeduction: Joi.number().precision(2).min(0).default(0), default_deduction: Joi.number().precision(2).min(0),
  notes: Joi.string().trim().max(255).allow('', null)
}).custom((value, helpers) => {
  const periodStart = parseDate(value.periodStart ?? value.period_start);
  const periodEnd = parseDate(value.periodEnd ?? value.period_end);
  const paymentDate = parseDate(value.paymentDate ?? value.payment_date ?? new Date());
  if (!periodStart || !periodEnd || !paymentDate || periodStart > periodEnd) return helpers.error('date.base');
  return {
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
