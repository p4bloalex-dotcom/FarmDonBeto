import Joi from 'joi';

const round2 = value => Math.round(Number(value) * 100) / 100;

const parseDate = raw => {
  if (raw === null || raw === '' || raw === undefined) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

const detailSchema = Joi.object({
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  quantity: Joi.number().precision(3).min(0.001).required(),
  unitPrice: Joi.number().precision(2).min(0),
  unit_price: Joi.number().precision(2).min(0),
  lotNumber: Joi.string().trim().max(60).allow('', null),
  lot_number: Joi.string().trim().max(60).allow('', null),
  expirationDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null),
  expiration_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null)
}).custom((value, helpers) => {
  const medicineId = value.medicineId ?? value.medicine_id;
  const quantity = Number(value.quantity);
  const unitPrice = Number(value.unitPrice ?? value.unit_price ?? 0);
  const lotNumber = value.lotNumber ?? value.lot_number ?? null;
  const expirationRaw = value.expirationDate ?? value.expiration_date ?? null;
  const expirationDate = expirationRaw ? new Date(expirationRaw) : null;

  if (!medicineId) {
    return helpers.error('any.required', { label: 'Medicamento' });
  }

  if ((lotNumber && !expirationDate) || (!lotNumber && expirationDate)) {
    return helpers.error('any.custom', { message: 'Debe ingresar lote y vencimiento juntos.' });
  }
  if (expirationDate && isNaN(expirationDate.getTime())) return helpers.error('date.base');

  const subtotal = round2(quantity * unitPrice);
  return { medicineId, quantity, unitPrice, subtotal, lotNumber: lotNumber || null, expirationDate };
});

export const purchaseSchema = Joi.object({
  supplierId: Joi.number().integer(),
  supplier_id: Joi.number().integer(),
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  purchaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  invoiceNumber: Joi.string().trim().min(1).max(50).required(),
  tax: Joi.number().precision(2).min(0),
  taxRate: Joi.number().precision(2).min(0).max(100),
  tax_rate: Joi.number().precision(2).min(0).max(100),
  paymentSourceType: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION').default('CASH_SESSION'), payment_source_type: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION'),
  financialAccountId: Joi.number().integer().allow(null, ''), financial_account_id: Joi.number().integer().allow(null, ''),
  cashSessionId: Joi.number().integer().allow(null, ''), cash_session_id: Joi.number().integer().allow(null, ''),
  details: Joi.array().items(detailSchema).min(1).required(),
  status: Joi.string().valid('E', 'I').default('E')
}).custom((value, helpers) => {
  const supplierId = value.supplierId ?? value.supplier_id;
  const branchId = value.branchId ?? value.branch_id;
  const paymentSourceType = value.paymentSourceType ?? value.payment_source_type ?? 'CASH_SESSION';
  const financialAccountId = value.financialAccountId ?? value.financial_account_id ?? null;
  const cashSessionId = value.cashSessionId ?? value.cash_session_id ?? null;

  if (!supplierId || !branchId) {
    return helpers.error('any.required');
  }
  if (paymentSourceType !== 'CASH_SESSION' && !financialAccountId) return helpers.error('any.required');

  const purchaseDate = parseDate(value.purchaseDate);
  if (purchaseDate === undefined) {
    return helpers.error('date.base');
  }

  const details = value.details.map(detail => {
    const quantity = Number(detail.quantity);
    const unitPrice = Number(detail.unitPrice);
    return {
        medicineId: detail.medicineId,
        quantity,
        unitPrice,
        subtotal: round2(quantity * unitPrice),
        lotNumber: detail.lotNumber,
        expirationDate: detail.expirationDate
      };
  });

  const subtotal = round2(details.reduce((acc, detail) => acc + detail.subtotal, 0));
  const taxRate = Number(value.taxRate ?? value.tax_rate ?? 0);
  const tax = value.tax != null ? round2(value.tax) : round2(subtotal * (taxRate / 100));

  if (tax < 0) {
    return helpers.error('number.min', { label: 'Impuesto', limit: 0 });
  }
  if (tax > subtotal) {
    return helpers.error('any.custom', { message: 'El impuesto no puede ser mayor al subtotal.' });
  }

  return {
    supplierId,
    branchId,
    purchaseDate: purchaseDate ?? new Date(),
    invoiceNumber: value.invoiceNumber,
    subtotal,
    tax,
    total: round2(subtotal + tax),
    paymentSourceType,
    financialAccountId,
    cashSessionId,
    details,
    status: value.status ?? 'E'
  };
});

export const supplierInvoicePaymentSchema = Joi.object({
  paymentSourceType: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION').required(),
  payment_source_type: Joi.string().valid('BANK', 'CASH_FUND', 'CASH_SESSION'),
  financialAccountId: Joi.number().integer().allow(null, ''),
  financial_account_id: Joi.number().integer().allow(null, ''),
  cashSessionId: Joi.number().integer().allow(null, ''),
  cash_session_id: Joi.number().integer().allow(null, ''),
  paymentDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  payment_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  notes: Joi.string().trim().max(255).allow('', null)
}).custom((value, helpers) => {
  const paymentSourceType = value.paymentSourceType ?? value.payment_source_type;
  const financialAccountId = value.financialAccountId ?? value.financial_account_id ?? null;
  const cashSessionId = value.cashSessionId ?? value.cash_session_id ?? null;
  const paymentDate = parseDate(value.paymentDate ?? value.payment_date ?? new Date());
  if (!paymentSourceType) return helpers.error('any.required');
  if (paymentSourceType !== 'CASH_SESSION' && !financialAccountId) return helpers.error('any.required');
  if (paymentDate === undefined) return helpers.error('date.base');
  return { paymentSourceType, financialAccountId, cashSessionId, paymentDate: paymentDate ?? new Date(), notes: value.notes || null };
});
