import { AppDataSource } from '../../../config/data-source.js';
import { badRequest, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { BusinessRuleError, createSaleWithDetails, findSaleById, listSaleDetails, listSales, paginateSales, toSaleDto } from './sale.repository.js';

const enabled = async (name, id) => AppDataSource.getRepository(name).findOneBy({ id, status: 'E' });

const saleTotalFromPayload = payload => {
  const subtotal = (payload.details ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0), 0);
  const tax = payload.tax == null ? subtotal * (Number(payload.taxRate ?? 0) / 100) : Number(payload.tax ?? 0);
  return Math.round((subtotal + tax) * 100) / 100;
};

const validateSale = async payload => {
  const branch = await enabled('Branch', payload.branchId);
  if (!branch) return 'La sucursal seleccionada no existe o esta desactivada.';
  const employee = await enabled('Employee', payload.employeeId);
  if (!employee) return 'El empleado seleccionado no existe o esta desactivado.';
  const session = await AppDataSource.getRepository('CashSession').findOneBy({ id: payload.cashSessionId, branchId: payload.branchId, status: 'A' });
  if (!session) return 'Debe seleccionar una sesion de caja abierta para la sucursal.';
  if (new Date(payload.saleDate).getTime() < new Date(session.openingDate).getTime()) return 'La fecha de venta no puede ser anterior a la apertura de caja.';
  const cashRegister = await AppDataSource.getRepository('CashRegister').findOneBy({ id: session.cashRegisterId });
  if (cashRegister?.cashLimit) {
    const raw = await AppDataSource.getRepository('CashMovement').createQueryBuilder('m')
      .leftJoin('m.cashMovementType', 't')
      .select('COALESCE(SUM(CASE WHEN t.operation = :income THEN m.amount ELSE -m.amount END), 0)', 'balance')
      .where('m.cashSessionId = :sessionId', { sessionId: session.id })
      .andWhere('m.status = :status', { status: 'E' })
      .setParameter('income', 'I')
      .getRawOne();
    const currentCash = Number(session.openingAmount ?? 0) + Number(raw?.balance ?? 0);
    const payments = payload.payments ?? [{ method: payload.paymentMethod, amount: saleTotalFromPayload(payload) }];
    const saleTotal = saleTotalFromPayload(payload);
    const nonCash = payments.filter(payment => String(payment.method).toUpperCase() !== 'CASH').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const cashReceived = payments.filter(payment => String(payment.method).toUpperCase() === 'CASH').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const saleCash = Math.min(cashReceived, Math.max(0, saleTotal - nonCash));
    if (currentCash + saleCash > Number(cashRegister.cashLimit)) return 'La caja supera el limite de efectivo permitido. Registre un retiro a boveda antes de continuar.';
  }
  return null;
};

const response = async sale => ({ ...toSaleDto(sale), details: await listSaleDetails(sale.id) });

export const addSale = async (req, res) => {
  const error = await validateSale(req.body);
  if (error) return badRequest(res, error);
  try {
    const id = await createSaleWithDetails(req.body, req.body.details, req.user?.id ?? null);
    return created(res, await response(await findSaleById(id)), 'Venta registrada correctamente. Inventario y caja actualizados.');
  } catch (err) {
    if (err instanceof BusinessRuleError) return badRequest(res, err.message);
    throw err;
  }
};

export const getSales = async (_req, res) => ok(res, await listSales());

export const getPagedSales = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateSales(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getSaleDetail = async (req, res) => {
  const sale = await findSaleById(Number(req.params.id));
  if (!sale) return notFound(res);
  return ok(res, await response(sale));
};
