import { AppDataSource } from '../../../config/data-source.js';

const companies = () => AppDataSource.getRepository('Company');

const toDto = item => item && ({
  id: item.id,
  name: item.name,
  phone: item.phone,
  idDepartment: item.idDepartment,
  id_department: item.idDepartment,
  idMunicipality: item.idMunicipality,
  id_municipality: item.idMunicipality,
  address: item.address,
  email: item.email,
  logo: item.logo,
  status: item.status
});

export const upsertFirstCompany = async data => {
  const repository = companies();
  const current = await repository.findOne({ order: { id: 'ASC' } });

  if (!current) {
    return toDto(await repository.save(repository.create(data)));
  }

  await repository.update(current.id, data);
  return toDto({ ...current, ...data });
};

export const findFirstCompany = async () => toDto(await companies().findOne({ order: { id: 'ASC' } }));

export const listCompanies = async () => (await companies().find({ order: { name: 'ASC' } })).map(({ id, name }) => ({ id, name }));
