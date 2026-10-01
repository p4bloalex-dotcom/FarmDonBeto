import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from './inventory-kardex.service.js';

const inventory = () => AppDataSource.getRepository('Inventory');

const toDto = item => ({
  id: item.id,
  medicineId: item.medicineId,
  medicine_id: item.medicineId,
  medicineCode: item.medicine?.code ?? null,
  medicineName: item.medicine?.name ?? null,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  stockAvailable: Number(item.stockAvailable ?? 0),
  stock_available: Number(item.stockAvailable ?? 0),
  reserve: Number(item.reserve ?? 0),
  stockMin: Number(item.stockMin ?? 0),
  stock_min: Number(item.stockMin ?? 0),
  stockMax: Number(item.stockMax ?? 0),
  stock_max: Number(item.stockMax ?? 0),
  statusLabel: Number(item.stockAvailable ?? 0) <= Number(item.stockMin ?? 0) ? 'Bajo minimo' : 'Disponible'
});

const queryBase = () => inventory().createQueryBuilder('item')
  .leftJoin('item.medicine', 'medicine')
  .addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name']);

export const listInventory = async () => (await queryBase()
  .orderBy('branch.name', 'ASC')
  .addOrderBy('medicine.name', 'ASC')
  .getMany()).map(toDto);

export const paginateInventory = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase()
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC')
    .skip(offset)
    .take(pageSize)
    .getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const findInventoryById = async id => queryBase().where('item.id = :id', { id }).getOne();

export const updateInventory = async (id, data) => {
  const payload = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  if (Object.keys(payload).length === 0) return false;
  return (await inventory().update(id, payload)).affected > 0;
};

export const listKardex = async ({ branchId = null, medicineId = null } = {}) => {
  const query = AppDataSource.getRepository('InventoryKardex').createQueryBuilder('item')
    .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
    .orderBy('item.movementDate', 'DESC').addOrderBy('item.id', 'DESC');
  if (branchId) query.andWhere('item.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) query.andWhere('item.medicineId = :medicineId', { medicineId: Number(medicineId) });
  return (await query.take(500).getMany()).map(item => ({
    id: item.id,
    branchId: item.branchId,
    branchName: item.branch?.name ?? null,
    medicineId: item.medicineId,
    medicineName: item.medicine?.name ?? null,
    movementDate: item.movementDate,
    movementType: item.movementType,
    quantityIn: Number(item.quantityIn ?? 0),
    quantityOut: Number(item.quantityOut ?? 0),
    balanceAfter: Number(item.balanceAfter ?? 0),
    referenceType: item.referenceType,
    referenceId: item.referenceId,
    reason: item.reason
  }));
};

export const listLots = async ({ branchId = null, medicineId = null, expiringDays = null } = {}) => {
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('item')
    .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .leftJoin('item.medicine', 'medicine').addSelect(['medicine.id', 'medicine.code', 'medicine.name'])
    .where('item.status = :status', { status: 'E' })
    .orderBy('item.expirationDate', 'ASC');
  if (branchId) query.andWhere('item.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) query.andWhere('item.medicineId = :medicineId', { medicineId: Number(medicineId) });
  if (expiringDays) {
    const limit = new Date();
    limit.setDate(limit.getDate() + Number(expiringDays));
    query.andWhere('item.expirationDate <= :limit', { limit });
  }
  return (await query.getMany()).map(item => ({
    id: item.id,
    branchId: item.branchId,
    branchName: item.branch?.name ?? null,
    medicineId: item.medicineId,
    medicineName: item.medicine?.name ?? null,
    lotNumber: item.lotNumber,
    expirationDate: item.expirationDate,
    quantity: Number(item.quantity ?? 0),
    quantityAvailable: Number(item.quantityAvailable ?? item.quantity ?? 0),
    quantityReserved: Number(item.quantityReserved ?? 0),
    quantityInTransit: Number(item.quantityInTransit ?? 0),
    quantityQuarantine: Number(item.quantityQuarantine ?? 0),
    quantityDamaged: Number(item.quantityDamaged ?? 0),
    quantityExpired: Number(item.quantityExpired ?? 0),
    availableToPromise: Number(item.quantityAvailable ?? item.quantity ?? 0) - Number(item.quantityReserved ?? 0),
    status: item.status
  }));
};

export const createLot = async (data, userId = null) => {
  const repo = AppDataSource.getRepository('InventoryLot');
  const quantity = Number(data.quantity ?? data.quantityAvailable ?? 0);
  const saved = await repo.save(repo.create({ ...data, quantity, quantityAvailable: Number(data.quantityAvailable ?? quantity), status: 'E', createdBy: userId }));
  return saved.id;
};

export const lowStockAlerts = async () => (await queryBase()
  .where('item.stockMin > 0')
  .andWhere('item.stockAvailable <= item.stockMin')
  .orderBy('branch.name', 'ASC')
  .addOrderBy('medicine.name', 'ASC')
    .getMany()).map(toDto);

export const inventoryAlerts = async ({ expiringDays = 60 } = {}) => {
  const lowStock = await lowStockAlerts();
  const overStock = (await queryBase()
    .where('item.stockMax > 0')
    .andWhere('item.stockAvailable >= item.stockMax')
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC')
    .getMany()).map(toDto);
  const expiringLots = await listLots({ expiringDays });
  return {
    summary: {
      lowStock: lowStock.length,
      overStock: overStock.length,
      expiringLots: expiringLots.length
    },
    lowStock,
    overStock,
    expiringLots
  };
};

export const getAvailability = async ({ branchId = null, medicineId = null } = {}) => {
  const query = AppDataSource.getRepository('InventoryLot').createQueryBuilder('lot')
    .select('lot.branchId', 'branchId')
    .addSelect('lot.medicineId', 'medicineId')
    .addSelect('SUM(lot.quantityAvailable)', 'available')
    .addSelect('SUM(lot.quantityReserved)', 'reserved')
    .addSelect('SUM(lot.quantityInTransit)', 'inTransit')
    .addSelect('SUM(lot.quantityQuarantine)', 'quarantine')
    .leftJoin('lot.branch', 'branch')
    .addSelect('branch.name', 'branchName')
    .leftJoin('lot.medicine', 'medicine')
    .addSelect('medicine.name', 'medicineName')
    .addSelect('medicine.priceSell', 'priceSell')
    .where('lot.status = :status', { status: 'E' })
    .andWhere('lot.expirationDate >= :today', { today: new Date() })
    .groupBy('lot.branchId')
    .addGroupBy('lot.medicineId')
    .addGroupBy('branch.name')
    .addGroupBy('medicine.name')
    .addGroupBy('medicine.priceSell')
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC');

  if (branchId) query.andWhere('lot.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) query.andWhere('lot.medicineId = :medicineId', { medicineId: Number(medicineId) });

  const lotRows = (await query.getRawMany()).map(row => {
    const available = Number(row.available ?? 0);
    const reserved = Number(row.reserved ?? 0);
    return {
      branchId: Number(row.branchId),
      branchName: row.branchName,
      medicineId: Number(row.medicineId),
      medicineName: row.medicineName,
      priceSell: Number(row.priceSell ?? 0),
      available,
      reserved,
      availableToPromise: available - reserved,
      inTransit: Number(row.inTransit ?? 0),
      quarantine: Number(row.quarantine ?? 0)
    };
  });

  const existingKeys = new Set(lotRows.map(row => `${row.branchId}-${row.medicineId}`));
  const stockQuery = AppDataSource.getRepository('Inventory').createQueryBuilder('item')
    .leftJoin('item.branch', 'branch')
    .addSelect(['branch.id', 'branch.name'])
    .leftJoin('item.medicine', 'medicine')
    .addSelect(['medicine.id', 'medicine.name', 'medicine.priceSell'])
    .where('(item.stockAvailable - item.reserve) > 0')
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC');

  if (branchId) stockQuery.andWhere('item.branchId = :branchId', { branchId: Number(branchId) });
  if (medicineId) stockQuery.andWhere('item.medicineId = :medicineId', { medicineId: Number(medicineId) });

  const stockRows = (await stockQuery.getMany())
    .filter(item => !existingKeys.has(`${item.branchId}-${item.medicineId}`))
    .map(item => {
      const available = Number(item.stockAvailable ?? 0);
      const reserved = Number(item.reserve ?? 0);
      return {
        branchId: Number(item.branchId),
        branchName: item.branch?.name ?? null,
        medicineId: Number(item.medicineId),
        medicineName: item.medicine?.name ?? null,
        priceSell: Number(item.medicine?.priceSell ?? 0),
        available,
        reserved,
        availableToPromise: available - reserved,
        inTransit: 0,
        quarantine: 0
      };
    });

  return [...lotRows, ...stockRows];
};

export const createReservation = async (data, userId = null) => AppDataSource.transaction(async manager => {
  const lots = await manager.getRepository('InventoryLot').createQueryBuilder('lot')
    .where('lot.branchId = :branchId', { branchId: data.branchId })
    .andWhere('lot.medicineId = :medicineId', { medicineId: data.medicineId })
    .andWhere('lot.status = :status', { status: 'E' })
    .andWhere('lot.quantityAvailable - lot.quantityReserved > 0')
    .andWhere('lot.quantityQuarantine = 0')
    .andWhere('lot.quantityDamaged = 0')
    .andWhere('lot.quantityExpired = 0')
    .andWhere('lot.expirationDate >= :today', { today: new Date() })
    .orderBy('lot.expirationDate', 'ASC')
    .addOrderBy('lot.id', 'ASC')
    .getMany();

  const available = lots.reduce((sum, lot) => sum + Number(lot.quantityAvailable ?? 0) - Number(lot.quantityReserved ?? 0), 0);
  if (available < Number(data.quantity)) throw new Error(`Disponibilidad insuficiente. Disponible para prometer: ${available}.`);

  let pending = Number(data.quantity);
  for (const lot of lots) {
    if (pending <= 0) break;
    const promiseable = Number(lot.quantityAvailable ?? 0) - Number(lot.quantityReserved ?? 0);
    const take = Math.min(promiseable, pending);
    lot.quantityReserved = Number(lot.quantityReserved ?? 0) + take;
    lot.updatedBy = userId;
    await manager.getRepository('InventoryLot').save(lot);
    pending -= take;
  }

  const reservation = await manager.getRepository('InventoryReservation').save(manager.getRepository('InventoryReservation').create({
    branchId: data.branchId,
    medicineId: data.medicineId,
    customerOrderId: data.customerOrderId ?? null,
    quantity: data.quantity,
    reservedAt: new Date(),
    expiresAt: data.expiresAt ?? null,
    status: 'ACTIVE',
    createdBy: userId
  }));

  await registerKardex(manager, { branchId: data.branchId, medicineId: data.medicineId, movementType: 'RESERVATION', quantityOut: data.quantity, balanceAfter: available - Number(data.quantity), referenceType: 'INVENTORY_RESERVATION', referenceId: reservation.id, reason: 'Reserva de inventario', userId });
  return reservation.id;
});

export const cancelReservation = async (id, userId = null) => AppDataSource.transaction(async manager => {
  const reservation = await manager.getRepository('InventoryReservation').findOneBy({ id: Number(id), status: 'ACTIVE' });
  if (!reservation) return false;

  const lots = await manager.getRepository('InventoryLot').createQueryBuilder('lot')
    .where('lot.branchId = :branchId', { branchId: reservation.branchId })
    .andWhere('lot.medicineId = :medicineId', { medicineId: reservation.medicineId })
    .andWhere('lot.quantityReserved > 0')
    .orderBy('lot.expirationDate', 'ASC')
    .addOrderBy('lot.id', 'ASC')
    .getMany();

  let pending = Number(reservation.quantity ?? 0);
  for (const lot of lots) {
    if (pending <= 0) break;
    const release = Math.min(Number(lot.quantityReserved ?? 0), pending);
    lot.quantityReserved = Number(lot.quantityReserved ?? 0) - release;
    lot.updatedBy = userId;
    await manager.getRepository('InventoryLot').save(lot);
    pending -= release;
  }

  reservation.status = 'CANCELLED';
  reservation.updatedBy = userId;
  await manager.getRepository('InventoryReservation').save(reservation);
  await registerKardex(manager, { branchId: reservation.branchId, medicineId: reservation.medicineId, movementType: 'RESERVATION_RELEASE', quantityIn: reservation.quantity, balanceAfter: reservation.quantity, referenceType: 'INVENTORY_RESERVATION', referenceId: reservation.id, reason: 'Liberacion de reserva', userId });
  return true;
});

export const getReplenishmentSuggestions = async ({ branchId = null } = {}) => {
  const query = AppDataSource.getRepository('BranchProductConfig').createQueryBuilder('config')
    .leftJoin('config.branch', 'branch').addSelect(['branch.id', 'branch.name'])
    .leftJoin('config.medicine', 'medicine').addSelect(['medicine.id', 'medicine.name'])
    .leftJoin('Inventory', 'inventory', 'inventory.branchId = config.branchId AND inventory.medicineId = config.medicineId')
    .where('config.reorderPoint > 0')
    .andWhere('NVL(inventory.stockAvailable, 0) <= config.reorderPoint')
    .orderBy('branch.name', 'ASC')
    .addOrderBy('medicine.name', 'ASC');

  if (branchId) query.andWhere('config.branchId = :branchId', { branchId: Number(branchId) });

  const configs = await query.getMany();
  const suggestions = [];
  for (const config of configs) {
    const currentAvailability = await getAvailability({ branchId: config.branchId, medicineId: config.medicineId });
    const current = currentAvailability[0]?.availableToPromise ?? 0;
    const needed = Math.max(Number(config.minimumStock ?? 0) - current, Number(config.suggestedOrderQuantity ?? 0));
    const donors = await getAvailability({ medicineId: config.medicineId });
    const transferSources = donors
      .filter(item => item.branchId !== config.branchId && item.availableToPromise > Number(config.minimumStock ?? 0))
      .map(item => ({ branchId: item.branchId, branchName: item.branchName, surplus: item.availableToPromise - Number(config.minimumStock ?? 0) }));
    suggestions.push({
      branchId: config.branchId,
      branchName: config.branch?.name ?? null,
      medicineId: config.medicineId,
      medicineName: config.medicine?.name ?? null,
      currentAvailableToPromise: current,
      reorderPoint: Number(config.reorderPoint ?? 0),
      minimumStock: Number(config.minimumStock ?? 0),
      neededQuantity: needed,
      suggestionType: transferSources.length && config.allowAutomaticTransferSuggestion ? 'TRANSFER' : 'PURCHASE',
      transferSources: config.allowAutomaticTransferSuggestion ? transferSources : []
    });
  }
  return suggestions;
};

export const createAdjustment = async (data, userId = null) => AppDataSource.transaction(async manager => {
  const repo = manager.getRepository('Inventory');
  let stock = await repo.findOneBy({ branchId: data.branchId, medicineId: data.medicineId });
  if (!stock) {
    stock = repo.create({ branchId: data.branchId, medicineId: data.medicineId, stockAvailable: 0, reserve: 0, stockMin: 0, stockMax: 0 });
  }
  const quantityBefore = Number(stock.stockAvailable ?? 0);
  const quantityAfter = Number(data.quantityAfter);
  const delta = quantityAfter - quantityBefore;
  stock.stockAvailable = quantityAfter;
  await repo.save(stock);
  const adjustment = await manager.getRepository('InventoryAdjustment').save(manager.getRepository('InventoryAdjustment').create({
    branchId: data.branchId,
    medicineId: data.medicineId,
    adjustmentDate: new Date(),
    quantityBefore,
    quantityAfter,
    delta,
    reason: data.reason,
    createdBy: userId
  }));
  await registerKardex(manager, { branchId: data.branchId, medicineId: data.medicineId, movementType: 'ADJUSTMENT', quantityIn: delta > 0 ? delta : 0, quantityOut: delta < 0 ? Math.abs(delta) : 0, balanceAfter: quantityAfter, referenceType: 'INVENTORY_ADJUSTMENT', referenceId: adjustment.id, reason: data.reason, userId });
  return adjustment.id;
});

export const toInventoryDto = toDto;
