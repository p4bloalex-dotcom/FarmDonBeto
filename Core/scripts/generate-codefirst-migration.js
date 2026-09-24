import { spawnSync } from 'node:child_process';
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

const migrationPath = `src/migrations-code-first/${safeName}`;
const result = spawnSync('npx', [
  'typeorm',
  'migration:generate',
  '-d',
  'src/config/data-source-code-first.js',
  migrationPath,
  '--outputJs'
], { stdio: 'inherit', shell: false });

if (result.status !== 0) process.exit(result.status ?? 1);

const migrationsDir = path.resolve('src/migrations-code-first');
const generated = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith(`${safeName}.js`))
  .map(file => path.join(migrationsDir, file))
  .sort()
  .pop();

if (!generated) {
  console.error('No se encontro la migracion generada para convertirla a ESModule.');
  process.exit(1);
}

let content = fs.readFileSync(generated, 'utf8');
content = content.replace(/module\.exports\s*=\s*class\s+([A-Za-z0-9_]+)/, 'export class $1');
fs.writeFileSync(generated, content, 'utf8');
console.log(`Migracion Code First generada: ${generated}`);
