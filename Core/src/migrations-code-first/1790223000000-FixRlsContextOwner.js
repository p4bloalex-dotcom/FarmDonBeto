export class FixRlsContextOwner1790223000000 {
  name = 'FixRlsContextOwner1790223000000';

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

    await queryRunner.query(`BEGIN
      EXECUTE IMMEDIATE 'DROP CONTEXT APP_CTX';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -1031 AND SQLCODE != -4043 THEN
          RAISE;
        END IF;
    END;`);

    await queryRunner.query(`DECLARE
      V_SCHEMA VARCHAR2(128) := SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA');
    BEGIN
      EXECUTE IMMEDIATE 'CREATE CONTEXT APP_CTX USING ' || DBMS_ASSERT.SCHEMA_NAME(V_SCHEMA) || '.PKG_RLS_CTX';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 AND SQLCODE != -1031 THEN
          RAISE;
        END IF;
    END;`);

    await queryRunner.query('BEGIN PKG_RLS_CTX.SET_BRANCH(NULL); END;');
  }

  async down() {}
}
