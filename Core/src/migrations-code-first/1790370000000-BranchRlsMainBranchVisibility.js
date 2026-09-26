/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class BranchRlsMainBranchVisibility1790370000000 {
    name = 'BranchRlsMainBranchVisibility1790370000000';

    /** @param {QueryRunner} queryRunner */
    async up(queryRunner) {
        await queryRunner.query(`CREATE OR REPLACE FUNCTION F_BRANCH_RLS(P_SCHEMA VARCHAR2 DEFAULT NULL, P_OBJECT VARCHAR2 DEFAULT NULL)
      RETURN VARCHAR2 IS
        V_BRANCH VARCHAR2(4000) := SYS_CONTEXT('APP_CTX', 'BRANCH_ID');
      BEGIN
        IF V_BRANCH IS NULL OR TRIM(V_BRANCH) IS NULL THEN
          RETURN '';
        END IF;
        IF UPPER(P_OBJECT) = 'TB_BRANCH' THEN
          RETURN '(ID = ' || V_BRANCH || ' OR EXISTS (SELECT 1 FROM TB_BRANCH B_MAIN WHERE B_MAIN.ID = ' || V_BRANCH || ' AND B_MAIN.IS_MAIN = 1))';
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
        IF UPPER(P_OBJECT) = 'TB_CUSTOMER_ORDER_DETAIL' THEN
          RETURN 'EXISTS (SELECT 1 FROM TB_CUSTOMER_ORDER CO WHERE CO.ID = ORDER_ID AND CO.BRANCH_ID = ' || V_BRANCH || ')';
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

    /** @param {QueryRunner} queryRunner */
    async down(queryRunner) {
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
        IF UPPER(P_OBJECT) = 'TB_MOVE_INVENTORY' THEN
          RETURN '(BRANCH_ORIGIN_ID = ' || V_BRANCH || ' OR BRANCH_DESTINATION_ID = ' || V_BRANCH || ')';
        END IF;
        IF UPPER(P_OBJECT) = 'TB_DELIVERY_REQUEST' THEN
          RETURN '(REQUESTING_BRANCH_ID = ' || V_BRANCH || ' OR FULFILLMENT_BRANCH_ID = ' || V_BRANCH || ')';
        END IF;
        IF UPPER(P_OBJECT) = 'TB_DELIVERY_REQUEST_DETAIL' THEN
          RETURN 'EXISTS (SELECT 1 FROM TB_DELIVERY_REQUEST DR WHERE DR.ID = REQUEST_ID AND (DR.REQUESTING_BRANCH_ID = ' || V_BRANCH || ' OR DR.FULFILLMENT_BRANCH_ID = ' || V_BRANCH || '))';
        END IF;
        RETURN 'BRANCH_ID = ' || V_BRANCH;
      END F_BRANCH_RLS;`);
    }
}
