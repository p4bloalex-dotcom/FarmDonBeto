export class BranchRlsFixBranchTable1757865600000 {
  name = 'BranchRlsFixBranchTable1757865600000';

  async up(queryRunner) {
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

    await queryRunner.query(`BEGIN
        DBMS_RLS.DROP_POLICY(USER, 'TB_BRANCH', 'RLS_BRANCH');
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;`);

    await queryRunner.query(`BEGIN
        DBMS_RLS.ADD_POLICY(
          OBJECT_SCHEMA => USER,
          OBJECT_NAME => 'TB_BRANCH',
          POLICY_NAME => 'RLS_BRANCH',
          STATEMENT_TYPES => 'SELECT',
          FUNCTION_SCHEMA => USER,
          POLICY_FUNCTION => 'F_BRANCH_RLS',
          UPDATE_CHECK => FALSE,
          ENABLE => TRUE
        );
      END;`);
  }

  async down(queryRunner) {
    await queryRunner.query(`BEGIN
        DBMS_RLS.DROP_POLICY(USER, 'TB_BRANCH', 'RLS_BRANCH');
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;`);
  }
}