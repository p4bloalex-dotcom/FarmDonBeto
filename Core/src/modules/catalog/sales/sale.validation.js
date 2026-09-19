import Joi from 'joi';

const detailSchema = Joi.object({
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  quantity: Joi.number().precision(3).min(0.001).required(),
  unitPrice: Joi.number().precision(2).min(0),
  unit_price: Joi.number().precision(2).min(0)
}).custom((value, helpers) => {
  const medicineId = value.medicineId ?? value.medicine_id;
  if (!medicineId) return helpers.error('any.required', { label: 'Medicamento' });
  const unitPrice = value.unitPrice ?? value.unit_price;
  return {
    medicineId,
    quantity: Number(value.quantity),
    unitPrice: unitPrice == null ? null : Number(unitPrice)
  };
});

export const saleSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  employeeId: Joi.number().integer(),
  employee_id: Joi.number().integer(),
  cashSessionId: Joi.number().integer(),
  cash_session_id: Joi.number().integer(),
  saleDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  paymentMethod: Joi.string().trim().max(30).required(),
  tax: Joi.number().precision(2).min(0),
  taxRate: Joi.number().precision(2).min(0).max(100),
  details: Joi.array().items(detailSchema).min(1).required()
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  const employeeId = value.employeeId ?? value.employee_id;
  const cashSessionId = value.cashSessionId ?? value.cash_session_id;
  if (!branchId || !employeeId || !cashSessionId) return helpers.error('any.required');
  const saleDate = value.saleDate ? new Date(value.saleDate) : new Date();
  if (isNaN(saleDate.getTime())) return helpers.error('date.base');

  return {
    branchId,
    employeeId,
    cashSessionId,
    saleDate,
    paymentMethod: value.paymentMethod,
    tax: value.tax,
    taxRate: value.taxRate ?? 0,
    details: value.details
  };
});
