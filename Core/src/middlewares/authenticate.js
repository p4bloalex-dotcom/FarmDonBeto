import { verifyAccessToken } from '../services/token.service.js';
import { unauthorized } from '../utils/api-response.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res);
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);

  if (!payload?.sub) {
    return unauthorized(res);
  }

  req.user = {
    id: Number(payload.sub),
    role: payload.role ?? null
  };

  return next();
};
