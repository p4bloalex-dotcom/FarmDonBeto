import { badRequest, ok } from '../../utils/api-response.js';
import { calculateDrivingRoute, geocodeAddress, GeolocationError, reverseGeocode } from '../../services/geolocation.service.js';

const handleGeolocation = (res, error) => error instanceof GeolocationError ? badRequest(res, error.message) : Promise.reject(error);

export const geocode = async (req, res) => {
  try {
    return ok(res, await geocodeAddress(req.body));
  } catch (error) {
    return handleGeolocation(res, error);
  }
};

export const route = async (req, res) => {
  try {
    return ok(res, await calculateDrivingRoute(req.body));
  } catch (error) {
    return handleGeolocation(res, error);
  }
};

export const reverse = async (req, res) => {
  try {
    return ok(res, await reverseGeocode(req.body));
  } catch (error) {
    return handleGeolocation(res, error);
  }
};
