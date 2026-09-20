import Joi from 'joi';

export const inventoryUpdateSchema = Joi.object({
  reserve: Joi.number().precision(2).min(0),
  stockMin: Joi.number().precision(2).min(0),
  stock_min: Joi.number().precision(2).min(0),
  stockMax: Joi.number().precision(2).min(0),
  stock_max: Joi.number().precision(2).min(0)
}).custom((value, helpers) => {
  const stockMin = value.stockMin ?? value.stock_min;
  const stockMax = value.stockMax ?? value.stock_max;
  if (stockMin != null && stockMax != null && Number(stockMax) > 0 && Number(stockMin) > Number(stockMax)) {
    return helpers.error('any.custom', { message: 'El stock minimo no puede ser mayor al maximo.' });
  }
  return {
    reserve: value.reserve != null ? Number(value.reserve) : undefined,
    stockMin: stockMin != null ? Number(stockMin) : undefined,
    stockMax: stockMax != null ? Number(stockMax) : undefined
  };
});

export const inventoryAdjustmentSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  quantityAfter: Joi.number().precision(2).min(0),
  quantity_after: Joi.number().precision(2).min(0),
  reason: Joi.string().trim().min(5).max(255).required()
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  const medicineId = value.medicineId ?? value.medicine_id;
  const quantityAfter = value.quantityAfter ?? value.quantity_after;
  if (!branchId || !medicineId || quantityAfter === undefined) return helpers.error('any.required');
  return { branchId, medicineId, quantityAfter: Number(quantityAfter), reason: value.reason };
});

export const inventoryLotSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  medicineId: Joi.number().integer(),
  medicine_id: Joi.number().integer(),
  lotNumber: Joi.string().trim().min(1).max(60),
  lot_number: Joi.string().trim().min(1).max(60),
  expirationDate: Joi.alternatives().try(Joi.date(), Joi.string()),
  expiration_date: Joi.alternatives().try(Joi.date(), Joi.string()),
  quantity: Joi.number().precision(2).min(0).required()
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;
  const medicineId = value.medicineId ?? value.medicine_id;
  const lotNumber = value.lotNumber ?? value.lot_number;
  const expirationDate = new Date(value.expirationDate ?? value.expiration_date);
  if (!branchId || !medicineId || !lotNumber || isNaN(expirationDate.getTime())) return helpers.error('any.required');
  return { branchId, medicineId, lotNumber, expirationDate, quantity: Number(value.quantity) };
});
