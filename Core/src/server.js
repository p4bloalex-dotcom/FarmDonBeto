import { createApp } from './app.js';
import { AppDataSource } from './config/data-source.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { runSecuritySeeders } from './seeders/security.seeder.js';

const start = async () => {
  await AppDataSource.initialize();
  logger.info('TypeORM data source initialized');

  const app = createApp();

  if (env.runSeeders) {
    await runSecuritySeeders();
  }

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, 'Core API started');
  });

  const shutdown = async signal => {
    logger.info({ signal }, 'Shutting down Core API');
    server.close(async () => {
      await AppDataSource.destroy();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch(error => {
  logger.fatal({ error }, 'Unable to start Core API');
  process.exit(1);
});
