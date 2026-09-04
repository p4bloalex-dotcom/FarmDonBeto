import { AppDataSource } from '../../../config/data-source.js';

export const listDepartments = async () => (await AppDataSource.getRepository('Department').find({
  where: { status: 'E' },
  order: { name: 'ASC' }
})).map(item => ({ id: item.id, id_department: item.id, name: item.name, status: item.status }));
