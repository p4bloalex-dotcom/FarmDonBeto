import { conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { changePersonalStatus, createPersonal, deletePersonal, listPersonals, paginatePersonals, updatePersonal } from './personal.repository.js';

const isUniqueViolation = error => error.errorNum === 1;
const isForeignKeyViolation = error => error.errorNum === 2292;

export const addPersonal = async (req, res) => {
  try {
    return created(res, await createPersonal(req.body));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return conflict(res, 'El registro ya existe.');
    }
    throw error;
  }
};

export const getPersonals = async (_req, res) => ok(res, await listPersonals());

export const getPagedPersonals = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginatePersonals(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editPersonal = async (req, res) => {
  try {
    const updated = await updatePersonal(Number(req.params.id), req.body);
    return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return conflict(res, 'El registro ya existe.');
    }
    throw error;
  }
};

export const updatePersonalStatus = async (req, res) => {
  const updated = await changePersonalStatus(Number(req.params.id), req.body.status);
  return updated ? ok(res, null, 'Estado actualizado correctamente.') : notFound(res);
};

export const removePersonal = async (req, res) => {
  try {
    const c = await deletePersonal(Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};
