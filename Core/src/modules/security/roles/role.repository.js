import { AppDataSource } from '../../../config/data-source.js';

const roles = () => AppDataSource.getRepository('Role');

export const createRole = data => roles().save(roles().create(data));

export const listRoles = () => roles().find({ order: { name: 'ASC' } });

export const paginateRoles = async ({ offset, pageSize }) => {
  const [rows, total] = await roles().findAndCount({
    order: { updatedAt: 'DESC', id: 'DESC' },
    skip: offset,
    take: pageSize
  });
  return { rows, total };
};

export const updateRole = async (id, data) => (await roles().update(id, data)).affected > 0;

export const deleteRole = async id => (await roles().delete(id)).affected > 0;

export const getRolePermissions = async id => {
  const result = await AppDataSource.query('SELECT SP_GET_ROLE_PERMISSIONS(:id) AS JSON_RESULT FROM DUAL', [id]);
  return JSON.parse(result[0]?.JSON_RESULT ?? '{}');
};
