import { AppDataSource } from '../../config/data-source.js';

const users = () => AppDataSource.getRepository('User');
const roles = () => AppDataSource.getRepository('Role');

export const findUserByName = userName => users().findOneBy({ name: userName });

export const findUserById = id => users().findOneBy({ id });

export const updateLastLogin = async (manager, id) => manager.getRepository('User').update(id, { lastLogin: new Date() });

export const updatePassword = async (manager, id, password, salt) => manager.getRepository('User').update(id, { password, salt, hasChangedPass: true });

export const findRoleName = async roleId => {
  const role = await roles().findOneBy({ id: roleId });
  return role?.name ?? null;
};
