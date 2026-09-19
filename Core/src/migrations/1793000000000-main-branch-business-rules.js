export class MainBranchBusinessRules1793000000000 {
  name = 'MainBranchBusinessRules1793000000000';

  async up(queryRunner) {
    try {
      await queryRunner.query('ALTER TABLE TB_BRANCH ADD IS_MAIN NUMBER(1) DEFAULT 0 NOT NULL');
    } catch (error) {
      if (!String(error.message).includes('ORA-01430')) {
        throw error;
      }
    }

    await queryRunner.query(`UPDATE TB_BRANCH SET IS_MAIN = 1
      WHERE ID = (SELECT MIN(ID) FROM TB_BRANCH)
        AND NOT EXISTS (SELECT 1 FROM TB_BRANCH WHERE IS_MAIN = 1)`);
  }

  async down(queryRunner) {
    try {
      await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN IS_MAIN');
    } catch (error) {
      if (!String(error.message).includes('ORA-00904')) {
        throw error;
      }
    }
  }
}