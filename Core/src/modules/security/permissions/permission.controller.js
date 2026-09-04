import { ok } from '../../../utils/api-response.js';
import { getRegisteredScreens } from '../../../routes/route-registry.js';
import { listPermissions, updateRolePermission } from './permission.repository.js';

export const getPermissions = async (_req, res) => ok(res, await listPermissions());

export const getPermissionScreens = async (_req, res) => {
  const screens = getRegisteredScreens().map(screen => ({
    category: screen.category,
    controller: screen.controller,
    routePath: screen.routePath,
    title: screen.title,
    icon: screen.icon,
    permissions: Object.values(screen.permissions)
  }));

  return ok(res, screens);
};

export const setRolePermission = async (req, res) => {
  await updateRolePermission(req.body);
  return ok(res, null, 'Permiso actualizado correctamente.');
};
