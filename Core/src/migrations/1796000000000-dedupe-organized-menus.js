const menuControllers = [
  ['cashsession', 'CashSession', 'Operation'],
  ['purchase', 'Purchase', 'Operation'],
  ['stock-transfer', 'StockTransfer', 'Operation'],
  ['delivery-request', 'DeliveryRequest', 'Operation'],
  ['audit', 'Audit', 'Audit']
];

export class DedupeOrganizedMenus1796000000000 {
  name = 'DedupeOrganizedMenus1796000000000';

  async up(queryRunner) {
    for (const [path, controller, category] of menuControllers) {
      await queryRunner.query(`UPDATE TB_MENU M
        SET M.STATUS = 'D', M.UPDATED_AT = SYSTIMESTAMP
        WHERE M.PATH = '${path}'
          AND M.ID <> (SELECT MIN(ID) FROM TB_MENU WHERE PATH = '${path}' AND STATUS = 'E')`);

      await queryRunner.query(`UPDATE TB_PERMISSION P
        SET P.CATEGORY = '${category}',
            P.MENU_ID = (SELECT MIN(ID) FROM TB_MENU WHERE PATH = '${path}' AND STATUS = 'E')
        WHERE P.NAME LIKE '${controller}.%'`);

      await queryRunner.query(`UPDATE TB_ROLE_MENU RM
        SET RM.STATUS = 'D', RM.UPDATED_AT = SYSTIMESTAMP
        WHERE RM.ID_MENU IN (SELECT ID FROM TB_MENU WHERE PATH = '${path}' AND STATUS <> 'E')`);
    }
  }

  async down() {}
}
