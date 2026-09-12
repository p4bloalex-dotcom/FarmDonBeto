import { AppDataSource } from '../config/data-source.js';
import { verifyAccessToken } from '../services/token.service.js';
import { unauthorized } from '../utils/api-response.js';
import { runWithRequestContext } from '../utils/request-context.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res);
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);

  if (!payload?.sub) {
    return unauthorized(res);
  }

  const userId = Number(payload.sub);

  let user = null;
  let branchId = null;
  let companyId = null;

  try {
    user = await AppDataSource.getRepository('User').findOneBy({ id: userId });
    if (user?.idPersonal) {
      const employee = await AppDataSource.getRepository('Employee').findOneBy({ id: user.idPersonal });
      branchId = employee?.branchId ?? null;
    }
    companyId = user?.companyId ?? null;
  } catch (error) {
    return next(error);
  }

  req.user = { id: userId, role: user?.idRole ?? payload.role ?? null, branchId, companyId };

  return runWithRequestContext({ user: req.user }, () => next());
};
