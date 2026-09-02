import { ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { listAuditLogs } from './audit.repository.js';

export const getAuditLogs = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await listAuditLogs(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};
