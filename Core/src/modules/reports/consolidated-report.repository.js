import { AppDataSource } from '../../config/data-source.js';

const bindDates = (query, { startDate, endDate }, column) => {
  if (startDate) query.andWhere(`${column} >= :startDate`, { startDate: new Date(startDate) });
  if (endDate) query.andWhere(`${column} < :endDate`, { endDate: new Date(endDate) });
  return query;
};

const applyCommonFilters = (query, filters, aliases = {}) => {
  if (filters.branchId && aliases.branch) query.andWhere(`${aliases.branch} = :branchId`, { branchId: Number(filters.branchId) });
  if (filters.medicineId && aliases.medicine) query.andWhere(`${aliases.medicine} = :medicineId`, { medicineId: Number(filters.medicineId) });
  if (filters.productId && aliases.medicine) query.andWhere(`${aliases.medicine} = :medicineId`, { medicineId: Number(filters.productId) });
  if (filters.categoryId && aliases.category) query.andWhere(`${aliases.category} = :categoryId`, { categoryId: Number(filters.categoryId) });
  if (filters.supplierId && aliases.supplier) query.andWhere(`${aliases.supplier} = :supplierId`, { supplierId: Number(filters.supplierId) });
  if (filters.status && aliases.status) query.andWhere(`${aliases.status} = :filterStatus`, { filterStatus: filters.status });
  if (filters.paymentMethod && aliases.paymentMethod) query.andWhere(`${aliases.paymentMethod} = :paymentMethod`, { paymentMethod: filters.paymentMethod });
  return query;
};

const numberize = (row, fields) => fields.reduce((acc, field) => ({ ...acc, [field]: Number(row[field] ?? 0) }), { ...row });

const limitRows = (query, filters, max = 50) => query.take(Math.min(Number(filters.limit || max), 200));

const paginateRows = (query, filters, defaultLimit = 50) => {
  const limit = Math.min(Math.max(Number(filters.limit || defaultLimit), 1), 200);
  const page = Math.max(Number(filters.page || 1), 1);
  return query.take(limit).skip((page - 1) * limit);
};

const auditObjects = {
  TB_AUDIT_TRAIL_LOG: 'Bitacora de auditoria',
  TB_BRANCH: 'Sucursal',
  TB_CASH_MOVEMENT: 'Movimiento de caja',
  TB_CASH_SESSION: 'Sesion de caja',
  TB_EMPLOYEE: 'Empleado',
  TB_FIXED_ASSET: 'Activo fijo',
  TB_INVENTORY: 'Inventario',
  TB_INVENTORY_KARDEX: 'Kardex de inventario',
  TB_INVENTORY_LOT: 'Lote de inventario',
  TB_MEDICINE: 'Medicamento',
  TB_MOVE_INVENTORY: 'Traslado de inventario',
  TB_PAYROLL_PAYMENT: 'Pago de planilla',
  TB_PURCHASE: 'Compra',
  TB_SALE: 'Venta',
  TB_SUPPLIER: 'Proveedor',
  T_MENU: 'Menu',
  T_PERMISSION: 'Permiso',
  T_ROLE: 'Rol',
  T_ROLE_PERMISSION: 'Permiso por rol',
  T_USER: 'Usuario'
};

const auditActions = {
  INSERT: 'Creacion',
  UPDATE: 'Actualizacion',
  DELETE: 'Eliminacion',
  CREATE: 'Creacion',
  EDIT: 'Edicion',
  REMOVE: 'Eliminacion'
};

const truncateText = value => {
  if (!value) return '';
  const text = String(value);
  return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
};

export const salesByPeriodReport = async filters => {
  const query = AppDataSource.getRepository('Sale').createQueryBuilder('s')
    .leftJoin('s.branch', 'branch')
    .leftJoin('SaleDetail', 'd', 'd.saleId = s.id AND d.status = :detailStatus', { detailStatus: 'E' })
    .leftJoin('d.medicine', 'm')
    .select('s.branchId', 'branchId').addSelect('branch.name', 'branchName')
    .addSelect('COUNT(DISTINCT s.id)', 'sales')
    .addSelect('COALESCE(SUM(d.total), 0)', 'grossAmount')
    .addSelect('0', 'discounts')
    .addSelect('COALESCE(SUM(d.total), 0)', 'netAmount')
    .addSelect('COALESCE(SUM(d.quantity * m.priceBuy), 0)', 'cost')
    .addSelect('COALESCE(SUM(d.total - (d.quantity * m.priceBuy)), 0)', 'profit')
    .addSelect('COALESCE(AVG(s.total), 0)', 'averageTicket')
    .where('s.status = :status', { status: 'E' })
    .groupBy('s.branchId').addGroupBy('branch.name')
    .orderBy('branch.name', 'ASC');
  applyCommonFilters(query, filters, { branch: 's.branchId', medicine: 'd.medicineId', category: 'm.categoryId', paymentMethod: 's.paymentMethod' });
  bindDates(query, filters, 's.saleDate');
  return (await query.getRawMany()).map(row => numberize(row, ['sales', 'grossAmount', 'discounts', 'netAmount', 'cost', 'profit', 'averageTicket']));
};

export const salesByMedicineReport = async filters => {
  const query = AppDataSource.getRepository('SaleDetail').createQueryBuilder('d')
    .leftJoin('d.sale', 's').leftJoin('d.medicine', 'm').leftJoin('m.category', 'category')
    .select('m.code', 'code').addSelect('m.name', 'medicineName').addSelect('category.name', 'categoryName')
    .addSelect('COALESCE(SUM(d.quantity), 0)', 'quantitySold')
    .addSelect('COALESCE(AVG(d.unitPrice), 0)', 'averagePrice')
    .addSelect('COALESCE(AVG(m.priceBuy), 0)', 'averageCost')
    .addSelect('COALESCE(SUM(d.total), 0)', 'totalSold')
    .addSelect('COALESCE(SUM(d.total - (d.quantity * m.priceBuy)), 0)', 'profit')
    .where('s.status = :saleStatus AND d.status = :detailStatus', { saleStatus: 'E', detailStatus: 'E' })
    .groupBy('m.code').addGroupBy('m.name').addGroupBy('category.name')
    .orderBy('COALESCE(SUM(d.total), 0)', 'DESC');
  applyCommonFilters(query, filters, { branch: 's.branchId', medicine: 'd.medicineId', category: 'm.categoryId', paymentMethod: 's.paymentMethod' });
  bindDates(query, filters, 's.saleDate');
  limitRows(query, filters, 100);
  return (await query.getRawMany()).map(row => numberize(row, ['quantitySold', 'averagePrice', 'averageCost', 'totalSold', 'profit']));
};

export const topProductsReport = async filters => {
  const rows = await salesByMedicineReport(filters);
  const sortBy = filters.sortBy === 'quantity' ? 'quantitySold' : filters.sortBy === 'profit' ? 'profit' : 'totalSold';
  return rows.sort((a, b) => b[sortBy] - a[sortBy]).slice(0, Math.min(Number(filters.limit || 10), 50));
};

export const lowMovementProductsReport = async filters => {
  const query = AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .leftJoin('i.branch', 'branch').leftJoin('i.medicine', 'm')
    .leftJoin('InventoryLot', 'l', 'l.branchId = i.branchId AND l.medicineId = i.medicineId AND l.status = :lotStatus', { lotStatus: 'E' })
    .leftJoin('SaleDetail', 'd', 'd.medicineId = i.medicineId AND d.status = :detailStatus', { detailStatus: 'E' })
    .leftJoin('d.sale', 's', 's.branchId = i.branchId AND s.status = :saleStatus', { saleStatus: 'E' })
    .select('branch.name', 'branchName').addSelect('m.code', 'code').addSelect('m.name', 'medicineName')
    .addSelect('i.stockAvailable', 'stockAvailable').addSelect('MAX(s.saleDate)', 'lastSaleDate')
    .addSelect('MIN(l.expirationDate)', 'nearestExpirationDate')
    .addSelect('COALESCE(i.stockAvailable * COALESCE(NULLIF(m.priceBuy, 0), AVG(l.purchasePrice), 0), 0)', 'inventoryValue')
    .where('i.stockAvailable > 0')
    .groupBy('branch.name').addGroupBy('m.code').addGroupBy('m.name').addGroupBy('i.stockAvailable').addGroupBy('m.priceBuy')
    .orderBy('MAX(s.saleDate)', 'ASC', 'NULLS FIRST');
  applyCommonFilters(query, filters, { branch: 'i.branchId', medicine: 'i.medicineId', category: 'm.categoryId' });
  limitRows(query, filters, 100);
  return (await query.getRawMany()).map(row => numberize(row, ['stockAvailable', 'inventoryValue']));
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

export const inventoryByBranchReport = async filters => {
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('l')
    .leftJoin('l.branch', 'branch').leftJoin('l.medicine', 'm').leftJoin('m.category', 'category')
    .select('branch.name', 'branchName').addSelect('m.code', 'code').addSelect('m.name', 'medicineName')
    .addSelect('category.name', 'categoryName').addSelect('l.lotNumber', 'lotNumber').addSelect('l.expirationDate', 'expirationDate')
    .addSelect('l.quantityAvailable', 'quantity').addSelect('l.purchasePrice', 'unitCost')
    .addSelect('COALESCE(l.quantityAvailable * l.purchasePrice, 0)', 'inventoryValue')
    .where('l.status = :status', { status: 'E' }).orderBy('branch.name', 'ASC').addOrderBy('m.name', 'ASC');
  applyCommonFilters(query, filters, { branch: 'l.branchId', medicine: 'l.medicineId', category: 'm.categoryId', supplier: 'l.supplierId' });
  return (await query.getRawMany()).map(row => numberize(row, ['quantity', 'unitCost', 'inventoryValue']));
};

export const consolidatedInventoryReport = async filters => {
  const query = AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .leftJoin('i.medicine', 'm').leftJoin('m.category', 'category')
    .select('m.code', 'code').addSelect('m.name', 'medicineName').addSelect('category.name', 'categoryName')
    .addSelect('COALESCE(SUM(i.stockAvailable), 0)', 'totalQuantity')
    .addSelect('COALESCE(SUM(i.stockAvailable * m.priceBuy), 0)', 'inventoryValue')
    .groupBy('m.code').addGroupBy('m.name').addGroupBy('category.name').orderBy('m.name', 'ASC');
  applyCommonFilters(query, filters, { branch: 'i.branchId', medicine: 'i.medicineId', category: 'm.categoryId' });
  return (await query.getRawMany()).map(row => numberize(row, ['totalQuantity', 'inventoryValue']));
};

export const expiringMedicinesReport = async filters => {
  const days = Math.min(Number(filters.days || 90), 365);
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('l')
    .leftJoin('l.branch', 'branch').leftJoin('l.medicine', 'm')
    .select('branch.name', 'branchName').addSelect('m.name', 'medicineName').addSelect('l.lotNumber', 'lotNumber')
    .addSelect('l.expirationDate', 'expirationDate').addSelect('l.quantityAvailable', 'quantity').addSelect('l.purchasePrice', 'cost')
    .addSelect('COALESCE(l.quantityAvailable * l.purchasePrice, 0)', 'totalValue')
    .where('l.status = :status AND l.quantityAvailable > 0 AND l.expirationDate >= CURRENT_DATE AND l.expirationDate < :until', { status: 'E', until: new Date(Date.now() + days * 86400000) })
    .orderBy('l.expirationDate', 'ASC');
  applyCommonFilters(query, filters, { branch: 'l.branchId', medicine: 'l.medicineId', category: 'm.categoryId', supplier: 'l.supplierId' });
  return (await query.getRawMany()).map(row => numberize(row, ['quantity', 'cost', 'totalValue']));
};

export const expiredMedicinesReport = async filters => {
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('l')
    .leftJoin('l.branch', 'branch').leftJoin('l.medicine', 'm')
    .select('branch.name', 'branchName').addSelect('m.name', 'medicineName').addSelect('l.lotNumber', 'lotNumber')
    .addSelect('l.expirationDate', 'expirationDate').addSelect('l.quantityAvailable', 'quantity').addSelect('l.purchasePrice', 'cost')
    .addSelect('COALESCE(l.quantityAvailable * l.purchasePrice, 0)', 'lostValue')
    .where('l.status = :status AND l.quantityAvailable > 0 AND l.expirationDate < CURRENT_DATE', { status: 'E' })
    .orderBy('l.expirationDate', 'ASC');
  applyCommonFilters(query, filters, { branch: 'l.branchId', medicine: 'l.medicineId', category: 'm.categoryId', supplier: 'l.supplierId' });
  return (await query.getRawMany()).map(row => numberize(row, ['quantity', 'cost', 'lostValue']));
};

export const minimumStockReport = async filters => {
  const query = AppDataSource.getRepository('Inventory').createQueryBuilder('i')
    .leftJoin('i.branch', 'branch').leftJoin('i.medicine', 'm')
    .select('branch.name', 'branchName').addSelect('m.code', 'code').addSelect('m.name', 'medicineName')
    .addSelect('i.stockAvailable', 'stockAvailable').addSelect('i.stockMin', 'stockMin')
    .addSelect('GREATEST(i.stockMin - i.stockAvailable, 0)', 'missing')
    .where('i.stockAvailable <= i.stockMin')
    .orderBy('branch.name', 'ASC').addOrderBy('m.name', 'ASC');
  applyCommonFilters(query, filters, { branch: 'i.branchId', medicine: 'i.medicineId', category: 'm.categoryId' });
  return (await query.getRawMany()).map(row => numberize(row, ['stockAvailable', 'stockMin', 'missing']));
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

export const cashClosingReport = async filters => {
  const query = AppDataSource.getRepository('CashSession').createQueryBuilder('s')
    .leftJoin('s.branch', 'branch').leftJoin('s.cashRegister', 'cashRegister')
    .select('branch.name', 'branchName').addSelect('cashRegister.name', 'cashRegisterName')
    .addSelect('s.openingDate', 'openingDate').addSelect('s.closingDate', 'closingDate')
    .addSelect('s.openingAmount', 'openingAmount').addSelect('s.expectedAmount', 'expectedAmount')
    .addSelect('s.closingAmount', 'closingAmount').addSelect('s.differenceAmount', 'differenceAmount')
    .addSelect('s.differenceExplanation', 'reason')
    .where('s.status = :status', { status: 'E' }).orderBy('s.openingDate', 'DESC');
  applyCommonFilters(query, filters, { branch: 's.branchId' });
  bindDates(query, filters, 's.openingDate');
  return (await query.getRawMany()).map(row => numberize(row, ['openingAmount', 'expectedAmount', 'closingAmount', 'differenceAmount']));
};

export const purchasesBySupplierReport = async filters => {
  const query = AppDataSource.getRepository('Purchase').createQueryBuilder('p')
    .leftJoin('p.supplier', 'supplier')
    .leftJoin('PurchaseDetail', 'd', 'd.purchaseId = p.id')
    .select('supplier.name', 'supplierName').addSelect('COUNT(DISTINCT p.id)', 'orders')
    .addSelect('COUNT(DISTINCT d.medicineId)', 'products').addSelect('COALESCE(SUM(d.quantity), 0)', 'units')
    .addSelect('COALESCE(SUM(p.subtotal), 0)', 'subtotal').addSelect('COALESCE(SUM(p.tax), 0)', 'tax')
    .addSelect('COALESCE(SUM(p.total), 0)', 'total')
    .where('p.status <> :status', { status: 'CANCELLED' })
    .groupBy('supplier.name').orderBy('COALESCE(SUM(p.total), 0)', 'DESC');
  applyCommonFilters(query, filters, { branch: 'p.branchId', supplier: 'p.supplierId', medicine: 'd.medicineId' });
  bindDates(query, filters, 'p.purchaseDate');
  return (await query.getRawMany()).map(row => numberize(row, ['orders', 'products', 'units', 'subtotal', 'tax', 'total']));
};

export const profitabilityByBranchReport = async filters => {
  const rows = await salesByPeriodReport(filters);
  return rows.map(row => ({ ...row, estimatedProfit: row.profit, margin: row.netAmount ? (row.profit / row.netAmount) * 100 : 0 }));
};

export const fixedAssetDetailReport = async filters => {
  const query = AppDataSource.getRepository('FixedAsset').createQueryBuilder('a')
    .leftJoin('a.branch', 'branch')
    .select('a.code', 'code').addSelect('a.name', 'assetName').addSelect('a.category', 'category')
    .addSelect('branch.name', 'branchName').addSelect('a.responsible', 'responsible').addSelect('a.location', 'location')
    .addSelect('a.purchaseDate', 'purchaseDate').addSelect('a.purchaseCost', 'purchaseCost')
    .addSelect('a.usefulLifeMonths', 'usefulLifeMonths').addSelect('a.accumulatedDepreciation', 'depreciation')
    .addSelect('a.purchaseCost - a.accumulatedDepreciation', 'bookValue').addSelect('a.status', 'status')
    .where('a.status <> :status', { status: 'D' }).orderBy('branch.name', 'ASC').addOrderBy('a.name', 'ASC');
  applyCommonFilters(query, filters, { branch: 'a.branchId', status: 'a.status' });
  return (await query.getRawMany()).map(row => numberize(row, ['purchaseCost', 'usefulLifeMonths', 'depreciation', 'bookValue']));
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

export const auditReport = async filters => {
  const query = AppDataSource.getRepository('AuditTrailLog').createQueryBuilder('a')
    .select('a.id', 'auditId').addSelect('a.createdAt', 'createdAt').addSelect('a.userId', 'userId').addSelect('a.tableName', 'module')
    .addSelect('a.action', 'action').addSelect('a.recordId', 'recordId')
    .orderBy('a.createdAt', 'DESC');
  if (filters.userId) query.andWhere('a.userId = :userId', { userId: Number(filters.userId) });
  if (filters.module) query.andWhere('a.tableName = :module', { module: filters.module });
  if (filters.action) query.andWhere('a.action = :action', { action: filters.action });
  if (filters.recordId) query.andWhere('a.recordId = :recordId', { recordId: filters.recordId });
  bindDates(query, filters, 'a.createdAt');
  paginateRows(query, filters, 50);
  return (await query.getRawMany()).map(row => ({
    ...numberize(row, ['auditId', 'userId']),
    objectName: auditObjects[row.module] ?? row.module,
    actionName: auditActions[row.action] ?? row.action
  }));
};

export const auditDetailReport = async filters => {
  const query = AppDataSource.getRepository('AuditTrailLog').createQueryBuilder('a')
    .select('a.id', 'auditId').addSelect('a.createdAt', 'createdAt').addSelect('a.userId', 'userId').addSelect('a.tableName', 'module')
    .addSelect('a.action', 'action').addSelect('a.recordId', 'recordId')
    .addSelect('a.oldValues', 'oldValues').addSelect('a.newValues', 'newValues')
    .orderBy('a.createdAt', 'DESC');
  if (filters.auditId) query.andWhere('a.id = :auditId', { auditId: Number(filters.auditId) });
  else if (filters.recordId) query.andWhere('a.recordId = :recordId', { recordId: filters.recordId });
  if (filters.module) query.andWhere('a.tableName = :module', { module: filters.module });
  limitRows(query, filters, 20);
  return (await query.getRawMany()).map(row => ({
    ...numberize(row, ['auditId', 'userId']),
    objectName: auditObjects[row.module] ?? row.module,
    actionName: auditActions[row.action] ?? row.action,
    oldValues: truncateText(row.oldValues),
    newValues: truncateText(row.newValues)
  }));
};
