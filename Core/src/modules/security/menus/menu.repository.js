import { AppDataSource } from '../../../config/data-source.js';

const menus = () => AppDataSource.getRepository('Menu');

export const listMenus = () => menus().createQueryBuilder('menu')
  .leftJoinAndSelect('menu.parent', 'parent')
  .where('menu.status = :status', { status: 'E' })
  .orderBy('menu.order', 'ASC')
  .addOrderBy('menu.name', 'ASC')
  .getMany();

export const getAccessMenus = async userId => {
  const user = await AppDataSource.getRepository('User').findOneBy({ id: userId, status: 'E' });
  if (!user) {
    return [];
  }

  const roleMenus = await AppDataSource.getRepository('RoleMenu')
    .createQueryBuilder('roleMenu')
    .innerJoinAndSelect('roleMenu.menu', 'menu')
    .where('roleMenu.idRole = :roleId', { roleId: user.idRole })
    .andWhere('roleMenu.status = :status', { status: 'E' })
    .andWhere('menu.status = :status', { status: 'E' })
    .orderBy('menu.order', 'ASC')
    .addOrderBy('menu.name', 'ASC')
    .getMany();

  const menusById = new Map(roleMenus.map(roleMenu => [roleMenu.menu.id, roleMenu.menu]));
  const childMenus = roleMenus
    .map(roleMenu => roleMenu.menu)
    .filter(menu => menu.idMenuFather && menusById.has(menu.idMenuFather));

  const navigation = roleMenus
    .map(roleMenu => roleMenu.menu)
    .filter(menu => !menu.idMenuFather)
    .map(parent => {
      const children = childMenus
        .filter(child => child.idMenuFather === parent.id)
        .map(child => ({
          id: child.id,
          title: child.name,
          type: 'basic',
          icon: child.icon,
          link: `${parent.path.replace(/\/$/, '')}/${child.path.replace(/^\//, '')}`.toLowerCase()
        }));

      return {
        id: parent.id,
        title: parent.name,
        type: children.length > 0 ? 'collapsable' : 'basic',
        icon: parent.icon,
        link: parent.path,
        children
      };
    });

  if (!navigation.some(item => item.link?.toLowerCase() === 'home')) {
    navigation.unshift({
      id: 'home',
      title: 'Home',
      type: 'basic',
      icon: 'heroicons_solid:home',
      link: 'home',
      children: []
    });
  }

  return navigation;
};

export const createMenu = data => menus().save(menus().create(data));

export const updateMenu = async (id, data) => (await menus().update(id, data)).affected > 0;

export const changeMenuStatus = async (id, status) => (await menus().update(id, { status })).affected > 0;
