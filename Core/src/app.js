import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { clearCacheAfterWrite, noStoreApiCache } from './middlewares/cache-control.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { generalRateLimiter } from './middlewares/rate-limit.js';
import { routes } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  
  app.disable('x-powered-by');
  app.set('etag', false);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true, exposedHeaders: ['X-Pagination', 'Content-Disposition'] }));
  app.use(compression());
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use('/uploads', express.static(path.resolve('public/uploads')));
  app.use(generalRateLimiter);

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(env.apiPrefix, noStoreApiCache, clearCacheAfterWrite, routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
