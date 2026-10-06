import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { geocode, reverse, route } from './geolocation.controller.js';
import { geocodeSchema, reverseGeocodeSchema, routeSchema } from './geolocation.validation.js';

export const geolocationRoutes = Router();

geolocationRoutes.use(authenticate);
geolocationRoutes.post('/geocode', validate(geocodeSchema), asyncHandler(geocode));
geolocationRoutes.post('/reverse', validate(reverseGeocodeSchema), asyncHandler(reverse));
geolocationRoutes.post('/route', validate(routeSchema), asyncHandler(route));
