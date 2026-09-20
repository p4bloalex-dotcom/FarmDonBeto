import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const generalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta nuevamente mas tarde.' }
});

export const loginRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.' }
});
