import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const connectString = process.env.ORACLE_CONNECT_STRING;
const adminUser = process.env.ORACLE_ADMIN_USER;
const adminPassword = process.env.ORACLE_ADMIN_PASSWORD;
const appUser = process.env.ORACLE_USER;

if (!adminPassword) {
  console.error('Falta ORACLE_ADMIN_PASSWORD en Core/.env (password del admin ' + (adminUser || 'SYSTEM') + ').');
  process.exit(1);
}

const asSys = adminUser && adminUser.toUpperCase() === 'SYS';

let conn;
try {
  conn = await oracledb.getConnection({
    user: adminUser,
    password: adminPassword,
    connectString,
    privilege: asSys ? oracledb.SYSDBA : undefined
  });
} catch (error) {
  console.error('No se pudo conectar como admin:', error.message);
  console.error('Verifica ORACLE_ADMIN_USER / ORACLE_ADMIN_PASSWORD y que el admin tenga acceso al PDB ' + connectString + '.');
  process.exit(1);
}

try {
  const exists = await conn.execute(
    `SELECT COUNT(*) C
       FROM ALL_OBJECTS
      WHERE OWNER = 'SYS'
        AND OBJECT_NAME = 'DBMS_REDEFINITION'
        AND OBJECT_TYPE IN ('PACKAGE', 'PACKAGE BODY')`
  );
  const packageRows = Number(exists.rows[0][0]);
  if (packageRows === 0) {
    console.error('SYS.DBMS_REDEFINITION no existe en esta base/PDB. Revisa que el PDB sea correcto o reinstala el paquete.');
    process.exit(1);
  }

  const granted = await conn.execute(
    `SELECT COUNT(*) C
       FROM DBA_TAB_PRIVS
      WHERE GRANTEE   = :app
        AND TABLE_NAME = 'DBMS_REDEFINITION'
        AND PRIVILEGE  = 'EXECUTE'`,
    { app: appUser }
  );
  if (Number(granted.rows[0][0]) > 0) {
    console.log('Ya concedido: APPFARMACIA tiene EXECUTE sobre SYS.DBMS_REDEFINITION.');
  } else {
    await conn.execute(`GRANT EXECUTE ON SYS.DBMS_REDEFINITION TO ${appUser}`);
    console.log(`GRANT OK: EXECUTE sobre SYS.DBMS_REDEFINITION -> ${appUser}`);
  }
} catch (error) {
  console.error('Fallo al conceder el privilegio:', error.message);
  process.exit(1);
} finally {
  if (conn) await conn.close();
}