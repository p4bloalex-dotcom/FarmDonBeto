import Joi from 'joi';

export const loginSchema = Joi.object({
  userName: Joi.string().trim().max(50).required(),
  password: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[0-9]/, 'number')
    .required()
});
