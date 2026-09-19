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
