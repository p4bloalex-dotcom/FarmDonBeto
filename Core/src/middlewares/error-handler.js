import { logger } from '../utils/logger.js';
import { conflict, serverError } from '../utils/api-response.js';
import { getForeignKeyConflictMessage, isForeignKeyViolation } from '../utils/database-errors.js';

export const errorHandler = (error, _req, res, _next) => {
  if (isForeignKeyViolation(error)) {
    return conflict(res, getForeignKeyConflictMessage(error));
  }

  logger.error({ error }, 'Unhandled request error');
  return serverError(res);
};
