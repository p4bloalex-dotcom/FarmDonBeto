import { AppDataSource } from '../src/config/data-source.js';
import {
  TENANT_TABLES,
  addBranchRlsPolicy
} from '../src/tenant/tenant-tables.js';

const dataSource = AppDataSource;

await dataSource.initialize();
const queryRunner = dataSource.createQueryRunner();

try {
  // Tablas detectadas automáticamente por tener BRANCH_ID
  const metadataTables = dataSource.entityMetadatas
    .filter(metadata =>
      metadata.columns.some(
        column =>
          column.propertyName === 'branchId' ||
          column.databaseName === 'BRANCH_ID'
      )
    )
    .map(metadata => metadata.tableName.toUpperCase());

  // Combinar tablas automáticas + tablas especiales
  const tenantTables = [
    ...new Set([
      ...TENANT_TABLES,
      ...metadataTables
    ])
  ].sort();

  for (const tableName of tenantTables) {
    await addBranchRlsPolicy(queryRunner, tableName);
  }

  console.log(`RLS sincronizado para ${tenantTables.length} tablas tenant:`);
  console.log(tenantTables.join(', '));
} finally {
  await queryRunner.release();
  await dataSource.destroy();
}