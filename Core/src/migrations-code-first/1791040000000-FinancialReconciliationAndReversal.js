export class FinancialReconciliationAndReversal1791040000000 {
  name = 'FinancialReconciliationAndReversal1791040000000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" ADD "REVERSAL_OF_ID" number');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" ADD "RECONCILED_AT" timestamp');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" ADD "RECONCILIATION_NOTE" varchar2(255)');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" ADD CONSTRAINT "FK_FIN_MOV_REVERSAL" FOREIGN KEY ("REVERSAL_OF_ID") REFERENCES "TB_FINANCIAL_MOVEMENT" ("ID")');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" DROP CONSTRAINT "FK_FIN_MOV_REVERSAL"');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" DROP COLUMN "RECONCILIATION_NOTE"');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" DROP COLUMN "RECONCILED_AT"');
    await queryRunner.query('ALTER TABLE "TB_FINANCIAL_MOVEMENT" DROP COLUMN "REVERSAL_OF_ID"');
  }
}
