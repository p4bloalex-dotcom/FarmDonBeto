import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getForeignKeyConflictMessage, isForeignKeyViolation } from '../../../utils/database-errors.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import {
  changeRegisterStatus,
  createRegister,
  deleteRegister,
  findActiveBranch,
  findOpenSessionByRegister,
  findRegisterByBranchAndName,
  findRegisterByCode,
  findRegisterWithBranch,
  listRegisters,
  paginateRegisters,
  updateRegister
} from './cash-register.repository.js';

export const addRegister = async (req, res) => {
  const { branchId, name, code } = req.body;

  if (!(await findActiveBranch(branchId))) {
    return badRequest(res, 'La sucursal seleccionada no existe o esta inactiva.');
  }
  if (await findRegisterByBranchAndName(branchId, name)) {
    return conflict(res, 'Ya existe una caja con ese nombre en la sucursal.');
  }
  if (await findRegisterByCode(code)) {
    return conflict(res, 'Ya existe una caja con ese codigo.');
  }

  return created(res, await createRegister(req.body));
};

export const getRegisters = async (_req, res) => ok(res, await listRegisters());

export const getPagedRegisters = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateRegisters(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const editRegister = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findRegisterWithBranch(id);
  if (!existing) {
    return notFound(res);
  }

  const { branchId, name, code } = req.body;
  if (!(await findActiveBranch(branchId))) {
    return badRequest(res, 'La sucursal seleccionada no existe o esta inactiva.');
  }
  const duplicateName = await findRegisterByBranchAndName(branchId, name, id);
  if (duplicateName) {
    return conflict(res, 'Ya existe una caja con ese nombre en la sucursal.');
  }
  const duplicateCode = await findRegisterByCode(code, id);
  if (duplicateCode) {
    return conflict(res, 'Ya existe una caja con ese codigo.');
  }

  const updated = await updateRegister(id, req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const updateRegisterStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (status === 'D' || status === 'I') {
    const openSession = await findOpenSessionByRegister(id);
    if (openSession) {
      return conflict(res, 'No se puede desactivar una caja con una sesion abierta.');
    }
  }

  const updated = await changeRegisterStatus(id, status);
  return updated ? ok(res, null, 'Estado actualizado correctamente.') : notFound(res);
};

export const removeRegister = async (req, res) => {
  const id = Number(req.params.id);
  const openSession = await findOpenSessionByRegister(id);
  if (openSession) {
    return conflict(res, 'No se puede eliminar una caja con una sesion abierta.');
  }

  try {
    const deleted = await deleteRegister(id);
    return deleted ? ok(res, null, 'Registro eliminado correctamente.') : notFound(res);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return conflict(res, getForeignKeyConflictMessage(error));
    }
    throw error;
  }
};
