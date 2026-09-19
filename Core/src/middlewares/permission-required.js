import { validateUserAccess } from '../modules/security/permissions/permission.repository.js';
import { forbidden, serverError, unauthorized } from '../utils/api-response.js';
import { getRequestContext } from '../utils/request-context.js';

export const permissionRequired = routeMetadata => async (req, res, next) => {
  if (!req.user?.id) {
    return unauthorized(res);
  }

  if (!routeMetadata?.permissionName) {
    return serverError(res, 'Permiso de ruta no configurado.');
  }

  const permissionName = routeMetadata.permissionName;
  const menuPath = routeMetadata.menuPath;
  const hasAccess = await validateUserAccess(req.user.id, permissionName, menuPath);

  if (!hasAccess) {
    return forbidden(res, 'No tienes permiso para esta accion.');
  }

  req.permissionName = permissionName;
  req.routeMetadata = routeMetadata;

  const store = getRequestContext();
  if (store) {
    store.permissionName = permissionName;
    store.routeMetadata = routeMetadata;
  }

  return next();
};
