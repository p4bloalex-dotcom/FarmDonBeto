import { ok } from '../../../utils/api-response.js';
import { getRegisteredScreens } from '../../../routes/route-registry.js';
import { listPermissions, updateRolePermission, validateCurrentUserAccess } from './permission.repository.js';

export const getPermissions = async (_req, res) => ok(res, await listPermissions());

export const getPermissionScreens = async (_req, res) => {
  const permissionsByName = new Map((await listPermissions()).map(permission => [permission.name, permission]));
  const screens = getRegisteredScreens().map(screen => ({
    category: screen.category,
    controller: screen.controller,
    routePath: screen.routePath,
    title: screen.title,
    icon: screen.icon,
    permissions: Object.values(screen.permissions).map(permission => ({
      ...permission,
      id: permissionsByName.get(permission.permissionName)?.id ?? null
    }))
  }));

  return ok(res, screens);
};

export const checkAccess = async (req, res) => ok(res, {
  hasAccess: await validateCurrentUserAccess({
    userId: req.user.id,
    menuPath: req.query.menuPath,
    action: req.query.action ?? 'Ver'
  })
});

export const setRolePermission = async (req, res) => {
  await updateRolePermission(req.body);
  return ok(res, null, 'Permiso actualizado correctamente.');
};
