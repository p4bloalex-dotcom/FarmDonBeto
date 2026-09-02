import { logger } from '../utils/logger.js';
import { serverError } from '../utils/api-response.js';

export const errorHandler = (error, _req, res, _next) => {
  logger.error({ error }, 'Unhandled request error');
  return serverError(res);
};
