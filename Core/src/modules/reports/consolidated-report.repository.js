import { AppDataSource } from '../../config/data-source.js';

const bindDates = (query, { startDate, endDate }, column) => {
  if (startDate) query.andWhere(`${column} >= :startDate`, { startDate: new Date(startDate) });
  if (endDate) query.andWhere(`${column} < :endDate`, { endDate: new Date(endDate) });
  return query;
};

export const cashFlowReport = async filters => {
  const query = AppDataSource.getRepository('CashMovement').createQueryBuilder('m')
    .leftJoin('m.branch', 'branch')
    .leftJoin('m.cashMovementType', 'type')
    .select('m.branchId', 'branchId')
    .addSelect('branch.name', 'branchName')
    .addSelect('COALESCE(SUM(CASE WHEN type.operation = :income THEN m.amount ELSE 0 END), 0)', 'income')
    .addSelect('COALESCE(SUM(CASE WHEN type.operation = :expense THEN m.amount ELSE 0 END), 0)', 'expense')
    .where('m.status = :status', { status: 'E' })
    .setParameters({ income: 'I', expense: 'E' })
    .groupBy('m.branchId').addGroupBy('branch.name')
    .orderBy('branch.name', 'ASC');
  if (filters.branchId) query.andWhere('m.branchId = :branchId', { branchId: Number(filters.branchId) });
  bindDates(query, filters, 'm.movementDate');
  return (await query.getRawMany()).map(row => ({ ...row, income: Number(row.income), expense: Number(row.expense), net: Number(row.income) - Number(row.expense) }));
};

export const inventoryKardexReport = async filters => {
  const query = AppDataSource.getRepository('InventoryKardex').createQueryBuilder('k')
    .leftJoin('k.branch', 'branch')
    .leftJoin('k.medicine', 'medicine')
    .select('k.movementType', 'source').addSelect('k.referenceId', 'sourceId').addSelect('k.movementDate', 'movementDate')
    .addSelect('k.branchId', 'branchId').addSelect('branch.name', 'branchName').addSelect('k.medicineId', 'medicineId')
    .addSelect('medicine.name', 'medicineName').addSelect('k.quantityIn', 'quantityIn').addSelect('k.quantityOut', 'quantityOut')
    .addSelect('k.balanceAfter', 'balanceAfter').addSelect('k.reason', 'reason')
    .orderBy('k.movementDate', 'DESC').addOrderBy('k.id', 'DESC');
  if (filters.branchId) query.andWhere('k.branchId = :branchId', { branchId: Number(filters.branchId) });
  if (filters.medicineId) query.andWhere('k.medicineId = :medicineId', { medicineId: Number(filters.medicineId) });
  bindDates(query, filters, 'k.movementDate');
  return (await query.getRawMany()).map(row => ({ ...row, quantityIn: Number(row.quantityIn ?? 0), quantityOut: Number(row.quantityOut ?? 0), balanceAfter: Number(row.balanceAfter ?? 0) }));
};

export const transferReport = async filters => {
  const query = AppDataSource.getRepository('MoveInventoryDetail').createQueryBuilder('detail')
    .leftJoin('detail.movement', 'm').leftJoin('m.branchOrigin', 'origin').leftJoin('m.branchDestination', 'destination')
    .select('m.id', 'id').addSelect('m.movementDate', 'movementDate').addSelect('origin.name', 'originName').addSelect('destination.name', 'destinationName')
    .addSelect('COUNT(detail.id)', 'items').addSelect('COALESCE(SUM(detail.quantity), 0)', 'units')
    .where('m.status = :status', { status: 'E' }).groupBy('m.id').addGroupBy('m.movementDate').addGroupBy('origin.name').addGroupBy('destination.name')
    .orderBy('m.movementDate', 'DESC');
  if (filters.branchId) query.andWhere('(m.branchOriginId = :branchId OR m.branchDestinationId = :branchId)', { branchId: Number(filters.branchId) });
  bindDates(query, filters, 'm.movementDate');
  return (await query.getRawMany()).map(row => ({ ...row, items: Number(row.items), units: Number(row.units) }));
};

export const fixedAssetReport = async filters => {
  const query = AppDataSource.getRepository('FixedAsset').createQueryBuilder('a')
    .leftJoin('a.branch', 'branch')
    .select('a.branchId', 'branchId').addSelect('branch.name', 'branchName')
    .addSelect('COUNT(a.id)', 'assets').addSelect('COALESCE(SUM(a.purchaseCost), 0)', 'purchaseCost')
    .addSelect('COALESCE(SUM(a.accumulatedDepreciation), 0)', 'depreciation')
    .where('a.status <> :status', { status: 'D' }).groupBy('a.branchId').addGroupBy('branch.name').orderBy('branch.name', 'ASC');
  if (filters.branchId) query.andWhere('a.branchId = :branchId', { branchId: Number(filters.branchId) });
  return (await query.getRawMany()).map(row => ({ ...row, assets: Number(row.assets), purchaseCost: Number(row.purchaseCost), depreciation: Number(row.depreciation), bookValue: Number(row.purchaseCost) - Number(row.depreciation) }));
};

export const payrollReport = async filters => {
  const query = AppDataSource.getRepository('PayrollPayment').createQueryBuilder('p')
    .leftJoin('p.branch', 'branch')
    .select('p.branchId', 'branchId').addSelect('branch.name', 'branchName')
    .addSelect('COUNT(p.id)', 'payments').addSelect('COALESCE(SUM(p.baseSalary), 0)', 'baseSalary')
    .addSelect('COALESCE(SUM(p.bonuses), 0)', 'bonuses').addSelect('COALESCE(SUM(p.deductions), 0)', 'deductions')
    .addSelect('COALESCE(SUM(p.total), 0)', 'total')
    .where('p.status = :status', { status: 'E' }).groupBy('p.branchId').addGroupBy('branch.name').orderBy('branch.name', 'ASC');
  if (filters.branchId) query.andWhere('p.branchId = :branchId', { branchId: Number(filters.branchId) });
  bindDates(query, filters, 'p.paymentDate');
  return (await query.getRawMany()).map(row => ({ ...row, payments: Number(row.payments), baseSalary: Number(row.baseSalary), bonuses: Number(row.bonuses), deductions: Number(row.deductions), total: Number(row.total) }));
};
