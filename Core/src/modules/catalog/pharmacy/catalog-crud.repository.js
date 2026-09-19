import { AppDataSource } from '../../../config/data-source.js';

const repository = entityName => AppDataSource.getRepository(entityName);

const selectFields = {
  Medicine: ['item.id', 'item.laboratoryId', 'item.presentationId', 'item.categoryId', 'item.unitMeasurementId', 'item.code', 'item.name', 'item.description', 'item.priceBuy', 'item.priceSell', 'item.status'],
  Supplier: ['item.id', 'item.name', 'item.address', 'item.status'],
  SupplierMedicine: ['item.id', 'item.supplierId', 'item.medicineId', 'item.status'],
  CashMovementType: ['item.id', 'item.name', 'item.code', 'item.operation', 'item.status'],
  default: ['item.id', 'item.name', 'item.status']
};

const relationFields = {
  Medicine: [
    ['item.laboratory', 'laboratory'],
    ['item.presentation', 'presentation'],
    ['item.category', 'category'],
    ['item.unitMeasurement', 'unitMeasurement']
  ],
  SupplierMedicine: [
    ['item.supplier', 'supplier'],
    ['item.medicine', 'medicine']
  ]
};

const listOrder = {
  SupplierMedicine: ['item.id', 'DESC'],
  default: ['item.name', 'ASC']
};

const dtoMappers = {
  Medicine: item => ({
    id: item.id,
    laboratoryId: item.laboratoryId,
    laboratory_id: item.laboratoryId,
    laboratoryName: item.laboratory?.name ?? null,
    presentationId: item.presentationId,
    presentation_id: item.presentationId,
    presentationName: item.presentation?.name ?? null,
    categoryId: item.categoryId,
    category_id: item.categoryId,
    categoryName: item.category?.name ?? null,
    unitMeasurementId: item.unitMeasurementId,
    unit_measurement_id: item.unitMeasurementId,
    unitMeasurementName: item.unitMeasurement?.name ?? null,
    code: item.code,
    name: item.name,
    description: item.description,
    priceBuy: Number(item.priceBuy ?? 0),
    price_buy: Number(item.priceBuy ?? 0),
    priceSell: Number(item.priceSell ?? 0),
    price_sell: Number(item.priceSell ?? 0),
    status: item.status
  }),
  SupplierMedicine: item => ({
    id: item.id,
    supplierId: item.supplierId,
    supplier_id: item.supplierId,
    supplierName: item.supplier?.name ?? null,
    medicineId: item.medicineId,
    medicine_id: item.medicineId,
    medicineName: item.medicine?.name ?? null,
    status: item.status
  }),
  CashMovementType: item => ({
    id: item.id,
    name: item.name,
    code: item.code,
    operation: item.operation,
    status: item.status
  })
};

const defaultToDto = item => ({
  id: item.id,
  name: item.name,
  address: item.address,
  status: item.status
});

const toDto = (entityName, item) => (dtoMappers[entityName] ?? defaultToDto)(item);

const relationSelects = {};

const queryItems = entityName => {
  const query = repository(entityName).createQueryBuilder('item').select(selectFields[entityName] ?? selectFields.default);
  (relationFields[entityName] ?? []).forEach(([relation, alias]) => {
    const columns = relationSelects[entityName]?.[alias] ?? [`${alias}.id`, `${alias}.name`];
    query.leftJoin(relation, alias).addSelect(columns);
  });
  return query;
};

export const createItem = async (entityName, data) => {
  const saved = await repository(entityName).save(repository(entityName).create(data));
  const item = await queryItems(entityName).where('item.id = :id', { id: saved.id }).getOne();
  return toDto(entityName, item ?? saved);
};

export const listItems = async entityName => {
  const query = queryItems(entityName).where('item.status = :status', { status: 'E' });
  const [column, direction] = listOrder[entityName] ?? listOrder.default;
  query.orderBy(column, direction);
  return (await query.getMany()).map(item => toDto(entityName, item));
};

export const paginateItems = async (entityName, { offset, pageSize }) => {
  const query = queryItems(entityName).orderBy('item.id', 'DESC').skip(offset).take(pageSize);
  const [rows, total] = await query.getManyAndCount();
  return { rows: rows.map(item => toDto(entityName, item)), total };
};

export const updateItem = async (entityName, id, data) => (await repository(entityName).update(id, data)).affected > 0;

export const changeStatus = async (entityName, id, status) => (await repository(entityName).update(id, { status })).affected > 0;

export const deleteItem = async (entityName, id) => (await repository(entityName).delete(id)).affected > 0;
