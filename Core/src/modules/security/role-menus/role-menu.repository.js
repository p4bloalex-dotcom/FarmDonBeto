import { AppDataSource } from '../../../config/data-source.js';

const roleMenus = () => AppDataSource.getRepository('RoleMenu');

const toDto = item => ({
  idRoleMenu: item.id,
  idRole: item.idRole,
  idMenu: item.idMenu,
  status: item.status
});

export const createRoleMenu = async data => toDto(await roleMenus().save(roleMenus().create(data)));

export const paginateRoleMenus = async ({ offset, pageSize }, idRole) => {
  const where = idRole ? { idRole } : {};
  const [rows, total] = await roleMenus().findAndCount({
    where,
    order: { createdAt: 'DESC', id: 'DESC' },
    skip: offset,
    take: pageSize
  });
  return { rows: rows.map(toDto), total };
};

export const updateRoleMenu = async (id, data) => (await roleMenus().update(id, data)).affected > 0;

export const deleteRoleMenu = async id => (await roleMenus().delete(id)).affected > 0;
