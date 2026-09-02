import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { loginRateLimiter } from '../../middlewares/rate-limit.js';
import { validate } from '../../middlewares/validate.js';
import { changePassword, login, signToken } from './auth.controller.js';
import { changePasswordSchema, loginSchema } from './auth.validation.js';

export const authRoutes = Router();

authRoutes.post('/login', loginRateLimiter, validate(loginSchema), asyncHandler(login));
authRoutes.post('/sign-token', authenticate, asyncHandler(signToken));
authRoutes.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(changePassword));
