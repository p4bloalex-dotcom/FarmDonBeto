import { AppDataSource } from '../../../config/data-source.js';

const menus = () => AppDataSource.getRepository('Menu');

export const listMenus = () => menus().createQueryBuilder('menu')
  .where('menu.status <> :inactive', { inactive: 'I' })
  .orderBy('menu.order', 'ASC')
  .addOrderBy('menu.name', 'ASC')
  .getMany();

export const getAccessMenus = async userId => {
  const result = await AppDataSource.query('SELECT SP_GET_ACCESS_MENUS(:userId) AS JSON_RESULT FROM DUAL', [userId]);
  return JSON.parse(result[0]?.JSON_RESULT ?? '[]');
};

export const createMenu = data => menus().save(menus().create(data));

export const updateMenu = async (id, data) => (await menus().update(id, data)).affected > 0;

export const changeMenuStatus = async (id, status) => (await menus().update(id, { status })).affected > 0;
