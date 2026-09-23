import { notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { exportAuditLogs, findAuditLogById, searchAuditLogs } from './audit.repository.js';

export const getAuditLogs = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await searchAuditLogs(pagination, req.query);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const exportAudit = async (req, res) => {
  const rows = await exportAuditLogs(req.query);
  const headers = ['id', 'fecha', 'usuario', 'tabla', 'accion', 'registro'];
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map(row => [row.id, row.createdAt?.toISOString?.() ?? row.createdAt, row.userId, row.tableName, row.action, row.recordId].map(escape).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="auditoria.csv"');
  return res.send(csv);
};

export const getAuditLog = async (req, res) => {
  const item = await findAuditLogById(Number(req.params.id));
  return item ? ok(res, item) : notFound(res);
};
