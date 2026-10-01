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

const paymentSchema = Joi.object({
  method: Joi.string().trim().max(30).required(),
  amount: Joi.number().precision(2).min(0.01).required(),
  receivedAmount: Joi.number().precision(2).min(0).allow(null),
  received_amount: Joi.number().precision(2).min(0).allow(null),
  cardBrand: Joi.string().trim().max(30).allow(null, ''),
  card_brand: Joi.string().trim().max(30).allow(null, ''),
  cardLast4: Joi.string().trim().pattern(/^\d{4}$/).allow(null, ''),
  card_last4: Joi.string().trim().pattern(/^\d{4}$/).allow(null, ''),
  authorizationCode: Joi.string().trim().max(60).allow(null, ''),
  authorization_code: Joi.string().trim().max(60).allow(null, '')
}).custom(value => {
  const receivedAmount = value.receivedAmount ?? value.received_amount;
  return {
    method: value.method,
    amount: Number(value.amount),
    receivedAmount: receivedAmount == null ? null : Number(receivedAmount),
    cardBrand: value.cardBrand ?? value.card_brand ?? null,
    cardLast4: value.cardLast4 ?? value.card_last4 ?? null,
    authorizationCode: value.authorizationCode ?? value.authorization_code ?? null
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
  documentType: Joi.string().trim().max(20).default('RECEIPT'),
  taxId: Joi.string().trim().max(30).allow(null, ''),
  customerName: Joi.string().trim().max(120).allow(null, ''),
  customerPhone: Joi.string().trim().max(30).allow(null, ''),
  tax: Joi.number().precision(2).min(0),
  taxRate: Joi.number().precision(2).min(0).max(100),
  payments: Joi.array().items(paymentSchema).min(1),
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
    documentType: value.documentType,
    taxId: value.taxId || null,
    customerName: value.customerName || null,
    customerPhone: value.customerPhone || null,
    tax: value.tax,
    taxRate: value.taxRate ?? 0,
    payments: value.payments,
    details: value.details
  };
});
