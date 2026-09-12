import Joi from 'joi';

export const updateRolePermissionSchema = Joi.object({
  roleId: Joi.number().integer().required(),
  permissionId: Joi.number().integer().required(),
  isCheck: Joi.boolean().required(),
  isGlobal: Joi.boolean().default(false)
});
