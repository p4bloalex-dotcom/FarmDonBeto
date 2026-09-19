import Joi from 'joi';

const parseDate = raw => {
  if (raw === null || raw === '' || raw === undefined) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

const detailSchema = Joi.object({
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  quantity: Joi.number().precision(3).min(0.001).required(),
  unitCost: Joi.number().precision(2).min(0),
  unit_cost: Joi.number().precision(2).min(0)
}).custom((value, helpers) => {
  const medicineId = value.medicineId ?? value.medicine_id;
  if (!medicineId) return helpers.error('any.required', { label: 'Medicamento' });
  return {
    medicineId,
    quantity: Number(value.quantity),
    unitCost: Number(value.unitCost ?? value.unit_cost ?? 0)
  };
});

export const deliveryRequestSchema = Joi.object({
  requestingBranchId: Joi.number().integer(),
  requesting_branch_id: Joi.number().integer(),
  fulfillmentBranchId: Joi.number().integer(),
  fulfillment_branch_id: Joi.number().integer(),
  customerName: Joi.string().trim().max(120).allow('', null),
  customer_name: Joi.string().trim().max(120).allow('', null),
  customerContact: Joi.string().trim().max(80).allow('', null),
  customer_contact: Joi.string().trim().max(80).allow('', null),
  requestedAt: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  requested_at: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  neededAt: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  needed_at: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  notes: Joi.string().trim().max(255).allow('', null),
  details: Joi.array().items(detailSchema).min(1).required(),
  status: Joi.string().valid('P', 'A', 'R', 'S', 'D', 'C').default('P')
}).custom((value, helpers) => {
  const requestingBranchId = value.requestingBranchId ?? value.requesting_branch_id;
  const fulfillmentBranchId = value.fulfillmentBranchId ?? value.fulfillment_branch_id;
  if (!requestingBranchId || !fulfillmentBranchId) return helpers.error('any.required');
  if (requestingBranchId === fulfillmentBranchId) return helpers.error('any.custom', { message: 'Las sucursales deben ser diferentes.' });

  const requestedAt = parseDate(value.requestedAt ?? value.requested_at);
  const neededAt = parseDate(value.neededAt ?? value.needed_at);
  if (requestedAt === undefined || neededAt === undefined) return helpers.error('date.base');

  return {
    requestingBranchId,
    fulfillmentBranchId,
    customerName: value.customerName ?? value.customer_name ?? null,
    customerContact: value.customerContact ?? value.customer_contact ?? null,
    requestedAt: requestedAt ?? new Date(),
    neededAt,
    notes: value.notes ? String(value.notes).trim() : null,
    details: value.details,
    status: value.status ?? 'P'
  };
});

export const deliveryRequestStatusSchema = Joi.object({
  status: Joi.string().valid('A', 'R', 'S', 'D', 'C').required()
}).unknown(true);
