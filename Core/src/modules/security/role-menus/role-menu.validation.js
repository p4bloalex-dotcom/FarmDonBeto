import Joi from 'joi';

export const roleMenuSchema = Joi.object({
  idRole: Joi.number().integer(),
  id_role: Joi.number().integer(),
  idMenu: Joi.number().integer(),
  id_menu: Joi.number().integer(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const idRole = value.idRole ?? value.id_role;
  const idMenu = value.idMenu ?? value.id_menu;

  if (!idRole || !idMenu) {
    return helpers.error('any.required');
  }

  return { idRole, idMenu, status: value.status ?? 'E' };
});
