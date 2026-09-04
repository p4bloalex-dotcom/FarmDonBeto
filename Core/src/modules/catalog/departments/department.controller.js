import { ok } from '../../../utils/api-response.js';
import { listDepartments } from './department.repository.js';

export const getDepartments = async (_req, res) => ok(res, await listDepartments());
