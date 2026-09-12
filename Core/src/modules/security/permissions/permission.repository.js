import { AppDataSource } from '../../../config/data-source.js';

const rolePermissions = () => AppDataSource.getRepository('RolePermission');

export const validateUserAccess = async (userId, permissionName, menuPath) => {
  const result = await AppDataSource.query(
    'SELECT SP_VALIDATE_USER_ACCESS(:userId, :permissionName, :menuPath) AS HAS_ACCESS FROM DUAL',
    [userId, permissionName, menuPath]
  );
  return Number(result[0]?.HAS_ACCESS) === 1;
};

export const listPermissions = () => AppDataSource.getRepository('Permission').find({ order: { category: 'ASC', name: 'ASC' } });

export const updateRolePermission = async ({ roleId, permissionId, isCheck, isGlobal = false }) => {
  const repo = rolePermissions();
  let rolePermission = await repo.findOneBy({ idRole: roleId, idPermission: permissionId });

  if (!rolePermission) {
    rolePermission = repo.create({ idRole: roleId, idPermission: permissionId, status: 'E' });
  }

  rolePermission.isCheck = isCheck;
  rolePermission.isGlobal = isGlobal;

  await repo.save(rolePermission);
  return true;
};
