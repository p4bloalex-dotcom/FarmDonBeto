import { AppDataSource } from '../../../config/data-source.js';
import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import {
  BusinessRuleError,
  approvePurchase,
  checkNetworkAvailability,
  createPurchaseOrder,
  createPurchaseRequest,
  createPurchaseWithDetails,
  createSupplierReturn,
  deletePurchaseOrderDraft,
  deletePurchaseWithDetails,
  findOpenSessionByBranch,
  findPurchaseByInvoice,
  findPurchaseById,
  findLatestSupplierInvoice,
  hasFinancialMovement,
  hasCashMovement,
  listPurchaseDetails,
  listPurchaseRequests,
  listPurchases,
  paginatePurchases,
  purchaseDashboard,
  receivePurchase,
  registerSupplierInvoice,
  updatePurchaseWithDetails
} from './purchase.repository.js';

const toPurchaseResponse = async purchase => {
  const details = await listPurchaseDetails(purchase.id);
  const supplierInvoice = await findLatestSupplierInvoice(purchase.id);
  return {
    ...purchase,
    invoiceNumber: supplierInvoice?.invoiceNumber ?? purchase.invoiceNumber,
    supplierInvoice: supplierInvoice ? {
      id: supplierInvoice.id,
      invoiceNumber: supplierInvoice.invoiceNumber,
      subtotal: Number(supplierInvoice.subtotal ?? 0),
      tax: Number(supplierInvoice.tax ?? 0),
      discount: Number(supplierInvoice.discount ?? 0),
      total: Number(supplierInvoice.total ?? 0),
      matchingStatus: supplierInvoice.matchingStatus,
      status: supplierInvoice.status,
      invoiceDate: supplierInvoice.invoiceDate
    } : null,
    details
  };
};

const findEnabled = async (name, id) => AppDataSource.getRepository(name).findOneBy({ id, status: 'E' });

const isMainBranchUser = async req => {
  const userBranchId = Number(req.user?.branchId ?? req.user?.branch_id ?? 0);
  if (!userBranchId) return true;
  const branch = await AppDataSource.getRepository('Branch').findOneBy({ id: userBranchId, status: 'E' });
  return Number(branch?.isMain ?? 0) === 1;
};

const validatePharmacyData = async (payload, excludePurchaseId = null, requireMainBranch = false) => {
  const supplier = await findEnabled('Supplier', payload.supplierId);
  if (!supplier) {
    return { ok: false, message: 'El proveedor seleccionado no existe o esta desactivado.' };
  }

  const branch = await findEnabled('Branch', payload.branchId);
  if (!branch) {
    return { ok: false, message: 'La sucursal seleccionada no existe o esta desactivada.' };
  }

  if (requireMainBranch && branch.isMain !== 1) {
    return { ok: false, message: 'Solo la sucursal matriz puede registrar compras. Las demas sucursales reciben stock por traspasos.' };
  }

  if (new Date(payload.purchaseDate).getTime() > Date.now()) {
    return { ok: false, message: 'La fecha de la compra no puede estar en el futuro.' };
  }

  const duplicated = await findPurchaseByInvoice(payload.supplierId, payload.invoiceNumber, excludePurchaseId);
  if (duplicated) {
    return { ok: false, message: 'El numero de factura ya fue registrado para este proveedor.' };
  }

  const medicineRepository = AppDataSource.getRepository('Medicine');
  for (const detail of payload.details) {
    const medicine = await medicineRepository.findOneBy({ id: detail.medicineId, status: 'E' });
    if (!medicine) {
      return { ok: false, message: `El medicamento con ID ${detail.medicineId} no existe o esta desactivado.` };
    }
  }

  return { ok: true, supplier, branch };
};

const buildCashMovement = async (payload, supplier) => {
  const session = payload.cashSessionId
    ? await AppDataSource.getRepository('CashSession').findOneBy({ id: payload.cashSessionId, branchId: payload.branchId, status: 'A' })
    : await findOpenSessionByBranch(payload.branchId);
  if (!session) {
    return null;
  }

  const movementDate = new Date(payload.purchaseDate);
  const openingDate = new Date(session.openingDate);
  const now = Date.now();
  if (movementDate.getTime() < openingDate.getTime() || movementDate.getTime() > now) {
    return null;
  }

  const type = await AppDataSource.getRepository('CashMovementType').findOneBy({ code: 'SUPPLIER_PAYMENT', status: 'E' });
  if (!type) {
    return null;
  }

  return {
    cashSessionId: session.id,
    movementTypeId: type.id,
    amount: payload.total,
    description: `Compra a ${supplier.name} - Factura ${payload.invoiceNumber}`,
    movementDate
  };
};

const editableStatuses = ['E', 'DRAFT'];
const deletableStatuses = ['E', 'DRAFT', 'PENDING_APPROVAL'];

export const addPurchase = async (req, res) => {
  const { ok: valid, message, supplier } = await validatePharmacyData(req.body, null, true);
  if (!valid) {
    return badRequest(res, message);
  }

  const movement = req.body.paymentSourceType === 'CASH_SESSION' ? await buildCashMovement(req.body, supplier) : null;
  if (req.body.paymentSourceType === 'CASH_SESSION' && !movement) return badRequest(res, 'Debe existir una sesion de caja abierta y valida para registrar el pago a proveedor.');

  const header = {
    supplierId: req.body.supplierId,
    branchId: req.body.branchId,
    purchaseDate: req.body.purchaseDate,
    invoiceNumber: req.body.invoiceNumber,
    subtotal: req.body.subtotal,
    tax: req.body.tax,
    total: req.body.total,
    status: req.body.status ?? 'E',
    paymentSourceType: req.body.paymentSourceType,
    financialAccountId: req.body.financialAccountId,
    createdBy: req.user?.id ?? req.user?.userId ?? null
  };

  try {
    const id = await createPurchaseWithDetails(header, req.body.details, movement);
    const purchase = await findPurchaseById(id);
    return created(res, await toPurchaseResponse(purchase), 'Compra registrada correctamente. El inventario fue actualizado.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return badRequest(res, error.message);
    }
    throw error;
  }
};

export const getPurchases = async (_req, res) => ok(res, await listPurchases());

export const getPagedPurchases = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginatePurchases(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getPurchaseDetail = async (req, res) => {
  const id = Number(req.params.id);
  const purchase = await findPurchaseById(id);
  if (!purchase) {
    return notFound(res);
  }
  return ok(res, await toPurchaseResponse(purchase));
};

export const editPurchase = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findPurchaseById(id);
  if (!existing) {
    return notFound(res);
  }
  if (existing.status === 'I') {
    return conflict(res, 'No se puede editar una compra anulada.');
  }
  if (!editableStatuses.includes(existing.status)) {
    return conflict(res, 'Solo se pueden editar compras directas o borradores. Una orden aprobada debe continuar con recepcion, factura o devolucion.');
  }
  if (await hasCashMovement(id) || await hasFinancialMovement(id)) {
    return conflict(res, 'La compra ya fue registrada en el flujo financiero. No se puede modificar.');
  }

  const { ok: valid, message } = await validatePharmacyData(req.body, id);
  if (!valid) {
    return badRequest(res, message);
  }

  try {
    await updatePurchaseWithDetails(id, { ...req.body, branchId: existing.branchId }, req.body.details);
    const purchase = await findPurchaseById(id);
    return ok(res, await toPurchaseResponse(purchase), 'Compra actualizada correctamente.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return badRequest(res, error.message);
    }
    throw error;
  }
};

export const removePurchase = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findPurchaseById(id);
  if (!existing) {
    return notFound(res);
  }
  if (existing.status === 'I') {
    return conflict(res, 'La compra ya fue anulada.');
  }
  if (!deletableStatuses.includes(existing.status)) {
    return conflict(res, 'No se puede eliminar una orden aprobada, recibida o facturada. Use devolucion a proveedor si corresponde.');
  }
  if (await hasCashMovement(id) || await hasFinancialMovement(id)) {
    return conflict(res, 'No se puede eliminar una compra registrada en el flujo financiero.');
  }

  try {
    if (['DRAFT', 'PENDING_APPROVAL'].includes(existing.status)) {
      await deletePurchaseOrderDraft(id);
      return ok(res, null, 'Orden eliminada correctamente. No se afecto inventario.');
    }
    await deletePurchaseWithDetails(id, existing.branchId);
    return ok(res, null, 'Compra eliminada correctamente. El inventario fue actualizado.');
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return conflict(res, error.message);
    }
    throw error;
  }
};

const bodyWithUser = req => ({ ...req.body, userId: req.user?.id ?? req.user?.userId ?? null });

export const addPurchaseRequest = async (req, res) => {
  if (!req.body.branchId || !Array.isArray(req.body.details) || req.body.details.length === 0) return badRequest(res, 'La solicitud requiere sucursal y al menos un producto.');
  try {
    const id = await createPurchaseRequest(bodyWithUser(req));
    return created(res, { id }, 'Solicitud de compra registrada.');
  } catch (error) {
    if (String(error.message).includes('ORA-00904')) return badRequest(res, 'La base de datos no tiene aplicada la ultima migracion del modulo de compras. Ejecute npm run migration:run en Core.');
    throw error;
  }
};

export const getPurchaseRequests = async (_req, res) => ok(res, await listPurchaseRequests());

export const getNetworkAvailability = async (req, res) => {
  const medicineId = Number(req.query.medicineId ?? req.query.medicine_id);
  const branchId = Number(req.query.branchId ?? req.query.branch_id);
  const quantity = Number(req.query.quantity ?? 0);
  if (!medicineId || !branchId || quantity <= 0) return badRequest(res, 'medicineId, branchId y quantity son requeridos.');
  return ok(res, await checkNetworkAvailability(medicineId, branchId, quantity));
};

export const addPurchaseOrder = async (req, res) => {
  if (!req.body.supplierId || !req.body.branchId || !Array.isArray(req.body.details) || req.body.details.length === 0) return badRequest(res, 'La orden requiere proveedor, destino y al menos un producto.');
  if (!(await isMainBranchUser(req))) return conflict(res, 'Solo la sucursal matriz puede crear ordenes de compra a proveedor. Las sucursales deben crear solicitudes de abastecimiento.');
  const id = await createPurchaseOrder(bodyWithUser(req));
  return created(res, { id }, 'Orden de compra generada sin afectar inventario.');
};

export const approvePurchaseOrder = async (req, res) => {
  const id = Number(req.params.id);
  const purchase = await findPurchaseById(id);
  if (!purchase) return notFound(res);
  if (!(await isMainBranchUser(req))) return conflict(res, 'Solo la sucursal matriz puede aprobar ordenes de compra.');
  if (purchase.status !== 'PENDING_APPROVAL') return conflict(res, 'Solo se pueden aprobar ordenes pendientes de aprobacion.');
  await approvePurchase(id, { approvedBy: req.user?.id ?? req.user?.userId ?? null, comments: req.body?.comments ?? null });
  return ok(res, { id }, 'Orden aprobada.');
};

export const addPurchaseReceipt = async (req, res) => {
  if (!req.body.purchaseId || !Array.isArray(req.body.details) || req.body.details.length === 0) return badRequest(res, 'La recepcion requiere orden y detalle.');
  try {
    const id = await receivePurchase(bodyWithUser(req));
    return created(res, { id }, 'Recepcion registrada. Solo cantidades aceptadas ingresaron al inventario.');
  } catch (error) {
    if (error instanceof BusinessRuleError) return badRequest(res, error.message);
    throw error;
  }
};

export const addSupplierInvoice = async (req, res) => {
  if (!req.body.supplierId || !req.body.purchaseId || !req.body.invoiceNumber) return badRequest(res, 'La factura requiere proveedor, orden y numero de factura.');
  const id = await registerSupplierInvoice(bodyWithUser(req));
  return created(res, { id }, 'Factura registrada y conciliada contra orden/recepcion.');
};

export const addPurchaseReturn = async (req, res) => {
  if (!req.body.supplierId || !req.body.purchaseId || !req.body.medicineId || !req.body.quantity || !req.body.reason) return badRequest(res, 'La devolucion requiere proveedor, compra, producto, cantidad y motivo.');
  const id = await createSupplierReturn(bodyWithUser(req));
  return created(res, { id }, 'Devolucion a proveedor registrada.');
};

export const getPurchaseDashboard = async (_req, res) => ok(res, await purchaseDashboard());
