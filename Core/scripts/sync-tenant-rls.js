import { AppDataSource } from '../src/config/data-source.js';
import { addBranchRlsPolicy } from '../src/tenant/tenant-tables.js';

const dataSource = AppDataSource;

await dataSource.initialize();
const queryRunner = dataSource.createQueryRunner();

try {
  const tenantTables = dataSource.entityMetadatas
    .filter(metadata => metadata.columns.some(column => column.propertyName === 'branchId' || column.databaseName === 'BRANCH_ID'))
    .map(metadata => metadata.tableName.toUpperCase())
    .sort();

  for (const tableName of tenantTables) {
    await addBranchRlsPolicy(queryRunner, tableName);
  }

  console.log(`RLS sincronizado para ${tenantTables.length} tablas tenant:`);
  console.log(tenantTables.join(', '));
} finally {
  await queryRunner.release();
  await dataSource.destroy();
}
