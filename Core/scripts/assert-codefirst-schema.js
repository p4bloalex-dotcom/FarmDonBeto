import process from 'node:process';
import CodeFirstDataSource from '../src/config/data-source-code-first.js';

const allowDirty = process.env.CODE_FIRST_ALLOW_DIRTY_SCHEMA === 'true';

const normalize = value => String(value ?? '').toUpperCase();

await CodeFirstDataSource.initialize();

try {
  const tables = await CodeFirstDataSource.query(`
    SELECT TABLE_NAME
    FROM USER_TABLES
    WHERE TABLE_NAME NOT IN ('MIGRATIONS_CODE_FIRST', 'TYPEORM_METADATA')
      AND NESTED = 'NO'
    ORDER BY TABLE_NAME
  `);

  const migrationTables = await CodeFirstDataSource.query(`
    SELECT TABLE_NAME
    FROM USER_TABLES
    WHERE TABLE_NAME = 'MIGRATIONS_CODE_FIRST'
  `);

  const appTables = tables.map(row => normalize(row.TABLE_NAME ?? row.table_name));
  const hasCodeFirstHistory = migrationTables.length > 0;

  if (appTables.length > 0 && !hasCodeFirstHistory && !allowDirty) {
    console.error('El esquema Oracle no esta limpio y no tiene historial Code First.');
    console.error('Para Code First puro use un usuario/esquema nuevo de Oracle o migre primero los datos.');
    console.error(`Tablas detectadas: ${appTables.slice(0, 20).join(', ')}${appTables.length > 20 ? '...' : ''}`);
    console.error('Si esta seguro de usar este esquema, ejecute con CODE_FIRST_ALLOW_DIRTY_SCHEMA=true.');
    process.exit(1);
  }
} finally {
  await CodeFirstDataSource.destroy();
}
