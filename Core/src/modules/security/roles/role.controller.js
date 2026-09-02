import { conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { createRole, deleteRole, getRolePermissions, listRoles, paginateRoles, updateRole } from './role.repository.js';

export const addRole = async (req, res) => created(res, await createRole(req.body));

export const getRoles = async (_req, res) => ok(res, await listRoles());

export const getPagedRoles = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateRoles(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editRole = async (req, res) => {
  const updated = await updateRole(Number(req.params.id), req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const removeRole = async (req, res) => {
  try {
    const deleted = await deleteRole(Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (error.errorNum === 2292) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};

export const findRole = async (req, res) => ok(res, await getRolePermissions(Number(req.params.id)));
