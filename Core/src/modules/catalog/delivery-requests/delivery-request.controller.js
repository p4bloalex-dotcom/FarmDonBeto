import { AppDataSource } from '../../../config/data-source.js';
import { badRequest, conflict, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { allowSecondaryBranchScope } from '../../../utils/request-context.js';
import {
  BusinessRuleError,
  changeDeliveryRequestStatus,
  createDeliveryRequestWithDetails,
  deleteDeliveryRequestWithDetails,
  findDeliveryRequestById,
  findDeliveryRequestByIdScoped,
  listDeliveryRequestDetails,
  listDeliveryRequests,
  paginateDeliveryRequests,
  resolveDeliveryScope,
  toDeliveryRequestDto,
  updateDeliveryRequestWithDetails
} from './delivery-request.repository.js';


// const toResponse = async request => ({ ...toDeliveryRequestDto(request), details: await listDeliveryRequestDetails(request.id) });


const findEnabled = async (name, id) =>
  AppDataSource.getRepository(name).findOneBy({
    id,
    status: 'E'
  });

const toResponse = async request => ({
  ...toDeliveryRequestDto(request),
  details: await listDeliveryRequestDetails(request.id)
});

const validateDeliveryData = async payload => {
  const requesting = await findEnabled('Branch', payload.requestingBranchId);
  if (!requesting) return { ok: false, message: 'La sucursal solicitante no existe o esta desactivada.' };

  const fulfillment = await findEnabled('Branch', payload.fulfillmentBranchId);
  if (!fulfillment) return { ok: false, message: 'La sucursal que entrega no existe o esta desactivada.' };

  if (payload.requestingBranchId === payload.fulfillmentBranchId)
    return { ok: false, message: 'Las sucursales deben ser diferentes.' };

  if (new Date(payload.requestedAt).getTime() > Date.now())
    return { ok: false, message: 'La fecha de solicitud no puede estar en el futuro.' };

  const medicineRepository = AppDataSource.getRepository('Medicine');

  for (const detail of payload.details) {
    const medicine = await medicineRepository.findOneBy({
      id: detail.medicineId,
      status: 'E'
    });

    if (!medicine)
      return { ok: false, message: `El medicamento con ID ${detail.medicineId} no existe o esta desactivado.` };
  }

  return { ok: true };
};

// const validateDeliveryData = async payload => {
//   const requesting = await findEnabled('Branch', payload.requestingBranchId);
//   if (!requesting) return { ok: false, message: 'La sucursal solicitante no existe o esta desactivada.' };
//   const fulfillment = await findEnabled('Branch', payload.fulfillmentBranchId);
//   if (!fulfillment) return { ok: false, message: 'La sucursal que entrega no existe o esta desactivada.' };
//   if (payload.requestingBranchId === payload.fulfillmentBranchId) return { ok: false, message: 'Las sucursales deben ser diferentes.' };
//   if (new Date(payload.requestedAt).getTime() > Date.now()) return { ok: false, message: 'La fecha de solicitud no puede estar en el futuro.' };

//   const medicineRepository = AppDataSource.getRepository('Medicine');
//   for (const detail of payload.details) {
//     const medicine = await medicineRepository.findOneBy({ id: detail.medicineId, status: 'E' });
//     if (!medicine) return { ok: false, message: `El medicamento con ID ${detail.medicineId} no existe o esta desactivado.` };
//   }
//   return { ok: true };
// };

const ensureScopeCanCreate = async payload => {
  const scope = await resolveDeliveryScope();
  if (!scope || scope === Number(payload.requestingBranchId) || scope === Number(payload.fulfillmentBranchId)) return true;
  const branch = await AppDataSource.getRepository('Branch').findOneBy({ id: scope, status: 'E' });
  return Number(branch?.isMain ?? 0) === 1;
};

const applyDeliveryMixedScope = async payload => {
  const scope = await resolveDeliveryScope();
  if (!scope) return;

  const requestingId = Number(payload.requestingBranchId);
  const fulfillmentId = Number(payload.fulfillmentBranchId);
  if (![requestingId, fulfillmentId].includes(Number(scope))) return;

  allowSecondaryBranchScope(requestingId === Number(scope) ? fulfillmentId : requestingId);
};

export const addDeliveryRequest = async (req, res) => {
  if (!(await ensureScopeCanCreate(req.body))) return badRequest(res, 'La solicitud debe involucrar a la sucursal del usuario.');
  await applyDeliveryMixedScope(req.body);
  const { ok: valid, message } = await validateDeliveryData(req.body);
  if (!valid) return badRequest(res, message);

  const header = {
    requestingBranchId: req.body.requestingBranchId,
    fulfillmentBranchId: req.body.fulfillmentBranchId,
    customerName: req.body.customerName,
    customerContact: req.body.customerContact,
    requestedAt: req.body.requestedAt,
    neededAt: req.body.neededAt,
    notes: req.body.notes
  };
  const id = await createDeliveryRequestWithDetails(header, req.body.details);
  return created(res, await toResponse(await findDeliveryRequestById(id)), 'Solicitud de entrega registrada correctamente.');
};

export const getDeliveryRequests = async (_req, res) => ok(res, await listDeliveryRequests());

export const getPagedDeliveryRequests = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateDeliveryRequests(pagination);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getDeliveryRequestDetail = async (req, res) => {
  const request = await findDeliveryRequestByIdScoped(Number(req.params.id));
  if (!request) return notFound(res);
  return ok(res, await toResponse(request));
};

export const editDeliveryRequest = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findDeliveryRequestByIdScoped(id);
  if (!existing) return notFound(res);
  if (existing.status !== 'P') return conflict(res, 'Solo se pueden editar solicitudes pendientes.');
  await applyDeliveryMixedScope({ ...req.body, requestingBranchId: existing.requestingBranchId, fulfillmentBranchId: existing.fulfillmentBranchId });
  const { ok: valid, message } = await validateDeliveryData(req.body);
  if (!valid) return badRequest(res, message);
  await updateDeliveryRequestWithDetails(id, {
    customerName: req.body.customerName,
    customerContact: req.body.customerContact,
    requestedAt: req.body.requestedAt,
    neededAt: req.body.neededAt,
    notes: req.body.notes,
    status: 'P'
  }, req.body.details);
  return ok(res, await toResponse(await findDeliveryRequestById(id)), 'Solicitud actualizada correctamente.');
};

export const updateDeliveryRequestStatus = async (req, res) => {
  const request = await findDeliveryRequestByIdScoped(Number(req.params.id));
  if (!request) return notFound(res);
  try {
    await changeDeliveryRequestStatus(request, req.body.status);
    return ok(res, await toResponse(await findDeliveryRequestById(request.id)), 'Estado actualizado correctamente.');
  } catch (error) {
    if (error instanceof BusinessRuleError) return conflict(res, error.message);
    throw error;
  }
};

export const removeDeliveryRequest = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await findDeliveryRequestByIdScoped(id);
  if (!existing) return notFound(res);
  if (!['P', 'R', 'C'].includes(existing.status)) return conflict(res, 'No se puede eliminar una solicitud aceptada, enviada o entregada.');
  await deleteDeliveryRequestWithDetails(id);
  return ok(res, null, 'Solicitud eliminada correctamente.');
};
