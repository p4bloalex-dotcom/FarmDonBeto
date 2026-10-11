import { AppDataSource } from '../../../config/data-source.js';
import { allowSecondaryBranchScope, getRequestContext } from '../../../utils/request-context.js';
import { BusinessRuleError as StockTransferBusinessRuleError, createStockTransferWithDetails, findMovementType } from '../stock-transfers/stock-transfer.repository.js';
import { In } from 'typeorm';

const requests = () => AppDataSource.getRepository('DeliveryRequest');
const details = () => AppDataSource.getRepository('DeliveryRequestDetail');

export class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.business = true;
  }
}

const statusLabels = {
  P: 'Pendiente',
  A: 'Aceptada',
  R: 'Rechazada',
  S: 'Enviada',
  D: 'Entregada',
  C: 'Cancelada'
};

const toDetailDto = item => ({
  id: item.id,
  requestId: item.requestId,
  request_id: item.requestId,
  medicineId: item.medicineId,
  medicine_id: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  quantity: Number(item.quantity ?? 0),
  unitCost: Number(item.unitCost ?? 0),
  unit_cost: Number(item.unitCost ?? 0)
});

const toDto = (item, branchNames = new Map()) => ({
  id: item.id,
  requestingBranchId: item.requestingBranchId,
  requesting_branch_id: item.requestingBranchId,
  requestingBranchName: item.requestingBranch?.name ?? branchNames.get(Number(item.requestingBranchId)) ?? null,
  fulfillmentBranchId: item.fulfillmentBranchId,
  fulfillment_branch_id: item.fulfillmentBranchId,
  fulfillmentBranchName: item.fulfillmentBranch?.name ?? branchNames.get(Number(item.fulfillmentBranchId)) ?? null,
  movementId: item.movementId,
  movement_id: item.movementId,
  customerName: item.customerName,
  customer_name: item.customerName,
  customerContact: item.customerContact,
  customer_contact: item.customerContact,
  requestedAt: item.requestedAt,
  requested_at: item.requestedAt,
  neededAt: item.neededAt,
  needed_at: item.neededAt,
  deliveredAt: item.deliveredAt,
  delivered_at: item.deliveredAt,
  notes: item.notes,
  itemsCount: Number(item.itemsCount ?? 0),
  status: item.status,
  statusLabel: statusLabels[item.status] ?? item.status
});

const detailQuery = () => details().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name']);

export const listDeliveryRequestDetails = async requestId => {
  const rows = await detailQuery().where('item.requestId = :requestId', { requestId }).orderBy('item.id', 'ASC').getMany();
  return rows.map(toDetailDto);
};

const setGlobalRlsContext = async runner => {
  try {
    await runner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain, :isGlobal, :secondaryBranch); END;', [null, 0, 1, null]);
  } catch (error) {
    if (error?.errorNum !== 6550 && error?.driverError?.errorNum !== 6550) throw error;
    try {
      await runner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain, :isGlobal); END;', [null, 0, 1]);
    } catch (legacyError) {
      if (legacyError?.errorNum !== 6550 && legacyError?.driverError?.errorNum !== 6550) throw legacyError;
      await runner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain); END;', [null, 1]);
    }
  }
};

const resolveBranchNames = async rows => {
  const ids = [...new Set(rows.flatMap(row => [row.requestingBranchId, row.fulfillmentBranchId]).filter(Boolean).map(Number))];
  if (!ids.length) return new Map();

  const runner = AppDataSource.createQueryRunner();
  runner.__branchRlsApplied = true;
  await runner.connect();
  try {
    await setGlobalRlsContext(runner);
    const branches = await runner.manager.getRepository('Branch').find({ where: { id: In(ids), status: 'E' } });
    return new Map(branches.map(branch => [Number(branch.id), branch.name]));
  } finally {
    await runner.release();
  }
};

const queryBase = () => requests().createQueryBuilder('item')
  .leftJoin('item.requestingBranch', 'requestingBranch')
  .addSelect(['requestingBranch.id', 'requestingBranch.name'])
  .leftJoin('item.fulfillmentBranch', 'fulfillmentBranch')
  .addSelect(['fulfillmentBranch.id', 'fulfillmentBranch.name'])
  .addSelect((subQuery) => subQuery
    .select('COUNT(detail.id)', 'itemsCount')
    .from('DeliveryRequestDetail', 'detail')
    .where('detail.requestId = item.id'), 'itemsCount');

export const resolveDeliveryScope = async () => {
  const store = getRequestContext();
  if (!store?.user?.id) return null;
  if (store.user.branchIsMain) return null;
  if (store.permissionName && store.user.role) {
    const permission = await AppDataSource.getRepository('Permission').findOneBy({ name: store.permissionName });
    if (permission) {
      const rolePermission = await AppDataSource.getRepository('RolePermission').findOneBy({ idRole: store.user.role, idPermission: permission.id });
      if (rolePermission?.isGlobal) return null;
    }
  }
  return store.user.branchId ?? null;
};

const applyBranchScope = async query => {
  const scope = await resolveDeliveryScope();
  if (scope) query.andWhere('(item.requestingBranchId = :scope OR item.fulfillmentBranchId = :scope)', { scope });
  return query;
};

export const findDeliveryRequestById = async id => {
  const item = await queryBase().where('item.id = :id', { id }).getOne();
  if (!item) return null;
  item.__branchNames = await resolveBranchNames([item]);
  return item;
};

export const findDeliveryRequestByIdScoped = async id => {
  const query = queryBase().where('item.id = :id', { id });
  await applyBranchScope(query);
  const item = await query.getOne();
  if (!item) return null;
  item.__branchNames = await resolveBranchNames([item]);
  return item;
};

export const listDeliveryRequests = async () => {
  const query = queryBase().where('item.status <> :cancelled', { cancelled: 'C' }).orderBy('item.requestedAt', 'DESC');
  await applyBranchScope(query);
  const rows = await query.getMany();
  const branchNames = await resolveBranchNames(rows);
  return rows.map(row => toDto(row, branchNames));
};

export const paginateDeliveryRequests = async ({ offset, pageSize }) => {
  const query = queryBase().orderBy('item.requestedAt', 'DESC');
  await applyBranchScope(query);
  const [rows, total] = await query.skip(offset).take(pageSize).getManyAndCount();
  const branchNames = await resolveBranchNames(rows);
  return { rows: rows.map(row => toDto(row, branchNames)), total };
};

export const createDeliveryRequestWithDetails = async (headerData, detailData) => AppDataSource.transaction(async manager => {
  const requestRepo = manager.getRepository('DeliveryRequest');
  const saved = await requestRepo.save(requestRepo.create({ ...headerData, status: 'P' }));
  const detailRepo = manager.getRepository('DeliveryRequestDetail');
  await detailRepo.save(detailData.map(detail => detailRepo.create({ requestId: saved.id, ...detail })));
  return saved.id;
});

export const updateDeliveryRequestWithDetails = async (id, headerData, detailData) => AppDataSource.transaction(async manager => {
  await manager.getRepository('DeliveryRequest').update(id, headerData);
  await manager.getRepository('DeliveryRequestDetail').delete({ requestId: id });
  const detailRepo = manager.getRepository('DeliveryRequestDetail');
  await detailRepo.save(detailData.map(detail => detailRepo.create({ requestId: id, ...detail })));
});

const transitions = {
  P: ['A', 'R', 'C'],
  A: ['S', 'C'],
  S: ['D', 'C'],
  R: [],
  D: [],
  C: []
};

const resolveDeliveryActionScope = async () => {
  const store = getRequestContext();
  if (!store?.user?.id) return null;
  if (store.user.branchIsMain) return null;
  if (store.permissionName && store.user.role) {
    const permission = await AppDataSource.getRepository('Permission').findOneBy({ name: store.permissionName });
    if (permission) {
      const rolePermission = await AppDataSource.getRepository('RolePermission').findOneBy({ idRole: store.user.role, idPermission: permission.id });
      if (rolePermission?.isGlobal) return null;
    }
  }
  return store.user.branchId ?? null;
};

const ensureTransitionActor = async (request, nextStatus) => {
  const scope = await resolveDeliveryActionScope();
  if (!scope) return;

  if (['A', 'S', 'R'].includes(nextStatus) && Number(request.fulfillmentBranchId) !== Number(scope)) {
    throw new BusinessRuleError('Solo la sucursal que entrega puede aceptar, rechazar o marcar como enviada la solicitud.');
  }

  if (nextStatus === 'D' && Number(request.requestingBranchId) !== Number(scope)) {
    throw new BusinessRuleError('Solo la sucursal que recibe puede confirmar la entrega.');
  }

  if (nextStatus === 'C' && ![Number(request.requestingBranchId), Number(request.fulfillmentBranchId)].includes(Number(scope))) {
    throw new BusinessRuleError('Solo una sucursal involucrada puede cancelar la solicitud.');
  }
};

export const changeDeliveryRequestStatus = async (request, nextStatus) => {
  if (!transitions[request.status]?.includes(nextStatus)) {
    throw new BusinessRuleError('Cambio de estado no permitido para la solicitud.');
  }
  await ensureTransitionActor(request, nextStatus);

  let movementId = request.movementId;
  if (nextStatus === 'D') {
    if (movementId) throw new BusinessRuleError('La entrega ya fue confirmada y tiene un movimiento de stock aplicado.');
    const movementType = await findMovementType('TRASPASO');
    if (!movementType) throw new BusinessRuleError('No se configuro el tipo de movimiento de traspaso.');
    const requestDetails = await listDeliveryRequestDetails(request.id);
    const scope = await resolveDeliveryActionScope();
    if (scope) {
      allowSecondaryBranchScope(Number(request.fulfillmentBranchId) === Number(scope) ? request.requestingBranchId : request.fulfillmentBranchId);
    }
    try {
      movementId = await createStockTransferWithDetails({
        branchOriginId: request.fulfillmentBranchId,
        branchDestinationId: request.requestingBranchId,
        movementDate: new Date(),
        description: `Entrega a cliente desde solicitud ${request.id}`,
        status: 'E'
      }, requestDetails.map(detail => ({ medicineId: detail.medicineId, quantity: detail.quantity, unitCost: detail.unitCost })), movementType.id);
    } catch (error) {
      if (error instanceof StockTransferBusinessRuleError) throw new BusinessRuleError(error.message);
      throw error;
    }
  }

  await requests().update(request.id, {
    status: nextStatus,
    movementId,
    deliveredAt: nextStatus === 'D' ? new Date() : request.deliveredAt
  });
};

export const deleteDeliveryRequestWithDetails = async id => AppDataSource.transaction(async manager => {
  await manager.getRepository('DeliveryRequestDetail').delete({ requestId: id });
  await manager.getRepository('DeliveryRequest').delete(id);
});

export const toDeliveryRequestDto = item => toDto(item, item.__branchNames);
