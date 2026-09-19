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
  const quantity = Number(value.quantity);
  const unitCost = Number(value.unitCost ?? value.unit_cost ?? 0);

  if (!medicineId) {
    return helpers.error('any.required', { label: 'Medicamento' });
  }

  return { medicineId, quantity, unitCost };
});

export const stockTransferSchema = Joi.object({
  branchOriginId: Joi.number().integer(),
  branch_origin_id: Joi.number().integer(),
  branchDestinationId: Joi.number().integer(),
  branch_destination_id: Joi.number().integer(),
  movementDate: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null, ''),
  description: Joi.string().trim().max(255).allow('', null),
  details: Joi.array().items(detailSchema).min(1).required(),
  status: Joi.string().valid('E', 'I').default('E')
}).custom((value, helpers) => {
  const branchOriginId = value.branchOriginId ?? value.branch_origin_id;
  const branchDestinationId = value.branchDestinationId ?? value.branch_destination_id;

  if (!branchOriginId || !branchDestinationId) {
    return helpers.error('any.required');
  }

  if (branchOriginId === branchDestinationId) {
    return helpers.error('any.custom', { message: 'La sucursal de origen y destino deben ser diferentes.' });
  }

  const movementDate = parseDate(value.movementDate);
  if (movementDate === undefined) {
    return helpers.error('date.base');
  }

  const details = value.details.map(detail => ({
    medicineId: detail.medicineId,
    quantity: Number(detail.quantity),
    unitCost: Number(detail.unitCost ?? 0)
  }));

  return {
    branchOriginId,
    branchDestinationId,
    movementDate: movementDate ?? new Date(),
    description: value.description ? String(value.description).trim() : null,
    details,
    status: value.status ?? 'E'
  };
});