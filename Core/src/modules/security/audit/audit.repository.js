import { AppDataSource } from '../../../config/data-source.js';

const parseJson = value => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toDto = item => ({
  id: item.id,
  tableName: item.tableName,
  entidad: item.tableName,
  action: item.action,
  accion: actionLabels[item.action] ?? item.action,
  permiso: item.recordId ? `Registro ${item.recordId}` : '-',
  descripcion: `${item.action} en ${item.tableName}`,
  recordId: item.recordId,
  userId: item.userId,
  idUser: item.userId,
  oldValues: parseJson(item.oldValues),
  newValues: parseJson(item.newValues),
  createdAt: item.createdAt,
  fecha: item.createdAt
});

const actionLabels = {
  INSERT: 'Creacion',
  UPDATE: 'Actualizacion',
  DELETE: 'Eliminacion'
};

const changes = (oldValues, newValues) => {
  const before = parseJson(oldValues) ?? {};
  const after = parseJson(newValues) ?? {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Array.from(keys).filter(key => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null)).map(key => ({
    campo: key,
    valorAnterior: before[key] == null ? '' : String(before[key]),
    valorNuevo: after[key] == null ? '' : String(after[key])
  }));
};

const toDetailDto = item => ({
  ...toDto(item),
  accion: actionLabels[item.action] ?? item.action,
  permiso: item.recordId ? `Registro ${item.recordId}` : '-',
  descripcion: `${item.action} en ${item.tableName}`,
  cambios: changes(item.oldValues, item.newValues)
});

export const listAuditLogs = async ({ offset, pageSize }) => {
  const [rows, total] = await buildAuditQuery({}).skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

const applyAuditFilters = (query, filters = {}) => {
  if (filters.tableName) query.andWhere('LOWER(item.tableName) LIKE :tableName', { tableName: `%${String(filters.tableName).toLowerCase()}%` });
  if (filters.action) query.andWhere('item.action = :action', { action: String(filters.action).toUpperCase() });
  if (filters.userId) query.andWhere('item.userId = :userId', { userId: Number(filters.userId) });
  if (filters.recordId) query.andWhere('item.recordId = :recordId', { recordId: String(filters.recordId) });
  if (filters.startDate) query.andWhere('item.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    query.andWhere('item.createdAt < :endDate', { endDate });
  }
  if (filters.branchId) {
    const branchNeedle = `"branchId":${Number(filters.branchId)}`;
    const branchSnakeNeedle = `"branch_id":${Number(filters.branchId)}`;
    query.andWhere('(DBMS_LOB.INSTR(item.oldValues, :branchNeedle) > 0 OR DBMS_LOB.INSTR(item.newValues, :branchNeedle) > 0 OR DBMS_LOB.INSTR(item.oldValues, :branchSnakeNeedle) > 0 OR DBMS_LOB.INSTR(item.newValues, :branchSnakeNeedle) > 0)', { branchNeedle, branchSnakeNeedle });
  }
  if (filters.search) {
    const search = `%${String(filters.search).toLowerCase()}%`;
    query.andWhere('(LOWER(item.tableName) LIKE :search OR LOWER(item.action) LIKE :search OR LOWER(item.recordId) LIKE :search)', { search });
  }
  return query;
};

const buildAuditQuery = filters => applyAuditFilters(AppDataSource.getRepository('AuditTrailLog').createQueryBuilder('item'), filters)
  .orderBy('item.createdAt', 'DESC')
  .addOrderBy('item.id', 'DESC');

export const searchAuditLogs = async ({ offset, pageSize }, filters = {}) => {
  const [rows, total] = await buildAuditQuery(filters).skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const exportAuditLogs = async filters => (await buildAuditQuery(filters).take(5000).getMany()).map(toDto);

export const findAuditLogById = async id => {
  const item = await AppDataSource.getRepository('AuditTrailLog').findOneBy({ id });
  return item ? toDetailDto(item) : null;
};
