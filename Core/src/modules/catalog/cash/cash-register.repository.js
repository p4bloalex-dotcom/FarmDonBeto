import { AppDataSource } from '../../../config/data-source.js';

const registers = () => AppDataSource.getRepository('CashRegister');

const toDto = item => ({
  id: item.id,
  branchId: item.branchId,
  branch_id: item.branchId,
  branchName: item.branch?.name ?? null,
  name: item.name,
  code: item.code,
  status: item.status
});

const queryBase = () => registers().createQueryBuilder('item')
  .leftJoin('item.branch', 'branch')
  .addSelect(['branch.id', 'branch.name']);

export const createRegister = async data => {
  const saved = await registers().save(registers().create(data));
  const item = await queryBase().where('item.id = :id', { id: saved.id }).getOne();
  return toDto(item ?? saved);
};

export const findActiveBranch = async id => AppDataSource.getRepository('Branch').findOneBy({ id, status: 'E' });

export const findRegisterByBranchAndName = async (branchId, name, excludeId = null) => {
  const query = registers().createQueryBuilder('item')
    .where('item.branchId = :branchId', { branchId })
    .andWhere('item.name = :name', { name });
  if (excludeId) {
    query.andWhere('item.id != :excludeId', { excludeId });
  }
  return query.getOne();
};

export const findRegisterByCode = async (code, excludeId = null) => {
  const query = registers().createQueryBuilder('item').where('item.code = :code', { code });
  if (excludeId) {
    query.andWhere('item.id != :excludeId', { excludeId });
  }
  return query.getOne();
};

export const findRegisterWithBranch = async id => queryBase().where('item.id = :id', { id }).getOne();

export const findOpenSessionByRegister = async registerId => {
  const sessionRepository = AppDataSource.getRepository('CashSession');
  return sessionRepository.findOneBy({ cashRegisterId: registerId, status: 'A' });
};

export const listRegisters = async () => {
  const rows = await queryBase().where('item.status = :status', { status: 'E' }).orderBy('item.name', 'ASC').getMany();
  return rows.map(toDto);
};

export const paginateRegisters = async ({ offset, pageSize }) => {
  const [rows, total] = await queryBase().orderBy('item.id', 'DESC').skip(offset).take(pageSize).getManyAndCount();
  return { rows: rows.map(toDto), total };
};

export const updateRegister = async (id, data) => (await registers().update(id, data)).affected > 0;

export const changeRegisterStatus = async (id, status) => (await registers().update(id, { status })).affected > 0;

export const deleteRegister = async id => (await registers().delete(id)).affected > 0;