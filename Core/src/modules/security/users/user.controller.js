import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { sendUserCredentialsEmail } from '../../../services/mail.service.js';
import { logger } from '../../../utils/logger.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { createUser, deleteUser, listUsers, paginateUsers, resetUserPassword, updateUser } from './user.repository.js';

const isUniqueViolation = error => error.errorNum === 1;
const isForeignKeyViolation = error => error.errorNum === 2292;

export const addUser = async (req, res) => {
  try {
    const createdUser = await createUser(req.body);
    if (!createdUser) {
      return notFound(res, 'Personal o rol no encontrado.');
    }
    if (createdUser.deactivated) {
      return badRequest(res, 'El personal o rol esta desactivado.');
    }
    try {
      await sendUserCredentialsEmail({ to: createdUser.email, userName: createdUser.name, password: createdUser.generatedPassword });
    } catch (error) {
      logger.error({ err: error, userId: createdUser.idUser }, 'Failed to send user credentials email.');
    }
    return created(res, createdUser);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return conflict(res, 'El usuario ya existe.');
    }
    throw error;
  }
};

export const getUsers = async (_req, res) => ok(res, await listUsers());

export const getPagedUsers = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateUsers(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editUser = async (req, res) => {
  const updated = await updateUser(Number(req.params.id), req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const removeUser = async (req, res) => {
  try {
    const deleted = await deleteUser(Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};

export const resetPassword = async (req, res) => {
  const userId = Number(req.body?.id ?? req.body ?? 0);
  const result = await resetUserPassword(userId);
  if (result) {
    try {
      await sendUserCredentialsEmail({ to: result.email, userName: result.userName, password: result.generatedPassword, isReset: true });
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to send reset password email.');
    }
  }
  return result ? ok(res, result, 'Contrasena reseteada correctamente.') : notFound(res, 'Usuario no encontrado.');
};
