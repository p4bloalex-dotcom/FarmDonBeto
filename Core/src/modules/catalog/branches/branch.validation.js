import Joi from 'joi';

export const branchSchema = Joi.object({
  name: Joi.string().max(100).required(),
  phone: Joi.string().max(20).allow(null, ''),
  email: Joi.string().email().max(120).allow(null, ''),
  address: Joi.string().max(150).allow(null, ''),
  idDepartment: Joi.number().integer().allow(null),
  id_department: Joi.number().integer().allow(null),
  idMunicipality: Joi.number().integer().allow(null),
  id_municipality: Joi.number().integer().allow(null),
  companyId: Joi.number().integer().allow(null),
  company_id: Joi.number().integer().allow(null),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom(value => ({
  name: value.name,
  phone: value.phone || null,
  email: value.email || null,
  address: value.address || null,
  idDepartment: value.idDepartment ?? value.id_department ?? null,
  idMunicipality: value.idMunicipality ?? value.id_municipality ?? null,
  companyId: value.companyId ?? value.company_id ?? null,
  status: value.status ?? 'E'
}));

export const branchStatusSchema = Joi.object({ status: Joi.string().valid('E', 'D', 'I').required() }).unknown(true);
