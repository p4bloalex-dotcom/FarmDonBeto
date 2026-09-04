import Joi from 'joi';

export const userSchema = Joi.object({
  idPersonal: Joi.number().integer().required(),
  idRole: Joi.number().integer().required(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
});

export const userEditSchema = Joi.object({
  idPersonal: Joi.number().integer(),
  idRole: Joi.number().integer().required(),
  status: Joi.string().valid('E', 'D', 'I').required()
});
