import { env } from '../config/env.js';

export class GeolocationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GeolocationError';
    this.business = true;
  }
}

const ensureOpenRouteEnabled = () => {
  if (env.geocoding.provider !== 'OPENROUTE') throw new GeolocationError('La geolocalizacion esta deshabilitada.');
  if (!env.geocoding.openRouteApiKey) throw new GeolocationError('Configure OPENROUTE_API_KEY en el archivo .env para usar geolocalizacion.');
};

const requestOpenRoute = async (path, params) => {
  ensureOpenRouteEnabled();
  const url = new URL(`${env.geocoding.openRouteBaseUrl}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const response = await fetch(url, { headers: { Authorization: env.geocoding.openRouteApiKey, Accept: 'application/json' } });
  if (!response.ok) throw new GeolocationError(`OpenRouteService no pudo procesar la solicitud (${response.status}).`);
  return response.json();
};

export const geocodeAddress = async ({ address, country = 'Guatemala', limit = 5 }) => {
  const text = [address, country].filter(Boolean).join(', ');
  if (!String(address ?? '').trim()) throw new GeolocationError('Ingrese una direccion para geolocalizar.');
  const data = await requestOpenRoute('/geocode/search', { text, 'boundary.country': 'GT', size: Math.min(Number(limit || 5), 10) });
  return (data.features ?? []).map(feature => {
    const [longitude, latitude] = feature.geometry?.coordinates ?? [];
    return {
      label: feature.properties?.label ?? text,
      name: feature.properties?.name ?? null,
      locality: feature.properties?.locality ?? feature.properties?.county ?? null,
      region: feature.properties?.region ?? null,
      latitude: latitude == null ? null : Number(latitude),
      longitude: longitude == null ? null : Number(longitude),
      confidence: feature.properties?.confidence ?? null
    };
  }).filter(item => item.latitude != null && item.longitude != null);
};

export const reverseGeocode = async ({ latitude, longitude }) => {
  if ([latitude, longitude].some(value => value === null || value === undefined || Number.isNaN(Number(value)))) {
    throw new GeolocationError('Debe indicar coordenadas validas para normalizar direccion.');
  }
  const data = await requestOpenRoute('/geocode/reverse', {
    'point.lat': Number(latitude),
    'point.lon': Number(longitude),
    'boundary.country': 'GT',
    size: 1
  });
  const feature = data.features?.[0];
  if (!feature) throw new GeolocationError('No se encontro una direccion para las coordenadas indicadas.');
  const [featureLongitude, featureLatitude] = feature.geometry?.coordinates ?? [longitude, latitude];
  return {
    label: feature.properties?.label ?? null,
    name: feature.properties?.name ?? null,
    street: feature.properties?.street ?? null,
    locality: feature.properties?.locality ?? feature.properties?.county ?? null,
    county: feature.properties?.county ?? null,
    region: feature.properties?.region ?? null,
    country: feature.properties?.country ?? 'Guatemala',
    latitude: featureLatitude == null ? Number(latitude) : Number(featureLatitude),
    longitude: featureLongitude == null ? Number(longitude) : Number(featureLongitude),
    confidence: feature.properties?.confidence ?? null
  };
};

export const calculateDrivingRoute = async ({ fromLatitude, fromLongitude, toLatitude, toLongitude }) => {
  if ([fromLatitude, fromLongitude, toLatitude, toLongitude].some(value => value === null || value === undefined || Number.isNaN(Number(value)))) {
    throw new GeolocationError('Debe indicar coordenadas validas para calcular ruta.');
  }
  const data = await requestOpenRoute('/v2/directions/driving-car', {
    start: `${Number(fromLongitude)},${Number(fromLatitude)}`,
    end: `${Number(toLongitude)},${Number(toLatitude)}`
  });
  const summary = data.features?.[0]?.properties?.summary;
  if (!summary) throw new GeolocationError('No se encontro una ruta disponible.');
  return {
    distanceKm: Math.round((Number(summary.distance ?? 0) / 1000) * 100) / 100,
    durationMinutes: Math.max(1, Math.ceil(Number(summary.duration ?? 0) / 60))
  };
};
