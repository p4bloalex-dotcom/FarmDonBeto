import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { getSummary } from './dashboard.controller.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);
dashboardRoutes.get('/summary', asyncHandler(getSummary));
