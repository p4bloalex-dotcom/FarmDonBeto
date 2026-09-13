import Joi from 'joi';

export const cashRegisterSchema = Joi.object({
  branchId: Joi.number().integer(),
  branch_id: Joi.number().integer(),
  name: Joi.string().max(150).required(),
  code: Joi.string().max(30).required(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const branchId = value.branchId ?? value.branch_id;

  if (!branchId) {
    return helpers.error('any.required');
  }

  return {
    branchId,
    name: value.name,
    code: value.code,
    status: value.status ?? 'E'
  };
});

export const cashRegisterStatusSchema = Joi.object({
  status: Joi.string().valid('E', 'D', 'I').required()
}).unknown(true);