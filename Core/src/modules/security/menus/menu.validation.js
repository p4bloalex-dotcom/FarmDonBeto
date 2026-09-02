import Joi from 'joi';

export const menuSchema = Joi.object({
  name: Joi.string().max(50).required(),
  icon: Joi.string().max(20).required(),
  path: Joi.string().required(),
  idMenuFather: Joi.number().integer().allow(null),
  order: Joi.number().integer().default(0),
  status: Joi.string().valid('E', 'D', 'I').default('E')
});

export const changeMenuStatusSchema = Joi.object({
  status: Joi.string().valid('E', 'D', 'I').required()
});
