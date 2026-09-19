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
  const rows = [];
  const purchases = AppDataSource.getRepository('PurchaseDetail').createQueryBuilder('d')
    .leftJoin('d.purchase', 'h').leftJoin('d.medicine', 'medicine').leftJoin('h.branch', 'branch')
    .select("'PURCHASE'", 'source').addSelect('h.id', 'sourceId').addSelect('h.purchaseDate', 'movementDate')
    .addSelect('h.branchId', 'branchId').addSelect('branch.name', 'branchName').addSelect('d.medicineId', 'medicineId')
    .addSelect('medicine.name', 'medicineName').addSelect('d.quantity', 'quantityIn').addSelect('0', 'quantityOut')
    .where('1 = 1');
  const sales = AppDataSource.getRepository('SaleDetail').createQueryBuilder('d')
    .leftJoin('d.sale', 'h').leftJoin('d.medicine', 'medicine').leftJoin('h.branch', 'branch')
    .select("'SALE'", 'source').addSelect('h.id', 'sourceId').addSelect('h.saleDate', 'movementDate')
    .addSelect('h.branchId', 'branchId').addSelect('branch.name', 'branchName').addSelect('d.medicineId', 'medicineId')
    .addSelect('medicine.name', 'medicineName').addSelect('0', 'quantityIn').addSelect('d.quantity', 'quantityOut')
    .where('h.status = :status', { status: 'E' });
  const transferIn = AppDataSource.getRepository('MoveInventoryDetail').createQueryBuilder('d')
    .leftJoin('d.movement', 'h').leftJoin('d.medicine', 'medicine').leftJoin('h.branchDestination', 'branch')
    .select("'TRANSFER_IN'", 'source').addSelect('h.id', 'sourceId').addSelect('h.movementDate', 'movementDate')
    .addSelect('h.branchDestinationId', 'branchId').addSelect('branch.name', 'branchName').addSelect('d.medicineId', 'medicineId')
    .addSelect('medicine.name', 'medicineName').addSelect('d.quantity', 'quantityIn').addSelect('0', 'quantityOut')
    .where('h.status = :status', { status: 'E' });
  const transferOut = AppDataSource.getRepository('MoveInventoryDetail').createQueryBuilder('d')
    .leftJoin('d.movement', 'h').leftJoin('d.medicine', 'medicine').leftJoin('h.branchOrigin', 'branch')
    .select("'TRANSFER_OUT'", 'source').addSelect('h.id', 'sourceId').addSelect('h.movementDate', 'movementDate')
    .addSelect('h.branchOriginId', 'branchId').addSelect('branch.name', 'branchName').addSelect('d.medicineId', 'medicineId')
    .addSelect('medicine.name', 'medicineName').addSelect('0', 'quantityIn').addSelect('d.quantity', 'quantityOut')
    .where('h.status = :status', { status: 'E' });

  const sources = [
    { query: purchases, dateColumn: 'h.purchaseDate', branchColumn: 'h.branchId' },
    { query: sales, dateColumn: 'h.saleDate', branchColumn: 'h.branchId' },
    { query: transferIn, dateColumn: 'h.movementDate', branchColumn: 'h.branchDestinationId' },
    { query: transferOut, dateColumn: 'h.movementDate', branchColumn: 'h.branchOriginId' }
  ];

  for (const { query, dateColumn, branchColumn } of sources) {
    if (filters.branchId) query.andWhere(`${branchColumn} = :branchId`, { branchId: Number(filters.branchId) });
    if (filters.medicineId) query.andWhere('d.medicineId = :medicineId', { medicineId: Number(filters.medicineId) });
    bindDates(query, filters, dateColumn);
    rows.push(...await query.getRawMany());
  }
  return rows.map(row => ({ ...row, quantityIn: Number(row.quantityIn ?? 0), quantityOut: Number(row.quantityOut ?? 0) }))
    .sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));
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
