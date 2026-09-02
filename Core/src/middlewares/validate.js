import { badRequest } from '../utils/api-response.js';

export const validate = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return badRequest(res, 'Modelo invalido.', error.details.map(item => item.message));
  }

  req.body = value;
  return next();
};
