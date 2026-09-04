import { ok } from '../../../utils/api-response.js';
import { listMunicipalitiesByDepartment } from './municipality.repository.js';

export const getMunicipalitiesByDepartment = async (req, res) => ok(res, await listMunicipalitiesByDepartment(Number(req.params.idDepartment)));
