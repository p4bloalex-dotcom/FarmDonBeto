import { conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { changeBranchStatus, createBranch, deleteBranch, listBranches, paginateBranches, updateBranch } from './branch.repository.js';

const isForeignKeyViolation = error => error.errorNum === 2292;

export const addBranch = async (req, res) => created(res, await createBranch(req.body));
export const getBranches = async (_req, res) => ok(res, await listBranches());

export const getPagedBranches = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateBranches(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editBranch = async (req, res) => {
  const updated = await updateBranch(Number(req.params.id), req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const updateBranchStatus = async (req, res) => {
  const updated = await changeBranchStatus(Number(req.params.id), req.body.status);
  return updated ? ok(res, null, 'Estado actualizado correctamente.') : notFound(res);
};

export const removeBranch = async (req, res) => {
  try {
    const deleted = await deleteBranch(Number(req.params.id));
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, 'El registro tiene relaciones activas.');
    }
    throw error;
  }
};
