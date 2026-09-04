import { validateUserAccess } from '../modules/security/permissions/permission.repository.js';
import { forbidden, unauthorized } from '../utils/api-response.js';

export const permissionRequired = routeMetadata => async (req, res, next) => {
  if (!req.user?.id) {
    return unauthorized(res);
  }

  const permissionName = routeMetadata.permissionName;
  const menuPath = routeMetadata.menuPath;
  const hasAccess = await validateUserAccess(req.user.id, permissionName, menuPath);

  if (!hasAccess) {
    return forbidden(res, 'No tienes permiso para esta accion.');
  }

  req.permissionName = permissionName;
  req.routeMetadata = routeMetadata;
  return next();
};
