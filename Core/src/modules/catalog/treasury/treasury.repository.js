import { AppDataSource } from '../../../config/data-source.js';

export class BusinessRuleError extends Error {}

const accountDto = item => ({
  id: item.id ?? item.ID,
  name: item.name ?? item.NAME,
  type: item.type ?? item.TYPE,
  accountNumber: item.accountNumber ?? item.ACCOUNTNUMBER ?? item.ACCOUNT_NUMBER ?? null,
  openingBalance: Number(item.openingBalance ?? item.OPENINGBALANCE ?? item.OPENING_BALANCE ?? 0),
  balance: Number(item.balance ?? item.BALANCE ?? item.openingBalance ?? item.OPENINGBALANCE ?? item.OPENING_BALANCE ?? 0),
  status: item.status ?? item.STATUS
});

const movementDto = item => ({
  id: item.id,
  financialAccountId: item.financialAccountId,
  financialAccountName: item.account?.name ?? null,
  cashSessionId: item.cashSessionId,
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  sourceType: item.sourceType,
  operation: item.operation,
  amount: Number(item.amount ?? 0),
  description: item.description,
  referenceType: item.referenceType,
  referenceId: item.referenceId,
  reversalOfId: item.reversalOfId,
  reconciledAt: item.reconciledAt,
  reconciliationNote: item.reconciliationNote,
  movementDate: item.movementDate,
  status: item.status
});

export const listAccounts = async () => {
  const rows = await AppDataSource.getRepository('FinancialAccount').createQueryBuilder('account')
    .leftJoin('account.movements', 'movement', 'movement.status = :active', { active: 'E' })
    .select(['account.id AS id', 'account.name AS name', 'account.type AS type', 'account.accountNumber AS accountNumber', 'account.openingBalance AS openingBalance', 'account.status AS status'])
    .addSelect('account.openingBalance + COALESCE(SUM(CASE WHEN movement.operation = \'E\' THEN movement.amount ELSE movement.amount * -1 END), 0)', 'balance')
    .groupBy('account.id, account.name, account.type, account.accountNumber, account.openingBalance, account.status')
    .orderBy('account.name', 'ASC')
    .getRawMany();
  return rows.map(accountDto);
};

export const getAccountBalance = async (manager, accountId) => {
  const row = await manager.getRepository('FinancialAccount').createQueryBuilder('account')
    .leftJoin('account.movements', 'movement', 'movement.status = :active', { active: 'E' })
    .select('account.openingBalance + COALESCE(SUM(CASE WHEN movement.operation = \'E\' THEN movement.amount ELSE movement.amount * -1 END), 0)', 'balance')
    .where('account.id = :accountId', { accountId })
    .groupBy('account.id, account.openingBalance')
    .getRawOne();
  return Number(row?.BALANCE ?? row?.balance ?? 0);
};

export const createAccount = async (data, userId) => accountDto(await AppDataSource.getRepository('FinancialAccount').save(AppDataSource.getRepository('FinancialAccount').create({ ...data, createdBy: userId })));
export const updateAccount = async (id, data, userId) => (await AppDataSource.getRepository('FinancialAccount').update(id, { ...data, updatedBy: userId })).affected > 0;

export const listMovements = async () => (await AppDataSource.getRepository('FinancialMovement').createQueryBuilder('item')
  .leftJoin('item.account', 'account').addSelect(['account.id', 'account.name'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .orderBy('item.movementDate', 'DESC').addOrderBy('item.id', 'DESC')
  .getMany()).map(movementDto);

export const createFinancialMovement = async (manager, data, userId) => {
  if (Number(data.amount ?? 0) <= 0) throw new BusinessRuleError('El monto del movimiento financiero debe ser mayor a cero.');
  if (data.referenceType && data.referenceId) {
    const duplicated = await manager.getRepository('FinancialMovement').findOneBy({ referenceType: data.referenceType, referenceId: data.referenceId, status: 'E' });
    if (duplicated) throw new BusinessRuleError('Ya existe un movimiento financiero activo para esta referencia.');
  }
  if (data.sourceType === 'CASH_SESSION') {
    data.financialAccountId = null;
    const session = await manager.getRepository('CashSession').findOneBy({ id: data.cashSessionId, status: 'A' });
    if (!session) throw new BusinessRuleError('La sesion de caja seleccionada no existe o no esta abierta.');
    data.branchId = data.branchId ?? session.branchId;
  } else {
    data.cashSessionId = null;
    const account = await manager.getRepository('FinancialAccount').findOneBy({ id: data.financialAccountId, type: data.sourceType, status: 'E' });
    if (!account) throw new BusinessRuleError('La cuenta o fondo seleccionado no existe o esta desactivado.');
    if (data.operation === 'S') {
      const balance = await getAccountBalance(manager, data.financialAccountId);
      if (balance < Number(data.amount)) throw new BusinessRuleError('La cuenta o fondo seleccionado no tiene saldo suficiente.');
    }
  }
  const repo = manager.getRepository('FinancialMovement');
  return repo.save(repo.create({ ...data, createdBy: userId, status: 'E' }));
};

export const createManualMovement = async (data, userId) => AppDataSource.transaction(async manager => movementDto(await createFinancialMovement(manager, data, userId)));

export const getSummary = async () => {
  const accounts = await listAccounts();
  const movements = await listMovements();
  return {
    totalBalance: accounts.reduce((sum, item) => sum + Number(item.balance ?? 0), 0),
    bankBalance: accounts.filter(item => item.type === 'BANK').reduce((sum, item) => sum + Number(item.balance ?? 0), 0),
    cashFundBalance: accounts.filter(item => item.type === 'CASH_FUND').reduce((sum, item) => sum + Number(item.balance ?? 0), 0),
    unreconciled: movements.filter(item => item.status === 'E' && !item.reconciledAt).length,
    accounts: accounts.length
  };
};

export const transferFunds = async (data, userId) => AppDataSource.transaction(async manager => {
  const from = await manager.getRepository('FinancialAccount').findOneBy({ id: data.fromAccountId, status: 'E' });
  const to = await manager.getRepository('FinancialAccount').findOneBy({ id: data.toAccountId, status: 'E' });
  if (!from || !to) throw new BusinessRuleError('Las cuentas de origen y destino deben estar activas.');
  const out = await createFinancialMovement(manager, { financialAccountId: from.id, sourceType: from.type, operation: 'S', amount: data.amount, description: data.description, referenceType: 'TRANSFER_OUT', movementDate: data.movementDate }, userId);
  const incoming = await createFinancialMovement(manager, { financialAccountId: to.id, sourceType: to.type, operation: 'E', amount: data.amount, description: data.description, referenceType: 'TRANSFER_IN', referenceId: out.id, movementDate: data.movementDate }, userId);
  out.referenceId = incoming.id;
  await manager.getRepository('FinancialMovement').save(out);
  return { out: movementDto(out), in: movementDto(incoming) };
});

export const reconcileMovement = async (id, note, userId) => AppDataSource.transaction(async manager => {
  const movement = await manager.getRepository('FinancialMovement').findOneBy({ id, status: 'E' });
  if (!movement) throw new BusinessRuleError('El movimiento financiero no existe o no esta activo.');
  if (movement.reconciledAt) throw new BusinessRuleError('El movimiento ya fue conciliado.');
  movement.reconciledAt = new Date();
  movement.reconciliationNote = note || null;
  movement.updatedBy = userId;
  return movementDto(await manager.getRepository('FinancialMovement').save(movement));
});

export const reverseMovement = async (id, reason, userId) => AppDataSource.transaction(async manager => {
  const movement = await manager.getRepository('FinancialMovement').findOneBy({ id, status: 'E' });
  if (!movement) throw new BusinessRuleError('El movimiento financiero no existe o no esta activo.');
  if (movement.reconciledAt) throw new BusinessRuleError('No se puede anular un movimiento conciliado.');
  movement.status = 'R';
  movement.updatedBy = userId;
  await manager.getRepository('FinancialMovement').save(movement);
  const reversal = await createFinancialMovement(manager, {
    financialAccountId: movement.financialAccountId,
    cashSessionId: movement.cashSessionId,
    branchId: movement.branchId,
    sourceType: movement.sourceType,
    operation: movement.operation === 'E' ? 'S' : 'E',
    amount: movement.amount,
    description: `Reversa: ${reason}`,
    referenceType: 'REVERSAL',
    referenceId: movement.id,
    reversalOfId: movement.id,
    movementDate: new Date()
  }, userId);
  return { reversed: movementDto(movement), reversal: movementDto(reversal) };
});
