export class FinancialMovementReferenceIndex1791030000000 {
  name = 'FinancialMovementReferenceIndex1791030000000';

  async up(queryRunner) {
    await queryRunner.query('CREATE UNIQUE INDEX "UX_FIN_MOV_REF_ACTIVE" ON "TB_FINANCIAL_MOVEMENT" (CASE WHEN "STATUS" = \'E\' THEN "REFERENCE_TYPE" END, CASE WHEN "STATUS" = \'E\' THEN "REFERENCE_ID" END)');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP INDEX "UX_FIN_MOV_REF_ACTIVE"');
  }
}
