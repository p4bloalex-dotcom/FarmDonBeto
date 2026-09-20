import { AppDataSource } from '../../../config/data-source.js';

const roleMenus = () => AppDataSource.getRepository('RoleMenu');

const toDto = item => ({
  idRoleMenu: item.id,
  idRole: item.idRole,
  idMenu: item.idMenu,
  status: item.status
});

export const createRoleMenu = async data => toDto(await roleMenus().save(roleMenus().create(data)));

export const listRoleMenusByRole = async idRole => (await roleMenus().find({ where: { idRole } })).map(toDto);

export const updateRoleMenusBulk = async ({ idRole, menus }) => AppDataSource.transaction(async manager => {
  const repo = manager.getRepository('RoleMenu');

  for (const item of menus) {
    let roleMenu = await repo.findOneBy({ idRole, idMenu: item.idMenu });
    if (!roleMenu) {
      roleMenu = repo.create({ idRole, idMenu: item.idMenu });
    }

    roleMenu.status = item.isCheck ? 'E' : 'D';
    await repo.save(roleMenu);
  }

  return true;
});

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
