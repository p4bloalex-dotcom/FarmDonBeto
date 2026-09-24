import oracledb from 'oracledb';
import process from 'node:process';
import { env } from '../src/config/env.js';

const targetUser = (process.env.CODE_FIRST_USER || 'APPFARMACIA_CF').toUpperCase();
const targetPassword = process.env.CODE_FIRST_PASSWORD || env.oracle.password;

const quoteIdent = value => {
  if (!/^[A-Z][A-Z0-9_#$]{0,127}$/.test(value)) {
    throw new Error(`Nombre de usuario Oracle no valido: ${value}`);
  }
  return value;
};

const escapePassword = value => String(value).replaceAll('"', '""');

const grants = [
  'CREATE SESSION',
  'CREATE TABLE',
  'CREATE VIEW',
  'CREATE SEQUENCE',
  'CREATE PROCEDURE',
  'CREATE TRIGGER',
  'CREATE TYPE',
  'CREATE ANY CONTEXT'
];

let connection;

try {
  connection = await oracledb.getConnection({
    user: env.oracle.adminUser,
    password: env.oracle.adminPassword,
    connectString: env.oracle.adminConnectString,
    privilege: env.oracle.adminSysdba ? oracledb.SYSDBA : undefined
  });

  const user = quoteIdent(targetUser);
  const existing = await connection.execute(
    'SELECT USERNAME FROM ALL_USERS WHERE USERNAME = :targetUser',
    { targetUser: user }
  );

  if (existing.rows.length === 0) {
    await connection.execute(`CREATE USER ${user} IDENTIFIED BY "${escapePassword(targetPassword)}"`);
    console.log(`Usuario creado: ${user}`);
  } else {
    await connection.execute(`ALTER USER ${user} IDENTIFIED BY "${escapePassword(targetPassword)}" ACCOUNT UNLOCK`);
    console.log(`Usuario existente actualizado/desbloqueado: ${user}`);
  }

  for (const grant of grants) {
    await connection.execute(`GRANT ${grant} TO ${user}`);
  }

  await connection.execute(`GRANT EXECUTE ON DBMS_RLS TO ${user}`);

  try {
    await connection.execute(`GRANT UNLIMITED TABLESPACE TO ${user}`);
  } catch {
    await connection.execute(`ALTER USER ${user} QUOTA UNLIMITED ON USERS`);
  }

  console.log(`Privilegios Code First asignados a ${user}`);
  console.log('Configure .env con ORACLE_USER y ORACLE_PASSWORD del nuevo usuario para usar Code First puro.');
} catch (error) {
  console.error('No se pudo crear el usuario Code First.');
  console.error(error.message);
  console.error('El usuario configurado en .env necesita privilegios para CREATE USER y GRANT, o debe ejecutar este comando con un usuario DBA.');
  process.exit(1);
} finally {
  if (connection) await connection.close();
}
