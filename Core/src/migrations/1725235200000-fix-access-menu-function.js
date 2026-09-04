export class FixAccessMenuFunction1725235200000 {
  name = 'FixAccessMenuFunction1725235200000';

  async up(queryRunner) {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION SP_GET_ACCESS_MENUS(P_USER_ID IN NUMBER) RETURN CLOB
    AS
      V_ID_ROLE NUMBER;
      V_JSON CLOB;
    BEGIN
      SELECT U.ID_ROLE INTO V_ID_ROLE FROM TB_USER U WHERE U.ID = P_USER_ID AND U.STATUS = 'E';

      SELECT COALESCE(JSON_ARRAYAGG(
        JSON_OBJECT(
          'id' VALUE P.ID,
          'title' VALUE P.NAME,
          'type' VALUE CASE WHEN EXISTS (
            SELECT 1 FROM TB_ROLE_MENU RMC JOIN TB_MENU CH ON CH.ID = RMC.ID_MENU
            WHERE RMC.ID_ROLE = V_ID_ROLE AND CH.ID_MENU_FATHER = P.ID AND RMC.STATUS = 'E' AND CH.STATUS = 'E'
          ) THEN 'collapsable' ELSE 'basic' END,
          'icon' VALUE P.ICON,
          'link' VALUE P.PATH,
          'children' VALUE COALESCE((
            SELECT JSON_ARRAYAGG(JSON_OBJECT(
              'id' VALUE CH.ID,
              'title' VALUE CH.NAME,
              'type' VALUE 'basic',
              'icon' VALUE CH.ICON,
              'link' VALUE LOWER(RTRIM(P.PATH, '/') || '/' || LTRIM(CH.PATH, '/'))
            ) ORDER BY CH.MENU_ORDER)
            FROM TB_ROLE_MENU RMC JOIN TB_MENU CH ON CH.ID = RMC.ID_MENU
            WHERE RMC.ID_ROLE = V_ID_ROLE AND CH.ID_MENU_FATHER = P.ID AND RMC.STATUS = 'E' AND CH.STATUS = 'E'
          ), JSON_ARRAY()) FORMAT JSON
        ) RETURNING CLOB
      ), JSON_ARRAY(RETURNING CLOB)) INTO V_JSON
      FROM TB_ROLE_MENU RM JOIN TB_MENU P ON P.ID = RM.ID_MENU
      WHERE RM.ID_ROLE = V_ID_ROLE AND RM.STATUS = 'E' AND P.STATUS = 'E' AND P.ID_MENU_FATHER IS NULL;

      RETURN V_JSON;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN RETURN JSON_ARRAY(RETURNING CLOB);
    END;`);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP FUNCTION SP_GET_ACCESS_MENUS');
  }
}
