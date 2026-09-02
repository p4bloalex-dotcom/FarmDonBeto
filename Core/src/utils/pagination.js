import { env } from '../config/env.js';

export const getPagination = query => {
  const pageIndex = Math.max(Number(query.pageIndex ?? query.PageIndex ?? 1), 1);
  const requestedSize = Number(query.pageSize ?? query.PageSize ?? env.pagination.defaultPageSize);
  const pageSize = Math.min(Math.max(requestedSize, 1), env.pagination.maxPageSize);
  const offset = (pageIndex - 1) * pageSize;

  return { pageIndex, pageSize, offset };
};

export const paginationMeta = ({ pageIndex, pageSize, total }) => ({
  pageIndex,
  pageSize,
  totalCount: total,
  totalPages: Math.ceil(total / pageSize),
  hasPreviousPage: pageIndex > 1,
  hasNextPage: pageIndex * pageSize < total
});
