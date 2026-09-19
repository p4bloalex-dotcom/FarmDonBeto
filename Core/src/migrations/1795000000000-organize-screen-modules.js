const parents = [
  ['Security', 'Seguridad', 'heroicons_solid:shield-check', 1],
  ['Catalog', 'Catalogo', 'heroicons_solid:squares-2x2', 2],
  ['Operation', 'Operaciones', 'heroicons_solid:briefcase', 3],
  ['Configuration', 'Configuraciones', 'heroicons_solid:cog-6-tooth', 4],
  ['Reports', 'Reporte', 'heroicons_solid:chart-bar-square', 5],
  ['Audit', 'Auditoria', 'heroicons_solid:document-magnifying-glass', 6]
];

const moves = [
  ['cashsession', 'Operation', 'Operation'],
  ['purchase', 'Operation', 'Operation'],
  ['stock-transfer', 'Operation', 'Operation'],
  ['delivery-request', 'Operation', 'Operation'],
  ['audit', 'Audit', 'Audit'],
  ['report', 'Reports', 'Reports'],
  ['personalq', 'Reports', 'Reports'],
  ['inventoryhistory', 'Reports', 'Reports'],
  ['businesshour', 'Configuration', 'Configuration']
];

export class OrganizeScreenModules1795000000000 {
  name = 'OrganizeScreenModules1795000000000';

  async up(queryRunner) {
    for (const [path, name, icon, order] of parents) {
      await queryRunner.query(`MERGE INTO TB_MENU M
        USING (SELECT '${path}' PATH, '${name}' NAME, '${icon}' ICON, ${order} MENU_ORDER FROM DUAL) S
        ON (M.PATH = S.PATH AND M.ID_MENU_FATHER IS NULL)
        WHEN MATCHED THEN UPDATE SET M.NAME = S.NAME, M.ICON = S.ICON, M.STATUS = 'E', M.MENU_ORDER = S.MENU_ORDER, M.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (NAME, ICON, PATH, STATUS, MENU_ORDER, CREATED_AT)
          VALUES (S.NAME, S.ICON, S.PATH, 'E', S.MENU_ORDER, SYSTIMESTAMP)`);

      await queryRunner.query(`MERGE INTO TB_ROLE_MENU RM
        USING (
          SELECT R.ID ID_ROLE, M.ID ID_MENU
          FROM TB_ROLE R
          JOIN TB_MENU M ON M.PATH = '${path}' AND M.ID_MENU_FATHER IS NULL
          WHERE R.NAME = 'Administrador'
        ) S
        ON (RM.ID_ROLE = S.ID_ROLE AND RM.ID_MENU = S.ID_MENU)
        WHEN MATCHED THEN UPDATE SET RM.STATUS = 'E', RM.UPDATED_AT = SYSTIMESTAMP
        WHEN NOT MATCHED THEN INSERT (ID_ROLE, ID_MENU, STATUS, CREATED_AT)
          VALUES (S.ID_ROLE, S.ID_MENU, 'E', SYSTIMESTAMP)`);
    }

    for (const [childPath, parentPath, category] of moves) {
      await queryRunner.query(`UPDATE TB_MENU C
        SET C.ID_MENU_FATHER = (SELECT P.ID FROM TB_MENU P WHERE P.PATH = '${parentPath}' AND P.ID_MENU_FATHER IS NULL FETCH FIRST 1 ROW ONLY),
            C.STATUS = 'E',
            C.UPDATED_AT = SYSTIMESTAMP
        WHERE C.PATH = '${childPath}'
          AND C.ID_MENU_FATHER IS NOT NULL`);

      await queryRunner.query(`UPDATE TB_PERMISSION P
        SET P.CATEGORY = '${category}',
            P.MENU_ID = (SELECT M.ID FROM TB_MENU M JOIN TB_MENU PM ON PM.ID = M.ID_MENU_FATHER WHERE M.PATH = '${childPath}' AND PM.PATH = '${parentPath}' FETCH FIRST 1 ROW ONLY)
        WHERE P.MENU_ID IN (SELECT M.ID FROM TB_MENU M WHERE M.PATH = '${childPath}')
           OR P.NAME LIKE '%${childPath}%'`);
    }
  }

  async down(queryRunner) {
    for (const [childPath] of moves) {
      await queryRunner.query(`UPDATE TB_MENU C
        SET C.ID_MENU_FATHER = (SELECT P.ID FROM TB_MENU P WHERE P.PATH = 'Catalog' AND P.ID_MENU_FATHER IS NULL FETCH FIRST 1 ROW ONLY),
            C.UPDATED_AT = SYSTIMESTAMP
        WHERE C.PATH = '${childPath}'
          AND C.ID_MENU_FATHER IS NOT NULL`);
    }
  }
}
