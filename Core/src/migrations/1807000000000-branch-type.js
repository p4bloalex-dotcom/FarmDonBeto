export class BranchType1807000000000 {
  name = 'BranchType1807000000000';

  async up(queryRunner) {
    try {
      await queryRunner.query("ALTER TABLE TB_BRANCH ADD BRANCH_TYPE VARCHAR2(30) DEFAULT 'CENTRO_COMERCIAL' NOT NULL");
    } catch (error) {
      if (!String(error.message).includes('ORA-01430')) {
        throw error;
      }
    }

    await queryRunner.query("UPDATE TB_BRANCH SET BRANCH_TYPE = 'CENTRO_COMERCIAL' WHERE BRANCH_TYPE IS NULL");
  }

  async down(queryRunner) {
    try {
      await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN BRANCH_TYPE');
    } catch (error) {
      if (!String(error.message).includes('ORA-00904')) {
        throw error;
      }
    }
  }
}
