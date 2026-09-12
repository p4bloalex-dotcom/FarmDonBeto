const TENANT_TABLES = [
  'TB_INVENTORY',
  'TB_SALE',
  'TB_PURCHASE',
  'TB_EMPLOYEE',
  'TB_CASH_REGISTER',
  'TB_CASH_SESSION',
  'TB_CASH_MOVEMENT',
  'TB_BRANCH'
];

export class BranchRls1757610000000 {
  name = 'BranchRls1757610000000';

  async up(queryRunner) {
    await queryRunner.query(`CREATE OR REPLACE PACKAGE PKG_RLS_CTX IS
      PROCEDURE SET_BRANCH(P_BRANCH NUMBER);
    END PKG_RLS_CTX;`);

    await queryRunner.query(`CREATE OR REPLACE PACKAGE BODY PKG_RLS_CTX IS
      PROCEDURE SET_BRANCH(P_BRANCH NUMBER) IS
      BEGIN
        DBMS_SESSION.SET_CONTEXT('APP_CTX', 'BRANCH_ID', TO_CHAR(P_BRANCH));
      END SET_BRANCH;
    END PKG_RLS_CTX;`);

    try {
      await queryRunner.query('CREATE CONTEXT APP_CTX USING PKG_RLS_CTX');
    } catch (error) {
      if (!String(error.message).includes('ORA-00955')) {
        throw error;
      }
    }

    await queryRunner.query(`CREATE OR REPLACE FUNCTION F_BRANCH_RLS(P_SCHEMA VARCHAR2 DEFAULT NULL, P_OBJECT VARCHAR2 DEFAULT NULL)
      RETURN VARCHAR2 IS
        V_BRANCH VARCHAR2(4000) := SYS_CONTEXT('APP_CTX', 'BRANCH_ID');
      BEGIN
        IF V_BRANCH IS NULL OR TRIM(V_BRANCH) IS NULL THEN
          RETURN '';
        END IF;
        IF UPPER(P_OBJECT) = 'TB_BRANCH' THEN
          RETURN 'ID = ' || V_BRANCH;
        END IF;
        RETURN 'BRANCH_ID = ' || V_BRANCH;
      END F_BRANCH_RLS;`);

    for (const table of TENANT_TABLES) {
      await queryRunner.query(`BEGIN
        DBMS_RLS.DROP_POLICY(USER, '${table}', 'RLS_BRANCH');
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;`);

      await queryRunner.query(`BEGIN
        DBMS_RLS.ADD_POLICY(
          OBJECT_SCHEMA => USER,
          OBJECT_NAME => '${table}',
          POLICY_NAME => 'RLS_BRANCH',
          STATEMENT_TYPES => 'SELECT',
          FUNCTION_SCHEMA => USER,
          POLICY_FUNCTION => 'F_BRANCH_RLS',
          UPDATE_CHECK => FALSE,
          ENABLE => TRUE
        );
      END;`);
    }
  }

  async down(queryRunner) {
    for (const table of TENANT_TABLES) {
      await queryRunner.query(`BEGIN
        DBMS_RLS.DROP_POLICY(USER, '${table}', 'RLS_BRANCH');
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;`);
    }

    await queryRunner.query('DROP FUNCTION F_BRANCH_RLS');
    await queryRunner.query('DROP CONTEXT APP_CTX');
    await queryRunner.query('DROP PACKAGE PKG_RLS_CTX');
  }
}