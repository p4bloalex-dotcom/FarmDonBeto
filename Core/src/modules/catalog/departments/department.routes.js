import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/async-handler.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { getDepartments } from './department.controller.js';

export const departmentRoutes = Router();

departmentRoutes.use(authenticate);
departmentRoutes.get('/', asyncHandler(getDepartments));
