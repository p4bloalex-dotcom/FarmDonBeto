import { conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { changeStatus, createItem, deleteItem, listItems, paginateItems, updateItem } from './catalog-crud.repository.js';

const isForeignKeyViolation = error => error.errorNum === 2292;

export const addItem = entityName => async (req, res) => created(res, await createItem(entityName, req.body));

export const getItems = entityName => async (_req, res) => ok(res, await listItems(entityName));

export const getPagedItems = entityName => async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateItems(entityName, pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editItem = entityName => async (req, res) => {
  const updated = await updateItem(entityName, Number(req.params.id), req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const updateItemStatus = entityName => async (req, res) => {
  const updated = await changeStatus(entityName, Number(req.params.id), req.body.status);
  return updated ? ok(res, null, 'Estado actualizado correctamente.') : notFound(res);
};

export const removeItem = entityName => async (req, res) => {
  try {
    const deleted = await deleteItem(entityName, Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};
