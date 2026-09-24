import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source.js';

const CodeFirstDataSource = new DataSource({
  ...AppDataSource.options,
  migrationsTableName: 'MIGRATIONS_CODE_FIRST',
  migrations: ['src/migrations-code-first/*.js']
});

export default CodeFirstDataSource;
