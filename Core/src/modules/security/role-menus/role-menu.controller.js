import { conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { createRoleMenu, deleteRoleMenu, paginateRoleMenus, updateRoleMenu } from './role-menu.repository.js';

const isUniqueViolation = error => error.errorNum === 1;
const isForeignKeyViolation = error => error.errorNum === 2291 || error.errorNum === 2292;

export const addRoleMenu = async (req, res) => {
  try {
    return created(res, await createRoleMenu(req.body));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return conflict(res, 'El menu ya esta asignado al rol.');
    }
    throw error;
  }
};

export const getPagedRoleMenus = async (req, res) => {
  const pagination = getPagination(req.query);
  const idRole = Number(req.query.idData ?? req.query.IdData ?? 0) || null;
  const { rows, total } = await paginateRoleMenus(pagination, idRole);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editRoleMenu = async (req, res) => {
  try {
    const updated = await updateRoleMenu(Number(req.params.id), req.body);
    return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return conflict(res, 'El menu ya esta asignado al rol.');
    }
    throw error;
  }
};

export const removeRoleMenu = async (req, res) => {
  try {
    const deleted = await deleteRoleMenu(Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};
