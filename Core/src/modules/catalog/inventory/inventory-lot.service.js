export class LotConsumptionError extends Error {
  constructor(message) { super(message); this.name = 'LotConsumptionError'; }
}

export const addLotStock = async (manager, { branchId, medicineId, lotNumber, expirationDate, quantity, userId = null }) => {
  if (!lotNumber || !expirationDate) return;
  const repo = manager.getRepository('InventoryLot');
  let lot = await repo.findOneBy({ branchId, medicineId, lotNumber, status: 'E' });
  if (!lot) {
    lot = repo.create({ branchId, medicineId, lotNumber, expirationDate, quantity: 0, quantityAvailable: 0, status: 'E', createdBy: userId });
  }
  lot.expirationDate = expirationDate;
  lot.quantity = Number(lot.quantity ?? 0) + Number(quantity ?? 0);
  lot.quantityAvailable = Number(lot.quantityAvailable ?? lot.quantity ?? 0) + Number(quantity ?? 0);
  lot.updatedBy = userId;
  await repo.save(lot);
};

export const consumeLotsFefo = async (manager, { branchId, medicineId, quantity, referenceType = null, referenceId = null, userId = null }) => {
  const repo = manager.getRepository('InventoryLot');
  const lots = await repo.createQueryBuilder('lot')
    .where('lot.branchId = :branchId', { branchId })
    .andWhere('lot.medicineId = :medicineId', { medicineId })
    .andWhere('lot.status = :status', { status: 'E' })
    .andWhere('lot.quantityAvailable > 0')
    .andWhere('lot.quantityQuarantine = 0')
    .andWhere('lot.quantityDamaged = 0')
    .andWhere('lot.quantityExpired = 0')
    .andWhere('lot.expirationDate >= :today', { today: new Date() })
    .orderBy('lot.expirationDate', 'ASC')
    .addOrderBy('lot.id', 'ASC')
    .getMany();

  if (lots.length === 0) return [];
  const available = lots.reduce((sum, lot) => sum + Number(lot.quantityAvailable ?? 0), 0);
  if (available < Number(quantity)) throw new LotConsumptionError(`Lotes insuficientes para el medicamento ${medicineId}. Disponible por lote: ${available}.`);

  let pending = Number(quantity);
  const consumed = [];
  for (const lot of lots) {
    if (pending <= 0) break;
    const previousBalance = Number(lot.quantityAvailable ?? 0);
    const take = Math.min(previousBalance, pending);
    lot.quantityAvailable = previousBalance - take;
    lot.quantity = Number(lot.quantity ?? previousBalance) - take;
    lot.updatedBy = userId;
    await repo.save(lot);
    consumed.push({ lotId: lot.id, lotNumber: lot.lotNumber, expirationDate: lot.expirationDate, quantity: take, previousBalance, newBalance: lot.quantityAvailable, referenceType, referenceId });
    pending -= take;
  }
  return consumed;
};
