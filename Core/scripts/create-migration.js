import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));

const rawName = args.name || process.env.npm_config_name;

if (!rawName) {
  console.error('Debe indicar el nombre: npm run add-migration --name=NombreMigracion');
  process.exit(1);
}

const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '');

if (!safeName) {
  console.error('El nombre de la migracion no es valido. Use letras y numeros.');
  process.exit(1);
}

const timestamp = Date.now();
const className = `${safeName}${timestamp}`;
const migrationsDir = path.resolve('src/migrations');
const filePath = path.join(migrationsDir, `${timestamp}-${safeName}.js`);

fs.mkdirSync(migrationsDir, { recursive: true });

if (fs.existsSync(filePath)) {
  console.error(`Ya existe la migracion: ${filePath}`);
  process.exit(1);
}

const content = `export class ${className} {
  name = '${className}';

  async up(queryRunner) {
    // Escriba aqui los cambios de base de datos.
    // Ejemplo:
    // await queryRunner.query('ALTER TABLE TB_USER ADD CONSTRAINT FK_USER_PERSONAL FOREIGN KEY (ID_PERSONAL) REFERENCES TB_EMPLOYEE(ID)');
  }

  async down(queryRunner) {
    // Escriba aqui como revertir los cambios de up().
    // Ejemplo:
    // await queryRunner.query('ALTER TABLE TB_USER DROP CONSTRAINT FK_USER_PERSONAL');
  }
}
`;

fs.writeFileSync(filePath, content, 'utf8');

const dataSourcePath = path.resolve('src/config/data-source.js');
const relativeImport = `../migrations/${timestamp}-${safeName}.js`;

if (fs.existsSync(dataSourcePath)) {
  let dataSource = fs.readFileSync(dataSourcePath, 'utf8');
  const importLine = `import { ${className} } from '${relativeImport}';`;

  if (!dataSource.includes(importLine)) {
    const lastMigrationImport = [...dataSource.matchAll(/^import \{ .*? \} from '\.\.\/migrations\/.*?';$/gm)].pop();
    if (lastMigrationImport) {
      const insertAt = lastMigrationImport.index + lastMigrationImport[0].length;
      dataSource = `${dataSource.slice(0, insertAt)}\n${importLine}${dataSource.slice(insertAt)}`;
    }
  }

  if (!dataSource.includes(`${className}\n`)) {
    const migrationsMatch = dataSource.match(/migrations:\s*\[([\s\S]*?)\n\s*\]/m);
    if (migrationsMatch) {
      const fullMatch = migrationsMatch[0];
      const hasExistingItems = migrationsMatch[1].trim().length > 0;
      const replacement = fullMatch.replace(/\n\s*\]$/, `${hasExistingItems ? ',' : ''}\n    ${className}\n  ]`);
      dataSource = dataSource.replace(fullMatch, replacement);
    }
  }

  fs.writeFileSync(dataSourcePath, dataSource, 'utf8');
  console.log('Migracion registrada en src/config/data-source.js');
}

console.log(`Migracion creada: ${filePath}`);
