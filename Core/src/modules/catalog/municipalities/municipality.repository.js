import { AppDataSource } from '../../../config/data-source.js';

export const listMunicipalitiesByDepartment = async idDepartment => (await AppDataSource.getRepository('Municipality').find({
  where: { idDepartment, status: 'E' },
  order: { name: 'ASC' }
})).map(item => ({ id: item.id, id_municipality: item.id, idDepartment: item.idDepartment, id_department: item.idDepartment, name: item.name, status: item.status }));
