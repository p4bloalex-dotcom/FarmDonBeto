import { notFound } from '../utils/api-response.js';

export const notFoundHandler = (_req, res) => notFound(res, 'Ruta no encontrada.');
