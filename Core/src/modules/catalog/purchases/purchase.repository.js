import { AppDataSource } from '../../../config/data-source.js';
import { registerKardex } from '../inventory/inventory-kardex.service.js';
import { addLotStock } from '../inventory/inventory-lot.service.js';

const purchases = () => AppDataSource.getRepository('Purchase');
const details = () => AppDataSource.getRepository('PurchaseDetail');

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
  unitPrice: Number(item.unitPrice ?? 0),
  unit_price: Number(item.unitPrice ?? 0),
  subtotal: Number(item.subtotal ?? 0),
  lotNumber: item.lotNumber ?? null,
  expirationDate: item.expirationDate ?? null
});

const toDto = item => ({
  id: item.id,
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
  const rows = await queryBase()
    .where('item.status <> :inactive', { inactive: 'I' })
    .orderBy('item.purchaseDate', 'DESC')
    .getMany();
  return rows.map(toDto);
};

export const paginatePurchases = async ({ offset, pageSize }) => {
  const query = queryBase()
    .orderBy('item.purchaseDate', 'DESC')
    .skip(offset)
    .take(pageSize);
  const [rows, total] = await query.getManyAndCount();
  return { rows: rows.map(toDto), total };
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
