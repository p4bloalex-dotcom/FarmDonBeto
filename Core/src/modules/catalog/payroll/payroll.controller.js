import { badRequest, created, notFound, ok } from '../../../utils/api-response.js';
import { AppDataSource } from '../../../config/data-source.js';
import { BusinessRuleError, createAdjustment, createPosition, createSalary, generatePayroll, getPaymentById, listAdjustments, listPayments, listPositions, listSalaries, toPaymentDto, updatePosition, updateSalary, voidPayment } from './payroll.repository.js';

export const getPositions = async (_req, res) => ok(res, await listPositions());
export const addPosition = async (req, res) => created(res, await createPosition(req.body, req.user?.id ?? null), 'Puesto registrado correctamente.');
export const editPosition = async (req, res) => ok(res, { updated: await updatePosition(Number(req.params.id), req.body, req.user?.id ?? null) }, 'Puesto actualizado correctamente.');

export const getSalaries = async (_req, res) => ok(res, await listSalaries());

const validateSalaryRefs = async payload => {
  const employee = await AppDataSource.getRepository('Employee').findOneBy({ id: payload.employeeId, status: 'E' });
  if (!employee) return 'El empleado seleccionado no existe o esta desactivado.';
  const position = await AppDataSource.getRepository('PayrollPosition').findOneBy({ id: payload.positionId, status: 'E' });
  if (!position) return 'El puesto seleccionado no existe o esta desactivado.';
  const branch = await AppDataSource.getRepository('Branch').findOneBy({ id: payload.branchId, status: 'E' });
  if (!branch) return 'La sucursal seleccionada no existe o esta desactivada.';
  return null;
};

export const addSalary = async (req, res) => {
  const error = await validateSalaryRefs(req.body);
  if (error) return badRequest(res, error);
  return created(res, { id: await createSalary(req.body, req.user?.id ?? null) }, 'Salario asignado correctamente.');
};
export const editSalary = async (req, res) => {
  const error = await validateSalaryRefs(req.body);
  if (error) return badRequest(res, error);
  return ok(res, { updated: await updateSalary(Number(req.params.id), req.body, req.user?.id ?? null) }, 'Salario actualizado correctamente.');
};

export const getPayments = async (_req, res) => ok(res, await listPayments());
export const getAdjustments = async (_req, res) => ok(res, await listAdjustments());
export const addAdjustment = async (req, res) => {
  const employee = await AppDataSource.getRepository('Employee').findOneBy({ id: req.body.employeeId, status: 'E' });
  if (!employee) return badRequest(res, 'El empleado seleccionado no existe o esta desactivado.');
  const branch = await AppDataSource.getRepository('Branch').findOneBy({ id: req.body.branchId, status: 'E' });
  if (!branch) return badRequest(res, 'La sucursal seleccionada no existe o esta desactivada.');
  return created(res, { id: await createAdjustment(req.body, req.user?.id ?? null) }, 'Ajuste de nomina registrado correctamente.');
};
export const addGeneratedPayments = async (req, res) => {
  try {
    return created(res, { ids: await generatePayroll(req.body, req.user?.id ?? null) }, 'Nomina generada correctamente.');
  } catch (error) {
    if (error instanceof BusinessRuleError) return badRequest(res, error.message);
    throw error;
  }
};
export const cancelPayment = async (req, res) => {
  const payment = await getPaymentById(Number(req.params.id));
  if (!payment) return notFound(res);
  await voidPayment(payment.id, req.body.reason, req.user?.id ?? null);
  return ok(res, toPaymentDto(await getPaymentById(payment.id)), 'Pago anulado correctamente.');
};
