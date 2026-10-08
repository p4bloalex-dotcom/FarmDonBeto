import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from '../inventory/inventory-kardex.service.js';
import { addLotStock } from '../inventory/inventory-lot.service.js';
import { createFinancialMovement } from '../treasury/treasury.repository.js';
import { calculateReceiptLine, determineInvoiceMatching } from './purchase-flow.js';

const purchases = () => AppDataSource.getRepository('Purchase');
const details = () => AppDataSource.getRepository('PurchaseDetail');
const purchaseOrderMarker = purchaseId => `[PURCHASE_ORDER:${purchaseId}]`;
const purchaseOrderDetailMarker = (purchaseId, detailId) => `[PURCHASE_ORDER_DETAIL:${purchaseId}:${detailId}]`;
const purchaseRequestDetailMarker = detailId => `[PURCHASE_REQUEST_DETAIL:${detailId}]`;
const orderedDetailIdsFromNotes = notes => [
  ...String(notes ?? '').matchAll(/\[PURCHASE_REQUEST_DETAIL:(\d+)\]/g),
  ...String(notes ?? '').matchAll(/\[PURCHASE_ORDER_DETAIL:\d+:(\d+)\]/g)
].map(match => Number(match[1])).filter(Boolean);
const purchaseDetailIdsFromNotes = (notes, purchaseId) => [...String(notes ?? '').matchAll(new RegExp(`\\[PURCHASE_ORDER_DETAIL:${purchaseId}:(\\d+)\\]`, 'g'))].map(match => Number(match[1])).filter(Boolean);

const appendNote = (notes, addition) => [notes, addition].filter(Boolean).join(' | ').slice(0, 1000);

const setGlobalRlsContext = async runner => {
  try {
    await runner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain, :isGlobal); END;', [null, 0, 1]);
  } catch (error) {
    if (error?.errorNum !== 6550 && error?.driverError?.errorNum !== 6550) throw error;
    await runner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain); END;', [null, 1]);
  }
};

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.business = true;
  }
}

const toDetailDto = item => ({
  id: item.id,
  purchaseId: item.purchaseId,
  purchase_id: item.purchaseId,
  medicineId: item.medicineId,
  medicine_id: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  quantity: Number(item.quantity ?? 0),
  quantityOrdered: Number(item.quantityOrdered ?? item.quantity ?? 0),
  quantityReceived: Number(item.quantityReceived ?? 0),
  quantityRejected: Number(item.quantityRejected ?? 0),
  quantityPending: Number(item.quantityPending ?? Math.max(0, Number(item.quantity ?? 0) - Number(item.quantityReceived ?? 0))),
  unitPrice: Number(item.unitPrice ?? 0),
  unit_price: Number(item.unitPrice ?? 0),
  subtotal: Number(item.subtotal ?? 0),
  lotNumber: item.lotNumber ?? null,
  expirationDate: item.expirationDate ?? null
});

const toDto = item => ({
  id: item.id,
  purchaseNumber: item.purchaseNumber ?? null,
  supplierId: item.supplierId,
  supplier_id: item.supplierId,
  supplierName: item.supplier?.name ?? null,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  purchaseDate: item.purchaseDate,
  invoiceNumber: item.invoiceNumber,
  subtotal: Number(item.subtotal ?? 0),
  tax: Number(item.tax ?? 0),
  total: Number(item.total ?? 0),
  itemsCount: Number(item.itemsCount ?? 0),
  status: item.status
});

export const findLatestSupplierInvoice = async purchaseId => AppDataSource.getRepository('SupplierInvoice')
  .createQueryBuilder('invoice')
  .where('invoice.purchaseId = :purchaseId', { purchaseId })
  .orderBy('invoice.createdAt', 'DESC')
  .addOrderBy('invoice.id', 'DESC')
  .getOne();

const detailQuery = () => details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name']);

export const listPurchaseDetails = async purchaseId => {
  const rows = await detailQuery()
    .where('item.purchaseId = :purchaseId', { purchaseId })
    .orderBy('item.id', 'ASC')
    .getMany();
  return rows.map(toDetailDto);
};

const queryBase = () => purchases().createQueryBuilder('item')
  .leftJoin('item.supplier', 'supplier')
  .addSelect(['supplier.id', 'supplier.name'])
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name'])
  .addSelect((subQuery) => subQuery
    .select('COUNT(detail.id)', 'itemsCount')
    .from('PurchaseDetail', 'detail')
    .where('detail.purchaseId = item.id'), 'itemsCount');

const mapRowsWithCounts = result => result.entities.map((item, index) => toDto({ ...item, itemsCount: result.raw[index]?.itemsCount ?? result.raw[index]?.ITEMSCOUNT ?? 0 }));

export const findPurchaseById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const findPurchaseByInvoice = async (supplierId, invoiceNumber, excludeId = null) => {
  const query = purchases().createQueryBuilder('item')
    .where('item.supplierId = :supplierId', { supplierId })
    .andWhere('item.invoiceNumber = :invoiceNumber', { invoiceNumber })
    .andWhere('item.status <> :inactive', { inactive: 'I' });
  if (excludeId) {
    query.andWhere('item.id <> :excludeId', { excludeId });
  }
  return query.getOne();
};

export const listPurchases = async () => {
  const result = await queryBase()
    .where('item.status <> :inactive', { inactive: 'I' })
    .orderBy('item.purchaseDate', 'DESC')
    .getRawAndEntities();
  return mapRowsWithCounts(result);
};

export const paginatePurchases = async ({ offset, pageSize }) => {
  const query = queryBase()
    .orderBy('item.purchaseDate', 'DESC')
    .skip(offset)
    .take(pageSize);
  const [result, total] = await Promise.all([query.getRawAndEntities(), query.getCount()]);
  return { rows: mapRowsWithCounts(result), total };
};

export const countDetails = async purchaseId => details().countBy({ purchaseId });

export const hasCashMovement = async (purchaseId, excludeStatus = null) => {
  const query = AppDataSource.getRepository('CashMovement')
    .createQueryBuilder('item')
    .where('item.referenceType = :referenceType', { referenceType: 'PURCHASE' })
    .andWhere('item.referenceId = :purchaseId', { purchaseId });
  if (excludeStatus) {
    query.andWhere('item.status <> :excludeStatus', { excludeStatus });
  }
  return (await query.getCount()) > 0;
};

export const hasFinancialMovement = async purchaseId => (await AppDataSource.getRepository('FinancialMovement')
  .createQueryBuilder('item')
  .where('item.referenceType = :referenceType', { referenceType: 'PURCHASE' })
  .andWhere('item.referenceId = :purchaseId', { purchaseId })
  .andWhere('item.status = :status', { status: 'E' })
  .getCount()) > 0;

export const findOpenSessionByBranch = async branchId => AppDataSource.getRepository('CashSession')
  .findOneBy({ branchId, status: 'A' });

export const createPurchaseWithDetails = async (headerData, detailData, movement = null) => AppDataSource.transaction(async manager => {
  const purchaseRepo = manager.getRepository('Purchase');
  const saved = await purchaseRepo.save(purchaseRepo.create(headerData));

  const detailRepo = manager.getRepository('PurchaseDetail');
  const rows = detailData.map(detail => detailRepo.create({ purchaseId: saved.id, ...detail }));
  await detailRepo.save(rows);

  const inventoryRepo = manager.getRepository('Inventory');
  for (const detail of detailData) {
    let stock = await inventoryRepo.findOneBy({ medicineId: detail.medicineId, branchId: headerData.branchId });
    if (!stock) {
      stock = inventoryRepo.create({
        medicineId: detail.medicineId,
        branchId: headerData.branchId,
        stockAvailable: detail.quantity,
        reserve: 0,
        stockMin: 0,
        stockMax: 0
      });
    } else {
      stock.stockAvailable = Number(stock.stockAvailable ?? 0) + detail.quantity;
    }
    await inventoryRepo.save(stock);
    await addLotStock(manager, { branchId: headerData.branchId, medicineId: detail.medicineId, lotNumber: detail.lotNumber, expirationDate: detail.expirationDate, quantity: detail.quantity, userId: headerData.createdBy ?? null });
    await registerKardex(manager, { branchId: headerData.branchId, medicineId: detail.medicineId, movementType: 'PURCHASE', quantityIn: detail.quantity, balanceAfter: Number(stock.stockAvailable ?? 0), unitCost: detail.unitPrice, referenceType: 'PURCHASE', referenceId: saved.id });
  }

  if (movement) {
    const movementRepo = manager.getRepository('CashMovement');
    await movementRepo.save(movementRepo.create({
      cashSessionId: movement.cashSessionId,
      branchId: headerData.branchId,
      movementTypeId: movement.movementTypeId,
      amount: movement.amount,
      description: movement.description,
      referenceId: saved.id,
      referenceType: 'PURCHASE',
      movementDate: movement.movementDate,
      status: 'E'
    }));
    await createFinancialMovement(manager, {
      cashSessionId: movement.cashSessionId,
      branchId: headerData.branchId,
      sourceType: 'CASH_SESSION',
      operation: 'S',
      amount: movement.amount,
      description: movement.description,
      referenceId: saved.id,
      referenceType: 'PURCHASE',
      movementDate: movement.movementDate
    }, headerData.createdBy ?? null);
  } else if (['BANK', 'CASH_FUND'].includes(headerData.paymentSourceType)) {
    await createFinancialMovement(manager, {
      financialAccountId: headerData.financialAccountId,
      branchId: headerData.branchId,
      sourceType: headerData.paymentSourceType,
      operation: 'S',
      amount: headerData.total,
      description: `Compra - Factura ${headerData.invoiceNumber}`,
      referenceId: saved.id,
      referenceType: 'PURCHASE',
      movementDate: headerData.purchaseDate
    }, headerData.createdBy ?? null);
  }

  return saved.id;
});

export const updatePurchaseWithDetails = async (id, headerData, detailData) => AppDataSource.transaction(async manager => {
  const purchaseRepo = manager.getRepository('Purchase');
  const detailRepo = manager.getRepository('PurchaseDetail');
  const inventoryRepo = manager.getRepository('Inventory');

  const oldDetails = await detailRepo.findBy({ purchaseId: id });
  const oldByMedicine = new Map(oldDetails.map(detail => [detail.medicineId, Number(detail.quantity ?? 0)]));
  const newByMedicine = new Map(detailData.map(detail => [detail.medicineId, Number(detail.quantity)]));

  const medicineIds = new Set([...oldByMedicine.keys(), ...newByMedicine.keys()]);
  for (const medicineId of medicineIds) {
    const delta = (newByMedicine.get(medicineId) ?? 0) - (oldByMedicine.get(medicineId) ?? 0);
    if (delta === 0) continue;

    const stock = await inventoryRepo.findOneBy({ medicineId, branchId: headerData.branchId });
    if (!stock) {
      throw new BusinessRuleError('No se encontro inventario para uno de los medicamentos. Revise los datos.');
    }
    const nextStock = Number(stock.stockAvailable ?? 0) + delta;
    if (nextStock < 0) {
      throw new BusinessRuleError('La cantidad ajustada supera el stock disponible del medicamento.');
    }
    stock.stockAvailable = nextStock;
    await inventoryRepo.save(stock);
    await registerKardex(manager, { branchId: headerData.branchId, medicineId, movementType: 'PURCHASE_EDIT', quantityIn: delta > 0 ? delta : 0, quantityOut: delta < 0 ? Math.abs(delta) : 0, balanceAfter: nextStock, referenceType: 'PURCHASE', referenceId: id });
  }

  await detailRepo.delete({ purchaseId: id });
  const rows = detailData.map(detail => detailRepo.create({ purchaseId: id, ...detail }));
  await detailRepo.save(rows);

  await purchaseRepo.update(id, headerData);
});

export const deletePurchaseWithDetails = async (id, branchId) => AppDataSource.transaction(async manager => {
  const purchaseRepo = manager.getRepository('Purchase');
  const detailRepo = manager.getRepository('PurchaseDetail');
  const inventoryRepo = manager.getRepository('Inventory');

  const existingDetails = await detailRepo.findBy({ purchaseId: id });
  for (const detail of existingDetails) {
    const stock = await inventoryRepo.findOneBy({ medicineId: detail.medicineId, branchId });
    if (!stock) {
      throw new BusinessRuleError('No se encontro inventario para reversar la compra.');
    }
    const nextStock = Number(stock.stockAvailable ?? 0) - Number(detail.quantity ?? 0);
    if (nextStock < 0) {
      throw new BusinessRuleError('No se puede eliminar la compra porque el stock ya fue consumido.');
    }
    stock.stockAvailable = nextStock;
    await inventoryRepo.save(stock);
    await registerKardex(manager, { branchId, medicineId: detail.medicineId, movementType: 'PURCHASE_DELETE', quantityOut: Number(detail.quantity ?? 0), balanceAfter: nextStock, referenceType: 'PURCHASE', referenceId: id, reason: 'Reversa por eliminacion de compra' });
  }

  await detailRepo.delete({ purchaseId: id });
  await purchaseRepo.delete(id);
});

export const deletePurchaseOrderDraft = async id => AppDataSource.transaction(async manager => {
  await manager.getRepository('PurchaseDetail').delete({ purchaseId: id });
  await manager.getRepository('Purchase').delete(id);
});

const nextNumber = prefix => `${prefix}-${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;

export const createPurchaseRequest = async payload => AppDataSource.transaction(async manager => {
  const repo = manager.getRepository('PurchaseRequest');
  const saved = await repo.save(repo.create({
    requestNumber: payload.requestNumber || nextNumber('REQ'),
    branchId: payload.branchId,
    warehouseId: payload.warehouseId ?? payload.branchId,
    requestedBy: payload.requestedBy ?? payload.userId ?? null,
    requiredDate: payload.requiredDate ? new Date(payload.requiredDate) : null,
    priority: payload.priority || 'NORMAL',
    reason: payload.reason || null,
    source: payload.source || 'MANUAL',
    status: payload.status || 'SUBMITTED',
    notes: payload.notes || null,
    createdBy: payload.userId ?? null
  }));
  const detailRepo = manager.getRepository('PurchaseRequestDetail');
  const rows = (payload.details || []).map(detail => detailRepo.create({
    requestId: saved.id,
    branchId: payload.branchId,
    medicineId: detail.medicineId,
    unitOfMeasureId: detail.unitOfMeasureId ?? null,
    currentStock: detail.currentStock ?? 0,
    availableStock: detail.availableStock ?? 0,
    minimumStock: detail.minimumStock ?? 0,
    maximumStock: detail.maximumStock ?? 0,
    averageConsumption: detail.averageConsumption ?? 0,
    suggestedQuantity: detail.suggestedQuantity ?? detail.requestedQuantity,
    requestedQuantity: detail.requestedQuantity ?? detail.quantity
  }));
  if (rows.length) await detailRepo.save(rows);
  return saved.id;
});

export const listPurchaseRequests = async () => {
  const rows = await AppDataSource.getRepository('PurchaseRequest')
    .createQueryBuilder('item')
    .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .orderBy('item.createdAt', 'DESC')
    .getMany();
  const detailRepo = AppDataSource.getRepository('PurchaseRequestDetail');
  return Promise.all(rows.map(async item => {
    const orderedDetailIds = new Set(orderedDetailIdsFromNotes(item.notes));
    const rawDetails = await detailRepo.createQueryBuilder('detail')
      .leftJoin('detail.medicine', 'medicine')
      .addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
      .where('detail.requestId = :requestId', { requestId: item.id })
      .orderBy('detail.id', 'ASC')
      .getMany();
    const visibleDetails = rawDetails.filter(detail => !orderedDetailIds.has(Number(detail.id)));
    return {
      id: item.id,
      requestNumber: item.requestNumber,
      branchId: item.branchId,
      branchName: item.branch?.name ?? null,
      requestDate: item.requestDate,
      requiredDate: item.requiredDate,
      priority: item.priority,
      reason: item.reason,
      source: item.source,
      status: item.status,
      notes: item.notes,
      createdAt: item.createdAt,
      details: visibleDetails.map(detail => ({
        id: detail.id,
        requestId: detail.requestId,
        branchId: detail.branchId,
        medicineId: detail.medicineId,
        medicineName: detail.medicine?.name ?? null,
        medicineCode: detail.medicine?.code ?? null,
        requestedQuantity: Number(detail.requestedQuantity ?? 0),
        suggestedQuantity: Number(detail.suggestedQuantity ?? detail.requestedQuantity ?? 0)
      }))
    };
  }));
};

export const checkNetworkAvailability = async (medicineId, targetBranchId, requestedQuantity) => {
  const runner = AppDataSource.createQueryRunner();
  runner.__branchRlsApplied = true;
  await runner.connect();
  try {
    await setGlobalRlsContext(runner);
    const targetRows = await runner.query('SELECT ID, NAME, LATITUDE, LONGITUDE FROM TB_BRANCH WHERE ID = :branchId', [targetBranchId]);
    const target = targetRows?.[0] ?? {};
    const rows = await runner.query(`
      SELECT
        I.BRANCH_ID,
        B.NAME BRANCH_NAME,
        B.ADDRESS,
        B.LATITUDE,
        B.LONGITUDE,
        I.STOCK_AVAILABLE,
        I.RESERVE,
        I.STOCK_MIN,
        (I.STOCK_AVAILABLE - I.RESERVE - I.STOCK_MIN) TRANSFERABLE
      FROM TB_INVENTORY I
      INNER JOIN TB_BRANCH B ON B.ID = I.BRANCH_ID
      WHERE I.MEDICINE_ID = :medicineId
        AND I.BRANCH_ID <> :targetBranchId
        AND B.STATUS = 'E'
        AND (I.STOCK_AVAILABLE - I.RESERVE - I.STOCK_MIN) > 0
    `, [medicineId, targetBranchId]);

    const distanceKm = row => {
      const lat1 = Number(target.LATITUDE ?? target.latitude);
      const lon1 = Number(target.LONGITUDE ?? target.longitude);
      const lat2 = Number(row.LATITUDE ?? row.latitude);
      const lon2 = Number(row.LONGITUDE ?? row.longitude);
      if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
      const toRad = value => value * Math.PI / 180;
      const r = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return Math.round((r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 10) / 10;
    };

    let pending = Number(requestedQuantity ?? 0);
    const suggestions = rows.map(row => ({
      branchId: Number(row.BRANCH_ID ?? row.branch_id),
      branchName: row.BRANCH_NAME ?? row.branch_name,
      address: row.ADDRESS ?? row.address ?? null,
      stockAvailable: Number(row.STOCK_AVAILABLE ?? row.stock_available ?? 0),
      reserve: Number(row.RESERVE ?? row.reserve ?? 0),
      stockMin: Number(row.STOCK_MIN ?? row.stock_min ?? 0),
      transferable: Number(row.TRANSFERABLE ?? row.transferable ?? 0),
      distanceKm: distanceKm(row)
    })).sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999) || b.transferable - a.transferable).map(row => {
      const suggested = Math.min(row.transferable, pending);
      pending -= suggested;
      return { ...row, suggested };
    }).filter(row => row.suggested > 0);

    return { canTransfer: pending <= 0, requestedQuantity: Number(requestedQuantity ?? 0), pendingExternalPurchase: Math.max(0, pending), targetBranch: { id: targetBranchId, name: target.NAME ?? target.name ?? null }, suggestions };
  } finally {
    await runner.release();
  }
};

export const approvePurchase = async (id, { approvedBy = null, comments = null } = {}) => {
  await purchases().update(id, { status: 'APPROVED', approvedBy, approvedAt: new Date(), notes: comments ?? undefined });
};

const createFulfillmentDeliveryRequests = async (manager, purchase, purchaseDetails) => {
  const requestRepo = manager.getRepository('PurchaseRequest');
  const requestDetailRepo = manager.getRepository('PurchaseRequestDetail');
  const deliveryRepo = manager.getRepository('DeliveryRequest');
  const deliveryDetailRepo = manager.getRepository('DeliveryRequestDetail');
  const marker = purchaseOrderMarker(purchase.id);
  const query = requestRepo.createQueryBuilder('request')
    .where('request.notes LIKE :marker', { marker: `%${marker}%` });

  if (purchase.purchaseRequestId) {
    query.orWhere('request.id = :requestId', { requestId: purchase.purchaseRequestId });
  }

  const requests = await query.orderBy('request.id', 'ASC').getMany();
  if (!requests.length) return [];

  const requestIds = requests.map(request => request.id);
  const detailIdsForPurchase = new Set(requests.flatMap(request => purchaseDetailIdsFromNotes(request.notes, purchase.id)));
  const requestDetails = await requestDetailRepo.createQueryBuilder('detail')
    .where('detail.requestId IN (:...requestIds)', { requestIds })
    .orderBy('detail.requestId', 'ASC')
    .addOrderBy('detail.id', 'ASC')
    .getMany();

  const availableByMedicine = new Map();
  const unitCostByMedicine = new Map();
  purchaseDetails.forEach(detail => {
    const medicineId = Number(detail.medicineId);
    const accepted = Math.max(0, Number(detail.quantityReceived ?? 0) - Number(detail.quantityRejected ?? 0));
    availableByMedicine.set(medicineId, (availableByMedicine.get(medicineId) ?? 0) + accepted);
    if (!unitCostByMedicine.has(medicineId)) unitCostByMedicine.set(medicineId, Number(detail.unitPrice ?? 0));
  });

  const requestById = new Map(requests.map(request => [request.id, request]));
  const groups = new Map();

  for (const detail of requestDetails) {
    if (detailIdsForPurchase.size && !detailIdsForPurchase.has(Number(detail.id))) continue;
    const request = requestById.get(detail.requestId);
    if (!request || Number(request.branchId) === Number(purchase.branchId)) continue;

    const medicineId = Number(detail.medicineId);
    const available = Number(availableByMedicine.get(medicineId) ?? 0);
    const requested = Number(detail.requestedQuantity ?? detail.suggestedQuantity ?? 0);
    const quantity = Math.min(requested, available);
    if (quantity <= 0) continue;

    availableByMedicine.set(medicineId, available - quantity);
    const group = groups.get(request.branchId) ?? {
      requestingBranchId: request.branchId,
      fulfillmentBranchId: purchase.branchId,
      requestedAt: new Date(),
      notes: `Abastecimiento automatico desde compra ${purchase.purchaseNumber ?? `#${purchase.id}`}`,
      details: []
    };
    group.details.push({ medicineId, quantity, unitCost: unitCostByMedicine.get(medicineId) ?? 0 });
    groups.set(request.branchId, group);
  }

  const created = [];
  for (const group of groups.values()) {
    const saved = await deliveryRepo.save(deliveryRepo.create({
      requestingBranchId: group.requestingBranchId,
      fulfillmentBranchId: group.fulfillmentBranchId,
      requestedAt: group.requestedAt,
      notes: group.notes,
      status: 'P'
    }));
    await deliveryDetailRepo.save(group.details.map(detail => deliveryDetailRepo.create({ requestId: saved.id, ...detail })));
    created.push(saved.id);
  }

  await requestRepo.save(requests.map(request => ({
    ...request,
    status: 'FULFILLMENT_REQUESTED',
    notes: appendNote(request.notes, `Traslado automatico generado desde compra ${purchase.purchaseNumber ?? `#${purchase.id}`}`)
  })));

  return created;
};

export const createPurchaseOrder = async payload => AppDataSource.transaction(async manager => {
  const purchaseRepo = manager.getRepository('Purchase');
  const detailsData = payload.details || [];
  if (!detailsData.length) throw new BusinessRuleError('La orden requiere al menos un producto.');

  for (const [index, detail] of detailsData.entries()) {
    const quantity = Number(detail.quantityOrdered ?? detail.quantity ?? 0);
    const unitPrice = Number(detail.unitPrice ?? 0);
    if (!detail.medicineId) throw new BusinessRuleError(`La linea ${index + 1} no tiene medicamento seleccionado.`);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new BusinessRuleError(`La cantidad de la linea ${index + 1} debe ser mayor a cero.`);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new BusinessRuleError(`El precio de la linea ${index + 1} no puede ser negativo.`);
  }

  const subtotal = Number(payload.subtotal ?? detailsData.reduce((sum, detail) => sum + (Number(detail.quantityOrdered ?? detail.quantity ?? 0) * Number(detail.unitPrice ?? 0)), 0));
  const total = Number(payload.total ?? subtotal - Number(payload.discount ?? 0) + Number(payload.tax ?? 0) + Number(payload.shippingCost ?? 0) + Number(payload.otherCharges ?? 0));
  if (!Number.isFinite(subtotal) || subtotal < 0) throw new BusinessRuleError('El subtotal de la orden no es valido.');
  if (!Number.isFinite(total) || total < 0) throw new BusinessRuleError('El total de la orden no es valido.');
  const saved = await purchaseRepo.save(purchaseRepo.create({
    supplierId: payload.supplierId,
    branchId: payload.branchId,
    warehouseId: payload.warehouseId ?? payload.branchId,
    purchaseRequestId: payload.purchaseRequestId ?? (Array.isArray(payload.purchaseRequestIds) ? Number(payload.purchaseRequestIds[0] ?? 0) || null : null),
    quotationId: payload.quotationId ?? null,
    purchaseNumber: payload.purchaseNumber || nextNumber('PO'),
    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : new Date(),
    expectedDeliveryDate: payload.expectedDeliveryDate ? new Date(payload.expectedDeliveryDate) : null,
    invoiceNumber: payload.invoiceNumber ?? null,
    currencyId: payload.currencyId ?? null,
    exchangeRate: payload.exchangeRate ?? 1, 
    subtotal,
    discount: payload.discount ?? 0,
    tax: payload.tax ?? 0,
    shippingCost: payload.shippingCost ?? 0,
    otherCharges: payload.otherCharges ?? 0,
    total,
    deliveryTerms: payload.deliveryTerms ?? null,
    status: payload.status || 'PENDING_APPROVAL',
    notes: payload.notes ?? null,
    createdBy: payload.userId ?? null
  }));
  const detailRepo = manager.getRepository('PurchaseDetail');
  const rows = detailsData.map(detail => {
    const quantity = Number(detail.quantityOrdered ?? detail.quantity ?? 0);
    const lineSubtotal = Number(detail.subtotal ?? quantity * Number(detail.unitPrice ?? 0));
    return detailRepo.create({
      purchaseId: saved.id,
      medicineId: detail.medicineId,
      quantity,
      quantityOrdered: quantity,
      quantityReceived: 0,
      quantityPending: quantity,
      quantityRejected: 0,
      unitOfMeasureId: detail.unitOfMeasureId ?? null,
      unitPrice: detail.unitPrice ?? 0,
      discountPercentage: detail.discountPercentage ?? 0,
      discountAmount: detail.discountAmount ?? 0,
      taxPercentage: detail.taxPercentage ?? 0,
      taxAmount: detail.taxAmount ?? 0,
      subtotal: lineSubtotal,
      total: detail.total ?? lineSubtotal,
      expectedDeliveryDate: detail.expectedDeliveryDate ? new Date(detail.expectedDeliveryDate) : null,
      status: 'ORDERED'
    });
  });
  if (rows.length) await detailRepo.save(rows);
  if (Array.isArray(payload.purchaseRequestIds) && payload.purchaseRequestIds.length) {
    const marker = purchaseOrderMarker(saved.id);
    const requestRepo = manager.getRepository('PurchaseRequest');
    const requestDetailRepo = manager.getRepository('PurchaseRequestDetail');
    const requestIds = [...new Set(payload.purchaseRequestIds.map(Number).filter(Boolean))];
    const selectedDetailIds = new Set((payload.purchaseRequestDetailIds ?? []).map(Number).filter(Boolean));
    const requests = await requestRepo.createQueryBuilder('request')
      .where('request.id IN (:...requestIds)', { requestIds })
      .getMany();

    for (const request of requests) {
      const requestDetails = await requestDetailRepo.findBy({ requestId: request.id });
      const currentOrderDetailIds = requestDetails.filter(detail => selectedDetailIds.has(Number(detail.id))).map(detail => Number(detail.id));
      const orderedDetailIds = new Set([...orderedDetailIdsFromNotes(request.notes), ...currentOrderDetailIds]);
      const detailMarkers = currentOrderDetailIds.map(detailId => `${purchaseRequestDetailMarker(detailId)} ${purchaseOrderDetailMarker(saved.id, detailId)}`).join(' ');
      const allDetailsOrdered = requestDetails.length > 0 && requestDetails.every(detail => orderedDetailIds.has(Number(detail.id)));
      await requestRepo.update(request.id, {
        status: allDetailsOrdered ? 'ORDERED' : request.status,
        notes: appendNote(request.notes ?? 'Consolidada parcialmente en orden de compra', `${marker} ${detailMarkers}`.trim())
      });
    }
  }
  return saved.id;
});

export const receivePurchase = async payload => AppDataSource.transaction(async manager => {
  const purchase = await manager.getRepository('Purchase').findOneBy({ id: payload.purchaseId });
  if (!purchase) throw new BusinessRuleError('La orden de compra indicada no existe.');
  if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(purchase.status)) {
    throw new BusinessRuleError(`La orden no puede recibirse porque esta en estado ${purchase.status}. Debe estar aprobada o parcialmente recibida.`);
  }

  const receiptRepo = manager.getRepository('PurchaseReceipt');
  const receipt = await receiptRepo.save(receiptRepo.create({
    receiptNumber: payload.receiptNumber || nextNumber('REC'),
    purchaseId: payload.purchaseId,
    branchId: payload.branchId ?? null,
    warehouseId: payload.warehouseId ?? null,
    receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
    receivedBy: payload.receivedBy ?? payload.userId ?? null,
    verifiedBy: payload.verifiedBy ?? null,
    supplierDeliveryDocument: payload.supplierDeliveryDocument ?? null,
    status: payload.status || 'RECEIVED',
    notes: payload.notes ?? null
  }));
  receipt.branchId = purchase?.branchId ?? payload.branchId ?? null;
  await receiptRepo.save(receipt);
  const detailRepo = manager.getRepository('PurchaseDetail');
  const receiptDetailRepo = manager.getRepository('PurchaseReceiptDetail');

  for (const detail of payload.details || []) {
    const purchaseDetail = await detailRepo.findOneBy({ id: detail.purchaseDetailId });
    if (!purchaseDetail) throw new BusinessRuleError('El detalle de orden indicado no existe.');
    if (Number(purchaseDetail.purchaseId) !== Number(payload.purchaseId)) throw new BusinessRuleError('El detalle seleccionado no pertenece a la orden indicada.');
    const accepted = Number(detail.quantityAccepted ?? 0);
    const rejected = Number(detail.quantityRejected ?? 0);
    const received = Number(detail.quantityReceived ?? accepted + rejected);
    let receiptLine;
    try {
      receiptLine = calculateReceiptLine({ ordered: purchaseDetail.quantityOrdered ?? purchaseDetail.quantity, alreadyVerified: purchaseDetail.quantityReceived, arrived: received, good: accepted });
    } catch (error) {
      throw new BusinessRuleError(error.message);
    }
    if (rejected !== receiptLine.notAccepted) throw new BusinessRuleError('La cantidad no aceptada no coincide con la cantidad que llego menos la cantidad en buen estado.');
    await receiptDetailRepo.save(receiptDetailRepo.create({ ...detail, receiptId: receipt.id, branchId: purchase.branchId, medicineId: purchaseDetail.medicineId, quantityReceived: received, quantityAccepted: accepted, quantityRejected: rejected }));
    purchaseDetail.quantityReceived = receiptLine.verifiedAfter;
    purchaseDetail.quantityRejected = Number(purchaseDetail.quantityRejected ?? 0) + rejected;
    purchaseDetail.quantityPending = receiptLine.pendingAfter;
    purchaseDetail.status = purchaseDetail.quantityPending > 0 ? 'PARTIALLY_RECEIVED' : 'RECEIVED';
    await detailRepo.save(purchaseDetail);
    if (accepted > 0 && !detail.batchNumber) throw new BusinessRuleError('Debe ingresar lote para los productos aceptados.');
    if (accepted > 0 && !detail.expirationDate) throw new BusinessRuleError('Debe ingresar vencimiento para los productos aceptados.');
  }
  const allDetails = await detailRepo.findBy({ purchaseId: payload.purchaseId });
  const pending = allDetails.reduce((sum, item) => sum + Number(item.quantityPending ?? Math.max(0, Number(item.quantity ?? 0) - Number(item.quantityReceived ?? 0))), 0);
  const nextStatus = pending > 0 ? 'PARTIALLY_RECEIVED' : 'RECEIVED';
  await manager.getRepository('Purchase').update(payload.purchaseId, { status: nextStatus });
  if (nextStatus === 'RECEIVED') await createFulfillmentDeliveryRequests(manager, { ...purchase, status: nextStatus }, allDetails);
  return receipt.id;
});

export const reviewReceiptTechnically = async (receiptId, payload = {}) => AppDataSource.transaction(async manager => {
  const receiptRepo = manager.getRepository('PurchaseReceipt');
  const receipt = await receiptRepo.findOneBy({ id: receiptId });
  if (!receipt) throw new BusinessRuleError('La recepcion indicada no existe.');
  if (receipt.status === 'TECHNICALLY_APPROVED') throw new BusinessRuleError('La recepcion ya fue validada tecnicamente.');

  const purchase = await manager.getRepository('Purchase').findOneBy({ id: receipt.purchaseId });
  if (!purchase) throw new BusinessRuleError('La compra asociada a la recepcion no existe.');

  const receiptDetails = await manager.getRepository('PurchaseReceiptDetail').findBy({ receiptId });
  if (!receiptDetails.length) throw new BusinessRuleError('La recepcion no tiene detalle para validar.');

  const inventoryRepo = manager.getRepository('Inventory');
  const detailRepo = manager.getRepository('PurchaseDetail');
  for (const detail of receiptDetails) {
    const accepted = Number(detail.quantityAccepted ?? 0);
    if (accepted <= 0) continue;
    if (!detail.batchNumber || !detail.expirationDate) throw new BusinessRuleError('Todo producto aceptado requiere lote y vencimiento antes de la validacion tecnica.');
    const purchaseDetail = await detailRepo.findOneBy({ id: detail.purchaseDetailId });
    if (!purchaseDetail) throw new BusinessRuleError('El detalle de orden asociado a la recepcion no existe.');
    let stock = await inventoryRepo.findOneBy({ medicineId: detail.medicineId, branchId: purchase.branchId });
    if (!stock) stock = inventoryRepo.create({ medicineId: detail.medicineId, branchId: purchase.branchId, stockAvailable: 0, reserve: 0, stockMin: 0, stockMax: 0 });
    stock.stockAvailable = Number(stock.stockAvailable ?? 0) + accepted;
    await inventoryRepo.save(stock);
    await addLotStock(manager, { branchId: purchase.branchId, medicineId: detail.medicineId, lotNumber: detail.batchNumber, expirationDate: detail.expirationDate, quantity: accepted, userId: payload.technicalReviewerId ?? null });
    await registerKardex(manager, { branchId: purchase.branchId, medicineId: detail.medicineId, movementType: 'TECHNICAL_PURCHASE_RELEASE', quantityIn: accepted, balanceAfter: Number(stock.stockAvailable ?? 0), unitCost: purchaseDetail.unitPrice, referenceType: 'PURCHASE_RECEIPT', referenceId: receipt.id, reason: payload.technicalReviewNotes ?? 'Validacion tecnica farmaceutica' });
  }

  await receiptRepo.update(receiptId, { status: 'TECHNICALLY_APPROVED', verifiedBy: payload.technicalReviewerId ?? receipt.verifiedBy ?? null, notes: appendNote(receipt.notes, payload.technicalReviewNotes) });
  return receiptId;
});

export const registerSupplierInvoice = async payload => AppDataSource.transaction(async manager => {
  const invoiceRepo = manager.getRepository('SupplierInvoice');
  const purchase = await manager.getRepository('Purchase').findOneBy({ id: payload.purchaseId });
  if (!purchase) throw new BusinessRuleError('La orden de compra indicada no existe.');
  if (Number(purchase.supplierId) !== Number(payload.supplierId)) throw new BusinessRuleError('El proveedor de la factura no coincide con el proveedor de la orden.');
  if (!['PARTIALLY_RECEIVED', 'RECEIVED', 'DISCREPANCY'].includes(purchase.status)) {
    throw new BusinessRuleError(`La factura no puede registrarse porque la orden esta en estado ${purchase.status}. Primero debe recibir mercaderia.`);
  }
  if (!Number.isFinite(Number(payload.total)) || Number(payload.total) <= 0) throw new BusinessRuleError('El total de factura debe ser mayor a cero.');
  const detailsRows = await manager.getRepository('PurchaseDetail').findBy({ purchaseId: payload.purchaseId });
  const reconciliation = determineInvoiceMatching({ details: detailsRows, invoiceTotal: payload.total, tolerance: payload.tolerance });
  const matchingStatus = reconciliation.matchingStatus;
  const saved = await invoiceRepo.save(invoiceRepo.create({ ...payload, branchId: purchase?.branchId ?? payload.branchId ?? null, invoiceDate: payload.invoiceDate ? new Date(payload.invoiceDate) : new Date(), dueDate: payload.dueDate ? new Date(payload.dueDate) : null, matchingStatus, status: matchingStatus === 'MATCHED' ? 'APPROVED' : 'PENDING_APPROVAL' }));
  await manager.getRepository('Purchase').update(payload.purchaseId, { status: matchingStatus === 'MATCHED' ? 'INVOICED' : 'DISCREPANCY' });
  return saved.id;
});

export const paySupplierInvoice = async (invoiceId, payload, userId = null) => AppDataSource.transaction(async manager => {
  const invoiceRepo = manager.getRepository('SupplierInvoice');
  const invoice = await invoiceRepo.findOneBy({ id: invoiceId });
  if (!invoice) throw new BusinessRuleError('La factura de proveedor indicada no existe.');
  if (invoice.status === 'PAID') throw new BusinessRuleError('La factura de proveedor ya esta pagada.');
  if (invoice.status !== 'APPROVED') throw new BusinessRuleError(`La factura no puede pagarse porque esta en estado ${invoice.status}. Debe estar aprobada y conciliada.`);

  const purchase = await manager.getRepository('Purchase').findOneBy({ id: invoice.purchaseId });
  if (!purchase) throw new BusinessRuleError('La compra asociada a la factura no existe.');

  const amount = Number(invoice.total ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) throw new BusinessRuleError('La factura no tiene un total valido para pagar.');
  const movementDate = payload.paymentDate ? new Date(payload.paymentDate) : new Date();
  const description = `Pago proveedor factura ${invoice.invoiceNumber}`;

  if (payload.paymentSourceType === 'CASH_SESSION') {
    const session = payload.cashSessionId
      ? await manager.getRepository('CashSession').findOneBy({ id: payload.cashSessionId, branchId: purchase.branchId, status: 'A' })
      : await manager.getRepository('CashSession').findOneBy({ branchId: purchase.branchId, status: 'A' });
    if (!session) throw new BusinessRuleError('Debe existir una caja abierta de la sucursal para pagar la factura.');
    const movementType = await manager.getRepository('CashMovementType').findOneBy({ code: 'SUPPLIER_PAYMENT', status: 'E' });
    if (!movementType) throw new BusinessRuleError('No existe el tipo de movimiento de caja SUPPLIER_PAYMENT.');
    await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({
      cashSessionId: session.id,
      branchId: purchase.branchId,
      movementTypeId: movementType.id,
      amount,
      description,
      referenceId: invoice.id,
      referenceType: 'SUPPLIER_INVOICE',
      movementDate,
      status: 'E',
      createdBy: userId
    }));
    await createFinancialMovement(manager, { cashSessionId: session.id, branchId: purchase.branchId, sourceType: 'CASH_SESSION', operation: 'S', amount, description, referenceId: invoice.id, referenceType: 'SUPPLIER_INVOICE', movementDate }, userId);
    invoice.cashSessionId = session.id;
    invoice.financialAccountId = null;
  } else {
    await createFinancialMovement(manager, { financialAccountId: payload.financialAccountId, branchId: purchase.branchId, sourceType: payload.paymentSourceType, operation: 'S', amount, description, referenceId: invoice.id, referenceType: 'SUPPLIER_INVOICE', movementDate }, userId);
    invoice.cashSessionId = null;
    invoice.financialAccountId = payload.financialAccountId;
  }

  invoice.paymentSourceType = payload.paymentSourceType;
  invoice.paidAt = movementDate;
  invoice.paidBy = userId;
  invoice.status = 'PAID';
  await invoiceRepo.save(invoice);
  await manager.getRepository('Purchase').update(purchase.id, { status: 'PAID' });
  return invoice.id;
});

export const createSupplierReturn = async payload => AppDataSource.transaction(async manager => {
  const purchase = await manager.getRepository('Purchase').findOneBy({ id: payload.purchaseId });
  if (!purchase) throw new BusinessRuleError('La compra indicada no existe.');
  if (Number(purchase.supplierId) !== Number(payload.supplierId)) throw new BusinessRuleError('El proveedor de la devolucion no coincide con el proveedor de la compra.');
  if (!['RECEIVED', 'INVOICED', 'DISCREPANCY'].includes(purchase.status)) {
    throw new BusinessRuleError(`No se puede devolver producto porque la compra esta en estado ${purchase.status}. Debe estar recibida, facturada o con discrepancia.`);
  }
  const quantity = Number(payload.quantity ?? 0);
  if (!Number.isFinite(quantity) || quantity <= 0) throw new BusinessRuleError('La cantidad a devolver debe ser mayor a cero.');
  const detailsRows = await manager.getRepository('PurchaseDetail').findBy({ purchaseId: payload.purchaseId, medicineId: payload.medicineId });
  if (!detailsRows.length) throw new BusinessRuleError('El medicamento indicado no pertenece a la compra seleccionada.');
  const accepted = detailsRows.reduce((sum, detail) => sum + Math.max(0, Number(detail.quantityReceived ?? 0) - Number(detail.quantityRejected ?? 0)), 0);
  const rejected = detailsRows.reduce((sum, detail) => sum + Number(detail.quantityRejected ?? 0), 0);
  if (payload.returnMode === 'notAccepted' && quantity > rejected) {
    throw new BusinessRuleError(`La cantidad a devolver no puede superar la cantidad no aceptada (${rejected}).`);
  }
  if (payload.returnMode !== 'notAccepted' && quantity > accepted) {
    throw new BusinessRuleError(`La cantidad a devolver no puede superar la cantidad recibida en buen estado (${accepted}).`);
  }
  const saved = await manager.getRepository('PurchaseReturn').save({ ...payload, branchId: purchase?.branchId ?? payload.branchId ?? null });
  if (payload.returnMode === 'notAccepted') return saved.id;
  const stock = await manager.getRepository('Inventory').findOneBy({ branchId: purchase.branchId, medicineId: payload.medicineId });
  if (!stock) throw new BusinessRuleError('No existe inventario para descontar la devolucion.');
  const nextStock = Number(stock.stockAvailable ?? 0) - quantity;
  if (nextStock < 0) throw new BusinessRuleError(`Stock insuficiente para devolver ${quantity}. Disponible actual: ${Number(stock.stockAvailable ?? 0)}.`);
  stock.stockAvailable = nextStock;
  await manager.getRepository('Inventory').save(stock);
  await registerKardex(manager, { branchId: purchase.branchId, medicineId: payload.medicineId, movementType: 'SUPPLIER_RETURN', quantityOut: quantity, balanceAfter: Number(stock.stockAvailable ?? 0), referenceType: 'PURCHASE_RETURN', referenceId: saved.id, reason: payload.reason });
  return saved.id;
});

export const purchaseDashboard = async () => {
  const purchaseRepo = purchases();
  const [pendingOrders, partialReceipts, discrepancies, quarantined] = await Promise.all([
    purchaseRepo.countBy({ status: 'PENDING_APPROVAL' }),
    purchaseRepo.countBy({ status: 'PARTIALLY_RECEIVED' }),
    purchaseRepo.countBy({ status: 'DISCREPANCY' }),
    AppDataSource.getRepository('PurchaseReceiptDetail').countBy({ qualityStatus: 'QUARANTINE' })
  ]);
  return { pendingOrders, partialReceipts, discrepancies, quarantined };
};
