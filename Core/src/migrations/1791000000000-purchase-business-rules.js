export class PurchaseBusinessRules1791000000000 {
  name = 'PurchaseBusinessRules1791000000000';

  async up(queryRunner) {
    // 1. Estado de la compra: E (registrada) / I (anulada).
    try {
      await queryRunner.query("ALTER TABLE TB_PURCHASE ADD STATUS VARCHAR2(2) DEFAULT 'E' NOT NULL");
    } catch (error) {
      if (!String(error.message).includes('ORA-01430')) {
        throw error;
      }
    }

    // 2. Tipo de movimiento de caja para el pago a proveedores (integra con el flujo de caja).
    await queryRunner.query(`MERGE INTO TB_CASH_MOVEMENT_TYPE T
      USING (SELECT 'SUPPLIER_PAYMENT' CODE FROM DUAL) S ON (T.CODE = S.CODE)
      WHEN MATCHED THEN UPDATE SET T.NAME = 'Pago a proveedor', T.OPERATION = 'E', T.STATUS = 'E'
      WHEN NOT MATCHED THEN INSERT (NAME, CODE, OPERATION, STATUS)
        VALUES ('Pago a proveedor', 'SUPPLIER_PAYMENT', 'E', 'E')`);

    // 3. Menu "Compras" bajo la categoria Catalog y acceso para el rol Administrador.
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
        SELECT 'Compras' NAME, 'heroicons_solid:shopping-cart' ICON, 'purchase' PATH,
          (SELECT ID FROM TB_MENU WHERE PATH = 'Catalog' AND ID_MENU_FATHER IS NULL FETCH FIRST 1 ROW ONLY) ID_MENU_FATHER
        FROM DUAL
      ) S
      ON (M.PATH = S.PATH AND M.ID_MENU_FATHER = S.ID_MENU_FATHER)
      WHEN MATCHED THEN UPDATE SET M.NAME = S.NAME, M.ICON = S.ICON, M.STATUS = 'E', M.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (NAME, ICON, PATH, ID_MENU_FATHER, STATUS, MENU_ORDER, CREATED_AT)
        VALUES (S.NAME, S.ICON, S.PATH, S.ID_MENU_FATHER, 'E', 0, SYSTIMESTAMP)`);

    await queryRunner.query(`MERGE INTO TB_ROLE_MENU RM
      USING (
        SELECT R.ID ID_ROLE, M.ID ID_MENU
        FROM TB_ROLE R
        JOIN TB_MENU P ON P.PATH = 'Catalog' AND P.ID_MENU_FATHER IS NULL
        JOIN TB_MENU M ON M.PATH = 'purchase' AND M.ID_MENU_FATHER = P.ID
        WHERE R.NAME = 'Administrador'
      ) S
      ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
      WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
        VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);

    // 4. Permisos de compra y asignacion al rol Administrador.
    const actions = ['Ver', 'Crear', 'Editar', 'Eliminar'];
    for (const action of actions) {
      const permissionName = `Purchase.${action}`;

      await queryRunner.query(`MERGE INTO TB_PERMISSION P
        USING (
          SELECT '${permissionName}' NAME, 'Generado automaticamente para ${permissionName}' DESCRIPTION,
            'Catalog' CATEGORY, M.ID MENU_ID
          FROM TB_MENU PM
          JOIN TB_MENU M ON M.PATH = 'purchase' AND M.ID_MENU_FATHER = PM.ID
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
    const permissionNames = ['Purchase.Ver', 'Purchase.Crear', 'Purchase.Editar', 'Purchase.Eliminar'];
    const quotedPermissionNames = permissionNames.map(name => `'${name}'`).join(', ');

    await queryRunner.query(`DELETE FROM T_ROLE_PERMISSION WHERE ID_PERMISSION IN (SELECT ID FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames}))`);
    await queryRunner.query(`DELETE FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames})`);
    await queryRunner.query("DELETE FROM TB_ROLE_MENU WHERE ID_MENU IN (SELECT ID FROM TB_MENU WHERE PATH = 'purchase')");
    await queryRunner.query("DELETE FROM TB_MENU WHERE PATH = 'purchase'");

    try {
      await queryRunner.query('ALTER TABLE TB_PURCHASE DROP COLUMN STATUS');
    } catch (error) {
      if (!String(error.message).includes('ORA-00904')) {
        throw error;
      }
    }
  }
}