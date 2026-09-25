import { AppDataSource } from '../../../config/data-source.js';

const sessions = () => AppDataSource.getRepository('CashSession');

const toDto = item => ({
  id: item.id,
  cashRegisterId: item.cashRegisterId,
  cash_register_id: item.cashRegisterId,
  cashRegisterName: item.cashRegister?.name ?? null,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  openingDate: item.openingDate,
  closingDate: item.closingDate,
  openingAmount: Number(item.openingAmount ?? 0),
  closingAmount: item.closingAmount == null ? null : Number(item.closingAmount),
  expectedAmount: item.expectedAmount == null ? null : Number(item.expectedAmount),
  differenceAmount: item.differenceAmount == null ? null : Number(item.differenceAmount),
  countedBreakdown: item.countedBreakdown ? JSON.parse(item.countedBreakdown) : null,
  differenceExplanation: item.differenceExplanation ?? null,
  authorizedBy: item.authorizedBy ?? null,
  status: item.status
});

const queryBase = () => sessions().createQueryBuilder('item')
  .leftJoin('item.cashRegister', 'cashRegister')
  .addSelect(['cashRegister.id', 'cashRegister.name'])
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name']);

export const findSessionById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const findOpenSessionByRegister = async registerId => sessions().findOneBy({ cashRegisterId: registerId, status: 'A' });

export const createSession = async data => {
  const saved = await sessions().save(sessions().create(data));
  return findSessionById(saved.id);
};

export const updateSession = async (id, data) => (await sessions().update(id, data)).affected > 0;

export const deleteSession = async id => (await sessions().delete(id)).affected > 0;

export const listSessions = async (status = null) => {
  const query = queryBase().orderBy('item.id', 'DESC');
  if (status) {
    query.where('item.status = :status', { status });
  }
  return (await query.getMany()).map(toDto);
};

export const paginateSessions = async ({ offset, pageSize }, status = null) => {
  const query = queryBase().orderBy('item.id', 'DESC').skip(offset).take(pageSize);
  if (status) {
    query.where('item.status = :status', { status });
  }
  const [rows, total] = await query.getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const countMovementsBySession = async sessionId => {
  const movementRepository = AppDataSource.getRepository('CashMovement');
  return movementRepository.countBy({ cashSessionId: sessionId });
};

export const sessionBalance = async sessionId => {
  const movementRepository = AppDataSource.getRepository('CashMovement');
  const raw = await movementRepository.createQueryBuilder('m')
    .leftJoin('m.cashMovementType', 't')
    .select('COALESCE(SUM(CASE WHEN t.operation = :income THEN m.amount ELSE 0 END), 0)', 'income')
    .addSelect('COALESCE(SUM(CASE WHEN t.operation = :expense THEN m.amount ELSE 0 END), 0)', 'expense')
    .where('m.cashSessionId = :sessionId', { sessionId })
    .andWhere('m.status = :status', { status: 'E' })
    .setParameters({ income: 'I', expense: 'E' })
    .getRawOne();

  return {
    income: Number(raw?.income ?? 0),
    expense: Number(raw?.expense ?? 0)
  };
};
