import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { getMunicipalitiesByDepartment } from './municipality.controller.js';

export const municipalityRoutes = Router();

municipalityRoutes.use(authenticate);
municipalityRoutes.get('/:idDepartment', asyncHandler(getMunicipalitiesByDepartment));
