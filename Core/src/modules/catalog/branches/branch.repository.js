import { AppDataSource } from '../../../config/data-source.js';

const branches = () => AppDataSource.getRepository('Branch');

const toDto = item => ({
  id: item.id,
  idBranch: item.id,
  name: item.name,
  phone: item.phone,
  email: item.email,
  address: item.address,
  idDepartment: item.idDepartment,
  id_department: item.idDepartment,
  idMunicipality: item.idMunicipality,
  id_municipality: item.idMunicipality,
  companyId: item.companyId,
  company_id: item.companyId,
  status: item.status
});

export const createBranch = async data => toDto(await branches().save(branches().create(data)));

export const listBranches = async () => (await branches().find({ where: { status: 'E' }, order: { name: 'ASC' } })).map(toDto);

export const paginateBranches = async ({ offset, pageSize }) => {
  const [rows, total] = await branches().findAndCount({ order: { createdAt: 'DESC', id: 'DESC' }, skip: offset, take: pageSize });
  return { rows: rows.map(toDto), total };
};

export const updateBranch = async (id, data) => (await branches().update(id, data)).affected > 0;

export const changeBranchStatus = async (id, status) => (await branches().update(id, { status })).affected > 0;

export const deleteBranch = async id => (await branches().delete(id)).affected > 0;
