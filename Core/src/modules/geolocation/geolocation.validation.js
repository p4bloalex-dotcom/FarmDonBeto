import Joi from 'joi';

export const geocodeSchema = Joi.object({
  address: Joi.string().trim().min(5).max(255).required(),
  country: Joi.string().trim().max(80).allow('', null).default('Guatemala')
});

export const routeSchema = Joi.object({
  fromLatitude: Joi.number().min(-90).max(90).required(),
  fromLongitude: Joi.number().min(-180).max(180).required(),
  toLatitude: Joi.number().min(-90).max(90).required(),
  toLongitude: Joi.number().min(-180).max(180).required()
});

export const reverseGeocodeSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});
