import Joi from 'joi';

export const companySchema = Joi.object({
  name: Joi.string().max(100).required(),
  phone: Joi.string().max(20).required(),
  idDepartment: Joi.number().integer(),
  id_department: Joi.number().integer(),
  idMunicipality: Joi.number().integer(),
  id_municipality: Joi.number().integer(),
  address: Joi.string().max(100).allow(null, ''),
  email: Joi.string().email().max(40).required(),
  logo: Joi.string().required(),
  status: Joi.string().valid('E', 'D', 'I').default('E')
}).custom((value, helpers) => {
  const idDepartment = value.idDepartment ?? value.id_department;
  const idMunicipality = value.idMunicipality ?? value.id_municipality;

  if (!idDepartment || !idMunicipality) {
    return helpers.error('any.required');
  }

  return {
    name: value.name,
    phone: value.phone,
    idDepartment,
    idMunicipality,
    address: value.address || null,
    email: value.email,
    logo: value.logo,
    status: value.status ?? 'E'
  };
});
