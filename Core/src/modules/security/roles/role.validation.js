import Joi from 'joi';

export const roleSchema = Joi.object({
  name: Joi.string().max(40).required(),
  status: Joi.string().valid('E', 'D').default('E')
});
