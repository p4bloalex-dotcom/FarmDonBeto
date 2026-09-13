export class CashBusinessRules1790000000000 {
  name = 'CashBusinessRules1790000000000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE TB_CASH_MOVEMENT_TYPE ADD OPERATION VARCHAR2(1)');
    await queryRunner.query("UPDATE TB_CASH_MOVEMENT_TYPE SET OPERATION = 'E' WHERE OPERATION IS NULL");
    await queryRunner.query('ALTER TABLE TB_CASH_MOVEMENT_TYPE MODIFY OPERATION VARCHAR2(1) NOT NULL');
    await queryRunner.query("ALTER TABLE TB_CASH_MOVEMENT_TYPE ADD CONSTRAINT CK_CASH_MOV_TYPE_OP CHECK (OPERATION IN ('I', 'E'))");
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE TB_CASH_MOVEMENT_TYPE DROP CONSTRAINT CK_CASH_MOV_TYPE_OP');
    await queryRunner.query('ALTER TABLE TB_CASH_MOVEMENT_TYPE DROP COLUMN OPERATION');
  }
}