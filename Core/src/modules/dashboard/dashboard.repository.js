import { AppDataSource } from '../../config/data-source.js';

const toNumber = value => Number(value ?? 0);

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const countBy = async (entity, where = {}) => AppDataSource.getRepository(entity).count({ where });

const cashSummary = async () => {
  const { start, end } = todayRange();
  const rows = await AppDataSource.getRepository('CashMovement').createQueryBuilder('m')
    .leftJoin('m.cashMovementType', 'type')
    .select('COALESCE(SUM(CASE WHEN type.operation = :income THEN m.amount ELSE 0 END), 0)', 'income')
    .addSelect('COALESCE(SUM(CASE WHEN type.operation = :expense THEN m.amount ELSE 0 END), 0)', 'expense')
    .where('m.status = :status', { status: 'E' })
    .andWhere('m.movementDate >= :start AND m.movementDate < :end', { start, end })
    .setParameters({ income: 'I', expense: 'E' })
    .getRawOne();

  const income = toNumber(rows?.income);
  const expense = toNumber(rows?.expense);
  const openSessions = await countBy('CashSession', { status: 'A' });

  return { income, expense, net: income - expense, openSessions };
};

const orderSummary = async () => {
  const rows = await AppDataSource.getRepository('CustomerOrder').createQueryBuilder('o')
    .select('o.status', 'status')
    .addSelect('COUNT(o.id)', 'total')
    .groupBy('o.status')
    .getRawMany();

  const byStatus = rows.reduce((acc, row) => ({ ...acc, [row.status]: toNumber(row.total) }), {});
  return {
    pending: byStatus.P ?? 0,
    inRoute: byStatus.S ?? 0,
    delivered: byStatus.D ?? 0,
    cancelled: byStatus.C ?? 0
  };
};

const branchSummary = async () => {
  const rows = await AppDataSource.getRepository('Branch').createQueryBuilder('b')
    .select('b.branchType', 'branchType')
    .addSelect('COUNT(b.id)', 'total')
    .where('b.status = :status', { status: 'E' })
    .groupBy('b.branchType')
    .getRawMany();

  const byType = rows.reduce((acc, row) => ({ ...acc, [row.branchType]: toNumber(row.total) }), {});
  return {
    active: rows.reduce((sum, row) => sum + toNumber(row.total), 0),
    mall: byType.CENTRO_COMERCIAL ?? 0,
    gasStationStand: byType.STAND_GASOLINERA ?? 0
  };
};

const fixedAssetSummary = async () => {
  const row = await AppDataSource.getRepository('FixedAsset').createQueryBuilder('a')
    .select('COUNT(a.id)', 'assets')
    .addSelect('COALESCE(SUM(a.purchaseCost), 0)', 'purchaseCost')
    .addSelect('COALESCE(SUM(a.accumulatedDepreciation), 0)', 'depreciation')
    .where('a.status <> :status', { status: 'D' })
    .getRawOne();

  const purchaseCost = toNumber(row?.purchaseCost);
  const depreciation = toNumber(row?.depreciation);
  return { assets: toNumber(row?.assets), bookValue: purchaseCost - depreciation };
};

const payrollSummary = async () => {
  const { start, end } = todayRange();
  const row = await AppDataSource.getRepository('PayrollPayment').createQueryBuilder('p')
    .select('COALESCE(SUM(p.total), 0)', 'total')
    .where('p.status = :status', { status: 'E' })
    .andWhere('p.paymentDate >= :start AND p.paymentDate < :end', { start, end })
    .getRawOne();
  return { todayTotal: toNumber(row?.total) };
};

const executiveSummary = async () => {
  const { start, end } = todayRange();
  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const salesRow = await AppDataSource.getRepository('Sale').createQueryBuilder('s')
    .select('COALESCE(SUM(CASE WHEN s.saleDate >= :start AND s.saleDate < :end THEN s.total ELSE 0 END), 0)', 'todaySales')
    .addSelect('COALESCE(SUM(CASE WHEN s.saleDate >= :monthStart AND s.saleDate < :end THEN s.total ELSE 0 END), 0)', 'monthSales')
    .addSelect('COUNT(CASE WHEN s.saleDate >= :monthStart AND s.saleDate < :end THEN s.id END)', 'monthTransactions')
    .where('s.status = :status', { status: 'E' })
    .setParameters({ start, end, monthStart })
    .getRawOne();
  const inventoryRow = await AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .leftJoin('i.medicine', 'medicine')
    .select('COALESCE(SUM(i.stockAvailable * medicine.priceSell), 0)', 'inventorySellValue')
    .addSelect('COALESCE(SUM(i.reserve * medicine.priceSell), 0)', 'reservedSellValue')
    .getRawOne();
  const deliveredOrders = await AppDataSource.getRepository('CustomerOrder').createQueryBuilder('o')
    .where('o.status = :status', { status: 'D' })
    .andWhere('o.orderDate >= :monthStart AND o.orderDate < :end', { monthStart, end })
    .getCount();
  const monthSales = toNumber(salesRow?.monthSales);
  const monthTransactions = toNumber(salesRow?.monthTransactions);
  return {
    todaySales: toNumber(salesRow?.todaySales),
    monthSales,
    monthTransactions,
    averageTicket: monthTransactions ? monthSales / monthTransactions : 0,
    deliveredOrders,
    inventorySellValue: toNumber(inventoryRow?.inventorySellValue),
    reservedSellValue: toNumber(inventoryRow?.reservedSellValue)
  };
};

const criticalInventory = async () => {
  const lowStock = await AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .where('i.stockMin > 0')
    .andWhere('i.stockAvailable <= i.stockMin')
    .getCount();

  const limit = new Date();
  limit.setDate(limit.getDate() + 60);
  const expiringLots = await AppDataSource.getRepository('InventoryLot').createQueryBuilder('l')
    .where('l.status = :status', { status: 'E' })
    .andWhere('l.expirationDate <= :limit', { limit })
    .getCount();

  const overStock = await AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .where('i.stockMax > 0')
    .andWhere('i.stockAvailable >= i.stockMax')
    .getCount();

  return { lowStock, expiringLots, overStock };
};

const deliverySummary = async () => {
  const pendingRequests = await AppDataSource.getRepository('DeliveryRequest').createQueryBuilder('r')
    .where('r.status IN (:...statuses)', { statuses: ['P', 'A', 'S'] })
    .getCount();
  const transfers = await AppDataSource.getRepository('MoveInventory').createQueryBuilder('m')
    .where('m.status = :status', { status: 'E' })
    .getCount();
  return { pendingRequests, transfers };
};

const recentActivity = async () => (await AppDataSource.getRepository('AuditTrailLog').find({
  order: { createdAt: 'DESC', id: 'DESC' },
  take: 8
})).map(item => ({
  id: item.id,
  tableName: item.tableName,
  action: item.action,
  recordId: item.recordId,
  userId: item.userId,
  createdAt: item.createdAt
}));

const branchHealth = async () => {
  const rows = await AppDataSource.getRepository('Branch').createQueryBuilder('b')
    .leftJoin('b.company', 'company')
    .select('b.id', 'id')
    .addSelect('b.name', 'name')
    .addSelect('b.branchType', 'branchType')
    .addSelect(subQuery => subQuery.select('COUNT(i.id)', 'lowStock').from('Inventory', 'i').where('i.branchId = b.id').andWhere('i.stockMin > 0').andWhere('i.stockAvailable <= i.stockMin'), 'lowStock')
    .addSelect(subQuery => subQuery.select('COUNT(o.id)', 'pendingOrders').from('CustomerOrder', 'o').where('o.branchId = b.id').andWhere('o.status IN (:...orderStatuses)'), 'pendingOrders')
    .addSelect(subQuery => subQuery.select('COUNT(s.id)', 'openSessions').from('CashSession', 's').where('s.branchId = b.id').andWhere('s.status = :openStatus'), 'openSessions')
    .where('b.status = :status', { status: 'E' })
    .setParameters({ orderStatuses: ['P', 'S'], openStatus: 'A' })
    .orderBy('b.name', 'ASC')
    .getRawMany();

  return rows.map(row => ({
    id: toNumber(row.id),
    name: row.name,
    branchType: row.branchType,
    lowStock: toNumber(row.lowStock),
    pendingOrders: toNumber(row.pendingOrders),
    openSessions: toNumber(row.openSessions)
  }));
};

export const getDashboardSummary = async () => {
  const [cash, orders, branches, assets, payroll, inventory, delivery, activity, branchStatus, executive] = await Promise.all([
    cashSummary(),
    orderSummary(),
    branchSummary(),
    fixedAssetSummary(),
    payrollSummary(),
    criticalInventory(),
    deliverySummary(),
    recentActivity(),
    branchHealth(),
    executiveSummary()
  ]);

  return { cash, orders, branches, assets, payroll, inventory, delivery, activity, branchStatus, executive, generatedAt: new Date() };
};
