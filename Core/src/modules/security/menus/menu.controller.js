import { created, notFound, ok } from '../../../utils/api-response.js';
import { changeMenuStatus, createMenu, getAccessMenus, listMenus, updateMenu } from './menu.repository.js';

export const addMenu = async (req, res) => created(res, await createMenu(req.body));
export const getMenus = async (_req, res) => ok(res, await listMenus());
export const accessMenus = async (req, res) => ok(res, await getAccessMenus(req.user.id));

export const editMenu = async (req, res) => {
  const updated = await updateMenu(Number(req.params.id), req.body);
  return updated ? ok(res, null, 'Registro actualizado correctamente.') : notFound(res);
};

export const updateMenuStatus = async (req, res) => {
  const updated = await changeMenuStatus(Number(req.params.id), req.body.status);
  return updated ? ok(res, null, 'Estado actualizado correctamente.') : notFound(res);
};
