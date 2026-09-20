const PARTITIONED_TABLES = [
  { tableName: 'TB_SALE', dateColumn: 'SALE_DATE', branchColumn: 'BRANCH_ID' },
  { tableName: 'TB_PURCHASE', dateColumn: 'PURCHASE_DATE', branchColumn: 'BRANCH_ID' },
  { tableName: 'TB_CASH_MOVEMENT', dateColumn: 'MOVEMENT_DATE', branchColumn: 'BRANCH_ID' },
  { tableName: 'TB_MOVE_INVENTORY', dateColumn: 'MOVEMENT_DATE', branchColumn: 'BRANCH_ORIGIN_ID' },
  { tableName: 'TB_INVENTORY_KARDEX', dateColumn: 'MOVEMENT_DATE', branchColumn: 'BRANCH_ID' },
  { tableName: 'TB_INVENTORY_ADJUSTMENT', dateColumn: 'ADJUSTMENT_DATE', branchColumn: 'BRANCH_ID' }
];

const SUBPARTITION_COUNT = 16;
const SUBPARTITION_TEMPLATE = Array.from(
  { length: SUBPARTITION_COUNT },
  (_, i) => `SUBPARTITION SP${String(i + 1).padStart(2, '0')}`
).join(', ');

export class PartitionTransactionTables1806000000000 {
  name = 'PartitionTransactionTables1806000000000';

  async up(queryRunner) {
    await queryRunner.query(`BEGIN
      EXECUTE IMMEDIATE 'CREATE TABLE TB_DB_MAINTENANCE_MARKER (
        NAME VARCHAR2(100) PRIMARY KEY,
        APPLIED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
      )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF;
    END;`);

    for (const { tableName, dateColumn, branchColumn } of PARTITIONED_TABLES) {
      await queryRunner.query(`DECLARE
        v_marker_count NUMBER;
        v_partition_count NUMBER;
        v_redef_priv NUMBER;
        v_copy_errors NUMBER;
        v_interim_table VARCHAR2(128) := '${tableName}_P_INT';
      BEGIN
        SELECT COUNT(*)
          INTO v_redef_priv
          FROM USER_TAB_PRIVS
         WHERE TABLE_NAME = 'DBMS_REDEFINITION'
           AND PRIVILEGE = 'EXECUTE';

        IF v_redef_priv = 0 THEN
          RAISE_APPLICATION_ERROR(-20001,
            'El usuario no tiene EXECUTE sobre SYS.DBMS_REDEFINITION. ' ||
            'Corre como SYSTEM/SYS: GRANT EXECUTE ON SYS.DBMS_REDEFINITION TO ' ||
            USER || '.');
        END IF;

        SELECT COUNT(*) INTO v_marker_count
        FROM TB_DB_MAINTENANCE_MARKER
        WHERE NAME = 'PARTITION_${tableName}';

        IF v_marker_count > 0 THEN
          RETURN;
        END IF;

        SELECT COUNT(*) INTO v_partition_count
        FROM USER_PART_TABLES
        WHERE TABLE_NAME = '${tableName}';

        IF v_partition_count > 0 THEN
          INSERT INTO TB_DB_MAINTENANCE_MARKER (NAME) VALUES ('PARTITION_${tableName}');
          RETURN;
        END IF;

        DBMS_REDEFINITION.CAN_REDEF_TABLE(USER, '${tableName}', DBMS_REDEFINITION.CONS_USE_ROWID);

        BEGIN
          EXECUTE IMMEDIATE 'DROP TABLE ' || v_interim_table || ' PURGE';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -942 THEN RAISE; END IF;
        END;

        EXECUTE IMMEDIATE 'CREATE TABLE ' || v_interim_table || '
          PARTITION BY RANGE (${dateColumn})
          INTERVAL (NUMTOYMINTERVAL(1, ''MONTH''))
          SUBPARTITION BY HASH (${branchColumn})
          SUBPARTITION TEMPLATE (
            ${SUBPARTITION_TEMPLATE}
          )
          (PARTITION P_BEFORE_2026 VALUES LESS THAN (TIMESTAMP ''2026-01-01 00:00:00''))
          AS SELECT * FROM ${tableName} WHERE 1 = 0';

        DBMS_REDEFINITION.START_REDEF_TABLE(USER, '${tableName}', v_interim_table, NULL, DBMS_REDEFINITION.CONS_USE_ROWID, NULL, NULL, FALSE, DBMS_REDEFINITION.CONS_VPD_AUTO);
        DBMS_REDEFINITION.COPY_TABLE_DEPENDENTS(
          uname => USER,
          orig_table => '${tableName}',
          int_table => v_interim_table,
          copy_indexes => DBMS_REDEFINITION.CONS_ORIG_PARAMS,
          copy_triggers => TRUE,
          copy_constraints => TRUE,
          copy_privileges => TRUE,
          num_errors => v_copy_errors,
          ignore_errors => TRUE
        );
        DBMS_REDEFINITION.SYNC_INTERIM_TABLE(USER, '${tableName}', v_interim_table);
        DBMS_REDEFINITION.FINISH_REDEF_TABLE(USER, '${tableName}', v_interim_table);

        INSERT INTO TB_DB_MAINTENANCE_MARKER (NAME) VALUES ('PARTITION_${tableName}');
      EXCEPTION
        WHEN OTHERS THEN
          BEGIN
            DBMS_REDEFINITION.ABORT_REDEF_TABLE(USER, '${tableName}', v_interim_table);
          EXCEPTION
            WHEN OTHERS THEN NULL;
          END;
          BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || v_interim_table || ' PURGE';
          EXCEPTION
            WHEN OTHERS THEN NULL;
          END;
          RAISE;
      END;`);
    }
  }

  async down() {
    // Oracle cannot safely undo table partitioning online without another redefinition.
  }
}
