import { AppDataSource } from '../../../config/data-source.js';
import { Not } from 'typeorm';

const branches = () => AppDataSource.getRepository('Branch');

const toDto = item => ({
  id: item.id,
  idBranch: item.id,
  name: item.name,
  phone: item.phone,
  email: item.email,
  address: item.address,
  branchType: item.branchType,
  branch_type: item.branchType,
  idDepartment: item.idDepartment,
  id_department: item.idDepartment,
  idMunicipality: item.idMunicipality,
  id_municipality: item.idMunicipality,
  companyId: item.companyId,
  company_id: item.companyId,
  status: item.status,
  isMain: item.isMain,
  is_main: item.isMain,
  latitude: item.latitude == null ? null : Number(item.latitude),
  longitude: item.longitude == null ? null : Number(item.longitude),
  coverageRadiusKm: Number(item.coverageRadiusKm ?? 8),
  coverage_radius_km: Number(item.coverageRadiusKm ?? 8),
  averageDeliveryMinutes: Number(item.averageDeliveryMinutes ?? 25),
  average_delivery_minutes: Number(item.averageDeliveryMinutes ?? 25)
});

export const createBranch = async data => {
  if (data.isMain === 1) {
    await branches().createQueryBuilder().update().set({ isMain: 0 }).execute();
  }
  return toDto(await branches().save(branches().create(data)));
};

export const listBranches = async () => (await branches().find({ where: { status: 'E' }, order: { name: 'ASC' } })).map(toDto);

export const paginateBranches = async ({ offset, pageSize }) => {
  const [rows, total] = await branches().findAndCount({ order: { createdAt: 'DESC', id: 'DESC' }, skip: offset, take: pageSize });
  return { rows: rows.map(toDto), total };
};

export const updateBranch = async (id, data) => {
  if (data.isMain === 1) {
    await branches().createQueryBuilder().update().set({ isMain: 0 }).execute();
  } else {
    delete data.isMain;
    const current = await branches().findOne({ where: { id } });
    if (current?.isMain === 1) {
      const [candidate] = await branches().find({ where: { id: Not(id) }, order: { id: 'ASC' }, take: 1 });
      if (candidate) await branches().update(candidate.id, { isMain: 1 });
    }
  }
  return (await branches().update(id, data)).affected > 0;
};

export const changeBranchStatus = async (id, status) => (await branches().update(id, { status })).affected > 0;

export const deleteBranch = async id => (await branches().delete(id)).affected > 0;
