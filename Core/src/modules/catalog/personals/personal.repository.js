import { AppDataSource } from '../../../config/data-source.js';

const employees = () => AppDataSource.getRepository('Employee');

const toDto = item => ({
  id: item.id,
  idPersonal: item.id,
  name: [item.firstName, item.lastName, item.secondLastname].filter(Boolean).join(' '),
  first_name: item.firstName,
  middle_name: item.middleName,
  other_names: item.otherNames,
  last_name: item.lastName,
  second_lastname: item.secondLastname,
  phone: item.phone,
  gender: item.gender,
  email: item.email,
  status: item.status,
  company_id: item.companyId,
  companyId: item.companyId
});

export const createPersonal = async data => toDto(await employees().save(employees().create(data)));

export const listPersonals = async () => (await employees().find({ order: { firstName: 'ASC', lastName: 'ASC' } })).map(toDto);

export const paginatePersonals = async ({ offset, pageSize }) => {
  const [rows, total] = await employees().findAndCount({
    order: { createdAt: 'DESC', id: 'DESC' },
    skip: offset,
    take: pageSize
  });
  return { rows: rows.map(toDto), total };
};

export const updatePersonal = async (id, data) => (await employees().update(id, data)).affected > 0;

export const changePersonalStatus = async (id, status) => AppDataSource.transaction(async manager => {
  const employeeUpdated = (await manager.getRepository('Employee').update(id, { status })).affected > 0;
  if (employeeUpdated && status === 'D') {
    await manager.getRepository('User').update({ idPersonal: id }, { status: 'D' });
  }
  return employeeUpdated;
});

export const deletePersonal = async id => (await employees().delete(id)).affected > 0;
