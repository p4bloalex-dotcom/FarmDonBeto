import { AppDataSource } from '../../config/data-source.js';
import { createAccessToken } from '../../services/token.service.js';
import { createHashedPassword, verifyPassword } from '../../utils/password.js';
import { badRequest, ok, unauthorized } from '../../utils/api-response.js';
import { logger } from '../../utils/logger.js';
import { findRoleName, findUserById, findUserByName, updateLastLogin, updatePassword } from './auth.repository.js';

const buildUserResponse = async user => {
  const roleName = await findRoleName(user.idRole);

  return {
    id: user.id,
    userName: user.name,
    role: roleName,
    name: user.name
  };
};

export const login = async (req, res) => {
  const user = await findUserByName(req.body.userName);

  if (!user) {
    logger.warn({ userName: req.body.userName, reason: 'not_found' }, 'Login rejected');
    return unauthorized(res, 'Usuario o contrasena incorrecta.');
  }

  if (user.status !== 'E') {
    logger.warn({ userId: user.id, userName: user.name, status: user.status, reason: 'inactive' }, 'Login rejected');
    return unauthorized(res, 'Usuario o contrasena incorrecta.');
  }

  if (!verifyPassword(req.body.password, user.salt, user.password)) {
    logger.warn({ userId: user.id, userName: user.name, reason: 'password_mismatch' }, 'Login rejected');
    return unauthorized(res, 'Usuario o contrasena incorrecta.');
  }

  await AppDataSource.transaction(manager => updateLastLogin(manager, user.id));

  return ok(res, {
    Token: createAccessToken(user.id),
    HasChangePassword: Boolean(user.hasChangedPass),
    user: await buildUserResponse(user)
  });
};

export const signToken = async (req, res) => {
  const user = await findUserById(req.user.id);

  if (!user || user.status !== 'E') {
    return unauthorized(res);
  }

  await AppDataSource.transaction(manager => updateLastLogin(manager, user.id));

  return ok(res, {
    Token: createAccessToken(user.id),
    HasChangePassword: Boolean(user.hasChangedPass),
    user: await buildUserResponse(user)
  });
};

export const changePassword = async (req, res) => {
  const user = await findUserById(req.user.id);

  if (!user || !verifyPassword(req.body.currentPassword, user.salt, user.password)) {
    return badRequest(res, 'La contrasena actual no es correcta.');
  }

  const { password, salt } = createHashedPassword(req.body.newPassword);
  await AppDataSource.transaction(manager => updatePassword(manager, user.id, password, salt));

  return ok(res, null, 'Contrasena actualizada correctamente.');
};
