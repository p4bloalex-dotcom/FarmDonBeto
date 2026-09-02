import { AppDataSource } from '../../../config/data-source.js';

export const listAuditLogs = async ({ offset, pageSize }) => {
  const [rows, total] = await AppDataSource.getRepository('AuditTrailLog').findAndCount({
    order: { createdAt: 'DESC', id: 'DESC' },
    skip: offset,
    take: pageSize
  });
  return { rows, total };
};
