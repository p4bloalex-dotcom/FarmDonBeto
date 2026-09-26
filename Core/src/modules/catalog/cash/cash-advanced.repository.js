import { AppDataSource } from '../../../config/data-source.js';
import { registerAuditEvent } from '../../security/audit/audit-event.service.js';
import { createOrder, getAvailability } from '../customer-orders/customer-order.repository.js';

export class CashAdvancedRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CashAdvancedRuleError';
  }
}

const toNumber = value => Number(value ?? 0);

export const cashCentralDashboard = async () => {
  const rows = await AppDataSource.getRepository('Branch').createQueryBuilder('b')
    .leftJoin('CashSession', 's', 's.branchId = b.id AND s.status = :openStatus')
    .leftJoin('CashRegister', 'r', 'r.id = s.cashRegisterId')
    .leftJoin('CashMovement', 'm', 'm.cashSessionId = s.id AND m.status = :enabled')
    .leftJoin('CashMovementType', 't', 't.id = m.movementTypeId')
    .select('b.id', 'branchId')
    .addSelect('b.name', 'branchName')
    .addSelect('COUNT(DISTINCT s.id)', 'openSessions')
    .addSelect('COALESCE(SUM(CASE WHEN t.operation = :income THEN m.amount WHEN t.operation = :expense THEN (0 - m.amount) ELSE 0 END), 0) + COALESCE(SUM(DISTINCT s.openingAmount), 0)', 'expectedCash')
    .addSelect('COALESCE(SUM(CASE WHEN m.referenceType = :withdrawal THEN m.amount ELSE 0 END), 0)', 'withdrawals')
    .addSelect('COUNT(CASE WHEN r.cashLimit IS NOT NULL AND s.id IS NOT NULL THEN 1 END)', 'limitedSessions')
    .where('b.status = :enabled')
    .groupBy('b.id')
    .addGroupBy('b.name')
    .setParameters({ openStatus: 'A', enabled: 'E', income: 'I', expense: 'E', withdrawal: 'VAULT_TRANSFER' })
    .orderBy('b.name', 'ASC')
    .getRawMany();

  const pendingClosures = await AppDataSource.getRepository('CashSession').createQueryBuilder('s')
    .where('s.status = :status', { status: 'A' })
    .andWhere('s.openingDate < :limit', { limit: new Date(Date.now() - 12 * 60 * 60 * 1000) })
    .getCount();

  const differences = await AppDataSource.getRepository('CashSession').createQueryBuilder('s')
    .select('COALESCE(SUM(s.differenceAmount), 0)', 'total')
    .where('s.status = :status', { status: 'C' })
    .andWhere('s.differenceAmount <> 0')
    .getRawOne();

  return {
    branches: rows.map(row => ({
      branchId: toNumber(row.branchId),
      branchName: row.branchName,
      openSessions: toNumber(row.openSessions),
      expectedCash: toNumber(row.expectedCash),
      withdrawals: toNumber(row.withdrawals),
      limitedSessions: toNumber(row.limitedSessions)
    })),
    pendingClosures,
    differenceTotal: toNumber(differences?.total)
  };
};

export const cashAlerts = async () => {
  const dashboard = await cashCentralDashboard();
  const alerts = [];
  for (const branch of dashboard.branches) {
    if (branch.openSessions > 0 && branch.expectedCash > 0) alerts.push({ type: 'OPEN_CASH', severity: 'INFO', branchId: branch.branchId, message: `${branch.branchName} tiene ${branch.openSessions} caja(s) abierta(s).` });
  }
  if (dashboard.pendingClosures > 0) alerts.push({ type: 'PENDING_CLOSURE', severity: 'WARN', message: `${dashboard.pendingClosures} caja(s) abiertas por mas de 12 horas.` });
  if (Math.abs(dashboard.differenceTotal) > 0) alerts.push({ type: 'DIFFERENCE', severity: 'WARN', message: `Diferencias acumuladas: Q ${dashboard.differenceTotal.toFixed(2)}.` });
  return alerts;
};

export const reconcileSession = async (sessionId, items, userId = null) => AppDataSource.transaction(async manager => {
  const session = await manager.getRepository('CashSession').findOneBy({ id: sessionId });
  if (!session) throw new CashAdvancedRuleError('La sesion de caja no existe.');
  const paymentRows = await manager.getRepository('SalePayment').createQueryBuilder('p')
    .select('p.method', 'method')
    .addSelect('COALESCE(SUM(p.amount), 0)', 'amount')
    .where('p.branchId = :branchId', { branchId: session.branchId })
    .andWhere('p.createdAt >= :start', { start: session.openingDate })
    .andWhere(session.closingDate ? 'p.createdAt <= :end' : '1=1', { end: session.closingDate })
    .groupBy('p.method')
    .getRawMany();
  const systemByMethod = new Map(paymentRows.map(row => [row.method, toNumber(row.amount)]));
  await manager.getRepository('CashReconciliation').delete({ cashSessionId: session.id });
  const saved = [];
  for (const item of items) {
    const systemAmount = systemByMethod.get(String(item.method).toUpperCase()) ?? 0;
    const declaredAmount = toNumber(item.declaredAmount);
    const row = await manager.getRepository('CashReconciliation').save(manager.getRepository('CashReconciliation').create({
      cashSessionId: session.id,
      branchId: session.branchId,
      method: String(item.method).toUpperCase(),
      systemAmount,
      declaredAmount,
      differenceAmount: Math.round((declaredAmount - systemAmount) * 100) / 100,
      notes: item.notes || null,
      authorizedBy: item.authorizedBy ?? null,
      status: 'E',
      createdBy: userId
    }));
    saved.push(row);
  }
  await registerAuditEvent(manager, { tableName: 'TB_CASH_RECONCILIATION', action: 'CASH_RECONCILIATION', recordId: session.id, userId, newValues: { sessionId, items: saved } });
  return saved;
});

export const createSaleReturn = async (data, userId = null) => AppDataSource.transaction(async manager => {
  const sale = await manager.getRepository('Sale').findOneBy({ id: data.saleId, status: 'E' });
  if (!sale) throw new CashAdvancedRuleError('La venta original no existe o no esta activa.');
  const session = await manager.getRepository('CashSession').findOneBy({ id: data.cashSessionId, branchId: sale.branchId, status: 'A' });
  if (!session) throw new CashAdvancedRuleError('Debe existir una caja abierta de la misma sucursal para registrar la devolucion.');
  if (!data.reason) throw new CashAdvancedRuleError('Toda devolucion debe tener motivo.');
  if (!data.authorizedBy) throw new CashAdvancedRuleError('Toda devolucion requiere autorizacion.');
  const normalized = [];
  for (const detail of data.details) {
    const saleDetail = await manager.getRepository('SaleDetail').findOneBy({ id: detail.saleDetailId, saleId: sale.id, medicineId: detail.medicineId, status: 'E' });
    if (!saleDetail) throw new CashAdvancedRuleError('Uno de los productos no pertenece a la venta original.');
    if (toNumber(detail.quantity) > toNumber(saleDetail.quantity)) throw new CashAdvancedRuleError('La cantidad devuelta no puede superar la cantidad vendida.');
    const total = Math.round(toNumber(detail.quantity) * toNumber(saleDetail.unitPrice) * 100) / 100;
    normalized.push({ ...detail, unitPrice: toNumber(saleDetail.unitPrice), total });
  }
  const total = Math.round(normalized.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const saleReturn = await manager.getRepository('SaleReturn').save(manager.getRepository('SaleReturn').create({ saleId: sale.id, branchId: sale.branchId, cashSessionId: session.id, returnDate: new Date(), reason: data.reason, refundMethod: data.refundMethod, total, authorizedBy: data.authorizedBy, status: 'E', createdBy: userId }));
  await manager.getRepository('SaleReturnDetail').save(normalized.map(item => manager.getRepository('SaleReturnDetail').create({ saleReturnId: saleReturn.id, branchId: sale.branchId, saleDetailId: item.saleDetailId, medicineId: item.medicineId, quantity: item.quantity, unitPrice: item.unitPrice, total: item.total, restockInventory: item.restockInventory !== false, status: 'E', createdBy: userId })));
  for (const item of normalized.filter(row => row.restockInventory !== false)) {
    const stock = await manager.getRepository('Inventory').findOneBy({ branchId: sale.branchId, medicineId: item.medicineId });
    if (stock) {
      stock.stockAvailable = toNumber(stock.stockAvailable) + toNumber(item.quantity);
      await manager.getRepository('Inventory').save(stock);
    }
  }
  if (String(data.refundMethod).toUpperCase() === 'CASH') {
    const movementType = await manager.getRepository('CashMovementType').findOneBy({ code: 'RETURN', status: 'E' }) ?? await manager.getRepository('CashMovementType').findOneBy({ operation: 'E', status: 'E' });
    if (!movementType) throw new CashAdvancedRuleError('No existe tipo de movimiento para devoluciones.');
    await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({ cashSessionId: session.id, branchId: sale.branchId, movementTypeId: movementType.id, amount: total, description: `Devolucion venta #${sale.id}`, referenceId: saleReturn.id, referenceType: 'RETURN', authorizedBy: data.authorizedBy, movementDate: new Date(), status: 'E', createdBy: userId }));
  }
  await registerAuditEvent(manager, { tableName: 'TB_SALE_RETURN', action: 'SALE_RETURN', recordId: saleReturn.id, userId, newValues: { ...data, total } });
  return saleReturn;
});

export const createCallCenterOrder = async (data, userId = null) => {
  const id = await createOrder(data, userId);
  await AppDataSource.transaction(async manager => registerAuditEvent(manager, { tableName: 'TB_CUSTOMER_ORDER', action: 'CALL_CENTER_ORDER', recordId: id, userId, newValues: data }));
  return id;
};

export const callCenterAvailability = async data => getAvailability(data);
