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
if (!/^[A-Z][A-Z0-9_$#]*$/.test(schema)) {
  throw new Error(`Invalid ORACLE_USER schema name: ${appUser}`);
}
let connection;

try {
  connection = await oracledb.getConnection({
    user: adminUser,
    password: adminPassword,
    connectString: adminConnectString,
    privilege
  });

  await connection.execute(`CREATE OR REPLACE PACKAGE ${schema}.PKG_RLS_CTX IS
    PROCEDURE SET_BRANCH(P_BRANCH NUMBER, P_IS_MAIN NUMBER DEFAULT 0);
  END PKG_RLS_CTX;`);

  await connection.execute(`CREATE OR REPLACE PACKAGE BODY ${schema}.PKG_RLS_CTX IS
    PROCEDURE SET_BRANCH(P_BRANCH NUMBER, P_IS_MAIN NUMBER DEFAULT 0) IS
    BEGIN
      DBMS_SESSION.SET_CONTEXT('APP_CTX', 'BRANCH_ID', TO_CHAR(P_BRANCH));
      DBMS_SESSION.SET_CONTEXT('APP_CTX', 'BRANCH_IS_MAIN', TO_CHAR(COALESCE(P_IS_MAIN, 0)));
    END SET_BRANCH;
  END PKG_RLS_CTX;`);

  await connection.execute(`CREATE OR REPLACE FUNCTION ${schema}.F_BRANCH_RLS(P_SCHEMA VARCHAR2 DEFAULT NULL, P_OBJECT VARCHAR2 DEFAULT NULL)
    RETURN VARCHAR2 IS
      V_BRANCH VARCHAR2(4000) := SYS_CONTEXT('APP_CTX', 'BRANCH_ID');
      V_IS_MAIN VARCHAR2(10) := SYS_CONTEXT('APP_CTX', 'BRANCH_IS_MAIN');
    BEGIN
      IF V_BRANCH IS NULL OR TRIM(V_BRANCH) IS NULL OR V_IS_MAIN = '1' THEN
        RETURN '';
      END IF;
      IF UPPER(P_OBJECT) = 'TB_BRANCH' THEN
        RETURN 'ID = ' || V_BRANCH;
      END IF;
      IF UPPER(P_OBJECT) = 'TB_MOVE_INVENTORY' THEN
        RETURN '(BRANCH_ORIGIN_ID = ' || V_BRANCH || ' OR BRANCH_DESTINATION_ID = ' || V_BRANCH || ')';
      END IF;
      IF UPPER(P_OBJECT) = 'TB_DELIVERY_REQUEST' THEN
        RETURN '(REQUESTING_BRANCH_ID = ' || V_BRANCH || ' OR FULFILLMENT_BRANCH_ID = ' || V_BRANCH || ')';
      END IF;
      IF UPPER(P_OBJECT) = 'TB_DELIVERY_REQUEST_DETAIL' THEN
        RETURN 'EXISTS (SELECT 1 FROM TB_DELIVERY_REQUEST DR WHERE DR.ID = REQUEST_ID AND (DR.REQUESTING_BRANCH_ID = ' || V_BRANCH || ' OR DR.FULFILLMENT_BRANCH_ID = ' || V_BRANCH || '))';
      END IF;
      IF UPPER(P_OBJECT) = 'TB_SALE_DETAIL' THEN
        RETURN 'EXISTS (SELECT 1 FROM TB_SALE S WHERE S.ID = SALE_ID AND S.BRANCH_ID = ' || V_BRANCH || ')';
      END IF;
      IF UPPER(P_OBJECT) = 'TB_CUSTOMER_ORDER_DETAIL' THEN
        RETURN 'EXISTS (SELECT 1 FROM TB_CUSTOMER_ORDER CO WHERE CO.ID = ORDER_ID AND CO.BRANCH_ID = ' || V_BRANCH || ')';
      END IF;
      RETURN 'BRANCH_ID = ' || V_BRANCH;
    END F_BRANCH_RLS;`);

  await connection.execute(`BEGIN
    EXECUTE IMMEDIATE 'DROP CONTEXT APP_CTX';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE != -4043 THEN
        RAISE;
      END IF;
  END;`);

  await connection.execute(`CREATE CONTEXT APP_CTX USING ${schema}.PKG_RLS_CTX`);
  await connection.execute(`BEGIN ${schema}.PKG_RLS_CTX.SET_BRANCH(NULL, 0); END;`);

  console.log(`RLS context, package and predicate repaired for ${schema}`);
} finally {
  if (connection) await connection.close();
}
