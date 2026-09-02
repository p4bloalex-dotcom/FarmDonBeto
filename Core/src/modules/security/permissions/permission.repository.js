import { AppDataSource } from '../../../config/data-source.js';

const permissions = () => AppDataSource.getRepository('Permission');

export const validateUserAccess = async (userId, permissionName, menuPath) => {
  const result = await AppDataSource.query(
    'SELECT SP_VALIDATE_USER_ACCESS(:userId, :permissionName, :menuPath) AS HAS_ACCESS FROM DUAL',
    [userId, permissionName, menuPath]
  );
  return Number(result[0]?.HAS_ACCESS) === 1;
};

export const listPermissions = () => permissions().find({ order: { category: 'ASC', name: 'ASC' } });

export const updateRolePermission = ({ roleId, permissionId, isCheck }) => AppDataSource.query(
  'BEGIN SP_UPDATE_ROLE_PERMISSION(:roleId, :permissionId, :isCheck); END;',
  [roleId, permissionId, isCheck ? 1 : 0]
);
