export class StockTransferBusinessRules1792000000000 {
  name = 'StockTransferBusinessRules1792000000000';

  async up(queryRunner) {
    try {
      await queryRunner.query("ALTER TABLE TB_MOVE_INVENTORY ADD STATUS VARCHAR2(2) DEFAULT 'E' NOT NULL");
    } catch (error) {
      if (!String(error.message).includes('ORA-01430')) {
        throw error;
      }
    }

    await queryRunner.query(`MERGE INTO TB_MOVEMENT_TYPE T
      USING (SELECT 'TRASPASO' NAME FROM DUAL) S ON (T.NAME = S.NAME)
      WHEN MATCHED THEN UPDATE SET T.STATUS = 'E', T.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (NAME, STATUS, CREATED_AT)
        VALUES ('TRASPASO', 'E', SYSTIMESTAMP)`);

    await queryRunner.query(`MERGE INTO TB_MENU M
      USING (SELECT 'Catalog' NAME, 'folder' ICON, 'Catalog' PATH FROM DUAL) S
      ON (M.PATH = S.PATH AND M.ID_MENU_FATHER IS NULL)
      WHEN NOT MATCHED THEN INSERT (NAME, ICON, PATH, STATUS, MENU_ORDER, CREATED_AT)
        VALUES (S.NAME, S.ICON, S.PATH, 'E', 0, SYSTIMESTAMP)`);

    await queryRunner.query(`MERGE INTO TB_ROLE_MENU RM
      USING (
        SELECT R.ID ID_ROLE, M.ID ID_MENU
        FROM TB_ROLE R
        JOIN TB_MENU M ON M.PATH = 'Catalog' AND M.ID_MENU_FATHER IS NULL
        WHERE R.NAME = 'Administrador'
      ) S
      ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
      WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
        VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);

    await queryRunner.query(`MERGE INTO TB_MENU M
      USING (
        SELECT 'Traspasos' NAME, 'heroicons_solid:arrows-right-left' ICON, 'stock-transfer' PATH,
          (SELECT ID FROM TB_MENU WHERE PATH = 'Catalog' AND ID_MENU_FATHER IS NULL FETCH FIRST 1 ROW ONLY) ID_MENU_FATHER
        FROM DUAL
      ) S
      ON (M.PATH = S.PATH AND M.ID_MENU_FATHER = S.ID_MENU_FATHER)
      WHEN MATCHED THEN UPDATE SET M.NAME = S.NAME, M.ICON = S.ICON, M.STATUS = 'E', M.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (NAME, ICON, PATH, ID_MENU_FATHER, STATUS, MENU_ORDER, CREATED_AT)
        VALUES (S.NAME, S.ICON, S.PATH, S.ID_MENU_FATHER, 'E', 3, SYSTIMESTAMP)`);

    await queryRunner.query(`MERGE INTO TB_ROLE_MENU RM
      USING (
        SELECT R.ID ID_ROLE, M.ID ID_MENU
        FROM TB_ROLE R
        JOIN TB_MENU P ON P.PATH = 'Catalog' AND P.ID_MENU_FATHER IS NULL
        JOIN TB_MENU M ON M.PATH = 'stock-transfer' AND M.ID_MENU_FATHER = P.ID
        WHERE R.NAME = 'Administrador'
      ) S
      ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
      WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
        VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);

    const actions = ['Ver', 'Crear', 'Editar', 'Eliminar'];
    for (const action of actions) {
      const permissionName = `StockTransfer.${action}`;

      await queryRunner.query(`MERGE INTO TB_PERMISSION P
        USING (
          SELECT '${permissionName}' NAME, 'Generado automaticamente para ${permissionName}' DESCRIPTION,
            'Catalog' CATEGORY, M.ID MENU_ID
          FROM TB_MENU PM
          JOIN TB_MENU M ON M.PATH = 'stock-transfer' AND M.ID_MENU_FATHER = PM.ID
          WHERE PM.PATH = 'Catalog' AND PM.ID_MENU_FATHER IS NULL
        ) S
        ON (P.NAME = S.NAME)
        WHEN MATCHED THEN UPDATE SET P.DESCRIPTION = S.DESCRIPTION, P.CATEGORY = S.CATEGORY, P.MENU_ID = S.MENU_ID, P.STATUS = 'E'
        WHEN NOT MATCHED THEN INSERT (NAME, DESCRIPTION, CATEGORY, MENU_ID, STATUS)
          VALUES (S.NAME, S.DESCRIPTION, S.CATEGORY, S.MENU_ID, 'E')`);

      await queryRunner.query(`MERGE INTO T_ROLE_PERMISSION RP
        USING (
          SELECT R.ID ID_ROLE, P.ID ID_PERMISSION
          FROM TB_ROLE R
          JOIN TB_PERMISSION P ON P.NAME = '${permissionName}'
          WHERE R.NAME = 'Administrador'
        ) S
        ON (RP.ID_ROLE = S.ID_ROLE AND RP.ID_PERMISSION = S.ID_PERMISSION)
        WHEN MATCHED THEN UPDATE SET RP.STATUS = 'E', RP.IS_CHECK = 1, RP.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_PERMISSION, STATUS, IS_CHECK, CREATED_AT)
          VALUES (S.ID_ROLE, S.ID_PERMISSION, 'E', 1, SYSTIMESTAMP)`);
    }
  }

  async down(queryRunner) {
    const permissionNames = ['StockTransfer.Ver', 'StockTransfer.Crear', 'StockTransfer.Editar', 'StockTransfer.Eliminar'];
    const quotedPermissionNames = permissionNames.map(name => `'${name}'`).join(', ');

    await queryRunner.query(`DELETE FROM T_ROLE_PERMISSION WHERE ID_PERMISSION IN (SELECT ID FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames}))`);
    await queryRunner.query(`DELETE FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames})`);
    await queryRunner.query("DELETE FROM TB_ROLE_MENU WHERE ID_MENU IN (SELECT ID FROM TB_MENU WHERE PATH = 'stock-transfer')");
    await queryRunner.query("DELETE FROM TB_MENU WHERE PATH = 'stock-transfer'");

    try {
      await queryRunner.query('ALTER TABLE TB_MOVE_INVENTORY DROP COLUMN STATUS');
    } catch (error) {
      if (!String(error.message).includes('ORA-01430')) {
        throw error;
      }
    }
  }
}
