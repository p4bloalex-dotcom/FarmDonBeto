import { AppDataSource } from '../../../config/data-source.js';

const movements = () => AppDataSource.getRepository('CashMovement');

const toDto = item => ({
  id: item.id,
  cashSessionId: item.cashSessionId,
  cash_session_id: item.cashSessionId,
  sessionDate: item.cashSession?.openingDate ?? null,
  cashRegisterName: item.cashSession?.cashRegister?.name ?? null,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  movementTypeId: item.movementTypeId,
  movement_type_id: item.movementTypeId,
  movementTypeName: item.cashMovementType?.name ?? null,
  movementTypeOperation: item.cashMovementType?.operation ?? null,
  amount: Number(item.amount ?? 0),
  description: item.description ?? null,
  referenceId: item.referenceId ?? null,
  referenceType: item.referenceType ?? null,
  authorizedBy: item.authorizedBy ?? null,
  reversalOfId: item.reversalOfId ?? null,
  movementDate: item.movementDate,
  status: item.status
});

const queryBase = () => movements().createQueryBuilder('item')
  .leftJoin('item.cashSession', 'cashSession')
  .addSelect(['cashSession.id', 'cashSession.openingDate'])
  .leftJoin('cashSession.cashRegister', 'cashRegister')
  .addSelect('cashRegister.name')
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name'])
  .leftJoin('item.cashMovementType', 'cashMovementType')
  .addSelect(['cashMovementType.id', 'cashMovementType.name', 'cashMovementType.operation']);

export const findMovementById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const createMovement = async data => {
  const saved = await movements().save(movements().create(data));
  return findMovementById(saved.id);
};

export const updateMovement = async (id, data) => (await movements().update(id, data)).affected > 0;

export const reverseMovement = async (movement, userId = null) => {
  const movementTypeRepository = AppDataSource.getRepository('CashMovementType');
  const currentType = await movementTypeRepository.findOneBy({ id: movement.movementTypeId });
  const reverseOperation = currentType?.operation === 'I' ? 'E' : 'I';
  const reverseType = await movementTypeRepository.findOneBy({ code: 'REVERSAL', operation: reverseOperation, status: 'E' })
    ?? await movementTypeRepository.findOneBy({ operation: reverseOperation, status: 'E' });
  if (!reverseType) return null;
  return createMovement({
    cashSessionId: movement.cashSessionId,
    branchId: movement.branchId,
    movementTypeId: reverseType.id,
    amount: movement.amount,
    description: `Reverso de movimiento #${movement.id}`,
    referenceId: movement.id,
    referenceType: 'CASH_MOVEMENT_REVERSAL',
    reversalOfId: movement.id,
    movementDate: new Date(),
    status: 'E',
    createdBy: userId
  });
};

export const listMovementsBySession = async sessionId => {
  const rows = await queryBase().where('item.cashSessionId = :sessionId', { sessionId }).orderBy('item.movementDate', 'DESC').getMany();
  return rows.map(toDto);
};

export const paginateMovements = async ({ offset, pageSize }, sessionId = null) => {
  const query = queryBase().orderBy('item.movementDate', 'DESC').skip(offset).take(pageSize);
  if (sessionId) {
    query.where('item.cashSessionId = :sessionId', { sessionId });
  }
  const [rows, total] = await query.getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findActiveMovementType = async id => {
  const movementTypeRepository = AppDataSource.getRepository('CashMovementType');
  return movementTypeRepository.findOneBy({ id, status: 'E' });
};
