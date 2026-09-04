const screens = [
  { category: 'Security', controller: 'MenuRol', routePath: 'menurol', title: 'Menus por rol', icon: 'heroicons_solid:squares-plus', actions: ['Ver', 'Crear', 'Editar', 'Eliminar'] },
  { category: 'Security', controller: 'User', routePath: 'user', title: 'Usuarios', icon: 'heroicons_solid:user', actions: ['Ver', 'Crear', 'Editar', 'Eliminar'] },
  { category: 'Catalog', controller: 'Company', routePath: 'company', title: 'Empresa', icon: 'heroicons_solid:building-office', actions: ['Ver', 'Crear'] },
  { category: 'Catalog', controller: 'Branch', routePath: 'branch', title: 'Sucursales', icon: 'heroicons_solid:map-pin', actions: ['Ver', 'Crear', 'Editar', 'Eliminar'] },
  { category: 'Catalog', controller: 'Personal', routePath: 'personal', title: 'Personal', icon: 'heroicons_solid:identification', actions: ['Ver', 'Crear', 'Editar', 'Eliminar'] }
];

export class SeedAdminScreens1725408000000 {
  name = 'SeedAdminScreens1725408000000';

  async up(queryRunner) {
    await queryRunner.query(`MERGE INTO TB_ROLE R
      USING (SELECT 'Administrador' NAME FROM DUAL) S
      ON (R.NAME = S.NAME)
      WHEN NOT MATCHED THEN INSERT (NAME, STATUS, CREATED_AT) VALUES (S.NAME, 'E', SYSTIMESTAMP)`);

    for (const category of [...new Set(screens.map(screen => screen.category))]) {
      await queryRunner.query(`MERGE INTO TB_MENU M
        USING (SELECT '${category}' NAME, 'folder' ICON, '${category}' PATH FROM DUAL) S
        ON (M.PATH = S.PATH AND M.ID_MENU_FATHER IS NULL)
        WHEN MATCHED THEN UPDATE SET M.NAME = S.NAME, M.ICON = S.ICON, M.STATUS = 'E', M.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (NAME, ICON, PATH, STATUS, MENU_ORDER, CREATED_AT)
        VALUES (S.NAME, S.ICON, S.PATH, 'E', 0, SYSTIMESTAMP)`);

      await queryRunner.query(`MERGE INTO TB_ROLE_MENU RM
        USING (
          SELECT R.ID ID_ROLE, M.ID ID_MENU
          FROM TB_ROLE R
          JOIN TB_MENU M ON M.PATH = '${category}' AND M.ID_MENU_FATHER IS NULL
          WHERE R.NAME = 'Administrador'
        ) S
        ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
        WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
        VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);
    }

    for (const screen of screens) {
      await queryRunner.query(`MERGE INTO TB_MENU M
        USING (
          SELECT '${screen.title}' NAME, '${screen.icon}' ICON, '${screen.routePath}' PATH,
            (SELECT ID FROM TB_MENU WHERE PATH = '${screen.category}' AND ID_MENU_FATHER IS NULL FETCH FIRST 1 ROW ONLY) ID_MENU_FATHER
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
          JOIN TB_MENU P ON P.PATH = '${screen.category}' AND P.ID_MENU_FATHER IS NULL
          JOIN TB_MENU M ON M.PATH = '${screen.routePath}' AND M.ID_MENU_FATHER = P.ID
          WHERE R.NAME = 'Administrador'
        ) S
        ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
        WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
        VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);

      for (const action of screen.actions) {
        const permissionName = `${screen.controller}.${action}`;

        await queryRunner.query(`MERGE INTO TB_PERMISSION P
          USING (
            SELECT '${permissionName}' NAME, 'Generado automaticamente para ${permissionName}' DESCRIPTION,
              '${screen.category}' CATEGORY, M.ID MENU_ID
            FROM TB_MENU PM
            JOIN TB_MENU M ON M.PATH = '${screen.routePath}' AND M.ID_MENU_FATHER = PM.ID
            WHERE PM.PATH = '${screen.category}' AND PM.ID_MENU_FATHER IS NULL
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
  }

  async down(queryRunner) {
    const permissionNames = screens.flatMap(screen => screen.actions.map(action => `${screen.controller}.${action}`));
    const quotedPermissionNames = permissionNames.map(name => `'${name}'`).join(', ');
    const quotedPaths = screens.map(screen => `'${screen.routePath}'`).join(', ');

    await queryRunner.query(`DELETE FROM T_ROLE_PERMISSION WHERE ID_PERMISSION IN (SELECT ID FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames}))`);
    await queryRunner.query(`DELETE FROM TB_PERMISSION WHERE NAME IN (${quotedPermissionNames})`);
    await queryRunner.query(`DELETE FROM TB_ROLE_MENU WHERE ID_MENU IN (SELECT ID FROM TB_MENU WHERE PATH IN (${quotedPaths}))`);
    await queryRunner.query(`DELETE FROM TB_MENU WHERE PATH IN (${quotedPaths})`);
  }
}
