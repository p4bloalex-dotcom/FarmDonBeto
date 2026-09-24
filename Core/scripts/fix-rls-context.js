import 'dotenv/config';
import oracledb from 'oracledb';

const appUser = process.env.ORACLE_USER;
const adminUser = process.env.ORACLE_ADMIN_USER || appUser;
const adminPassword = process.env.ORACLE_ADMIN_PASSWORD || process.env.ORACLE_PASSWORD;
const adminConnectString = process.env.ORACLE_ADMIN_CONNECT_STRING || process.env.ORACLE_CONNECT_STRING;
const privilege = String(process.env.ORACLE_ADMIN_SYSDBA).toLowerCase() === 'true'
  ? oracledb.SYSDBA
  : undefined;

if (!appUser || !adminUser || !adminPassword || !adminConnectString) {
  throw new Error('Missing ORACLE_USER or Oracle admin connection variables');
}

const schema = appUser.toUpperCase();
let connection;

try {
  connection = await oracledb.getConnection({
    user: adminUser,
    password: adminPassword,
    connectString: adminConnectString,
    privilege
  });

  await connection.execute(`BEGIN
    EXECUTE IMMEDIATE 'DROP CONTEXT APP_CTX';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE != -4043 THEN
        RAISE;
      END IF;
  END;`);

  await connection.execute(`CREATE CONTEXT APP_CTX USING ${schema}.PKG_RLS_CTX`);
  await connection.execute(`BEGIN ${schema}.PKG_RLS_CTX.SET_BRANCH(NULL); END;`);

  console.log(`APP_CTX recreated using ${schema}.PKG_RLS_CTX`);
} finally {
  if (connection) await connection.close();
}
