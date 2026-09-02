import Joi from 'joi';

export const loginSchema = Joi.object({
  userName: Joi.string().max(50).required(),
  password: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required()
});
