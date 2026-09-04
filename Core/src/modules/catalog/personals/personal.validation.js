import Joi from 'joi';

export const personalSchema = Joi.object({
  firstName: Joi.string().max(100),
  first_name: Joi.string().max(100),
  middleName: Joi.string().max(100).allow(null, ''),
  middle_name: Joi.string().max(100).allow(null, ''),
  otherNames: Joi.string().max(100).allow(null, ''),
  other_names: Joi.string().max(100).allow(null, ''),
  lastName: Joi.string().max(100),
  last_name: Joi.string().max(100),
  secondLastname: Joi.string().max(100).allow(null, ''),
  second_lastname: Joi.string().max(100).allow(null, ''),
  phone: Joi.string().max(20).required(),
  gender: Joi.string().max(1).required(),
  email: Joi.string().email().max(120).required(),
  status: Joi.string().valid('E', 'D', 'I').default('E'),
  companyId: Joi.number().integer().allow(null),
  company_id: Joi.number().integer().allow(null),
  branchId: Joi.number().integer().allow(null),
  branch_id: Joi.number().integer().allow(null)
}).custom((value, helpers) => {
  const firstName = value.firstName ?? value.first_name;
  const lastName = value.lastName ?? value.last_name;
  const companyId = value.companyId ?? value.company_id;
  const branchId = value.branchId ?? value.branch_id;

  if (!firstName || !lastName) {
    return helpers.error('any.required');
  }

  return {
    firstName,
    middleName: value.middleName ?? value.middle_name ?? null,
    otherNames: value.otherNames ?? value.other_names ?? null,
    lastName,
    secondLastname: value.secondLastname ?? value.second_lastname ?? null,
    phone: value.phone,
    gender: value.gender,
    email: value.email,
    status: value.status ?? 'E',
    companyId: companyId ?? null,
    branchId: branchId ?? null
  };
});

export const personalStatusSchema = Joi.object({
  status: Joi.string().valid('E', 'D', 'I').required()
}).unknown(true);
