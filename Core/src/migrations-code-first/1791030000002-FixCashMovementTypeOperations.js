export class FixCashMovementTypeOperations1791030000002 {
  name = 'FixCashMovementTypeOperations1791030000002';

  async up(queryRunner) {
    await queryRunner.query(`UPDATE "TB_CASH_MOVEMENT_TYPE" SET "OPERATION" = 'E' WHERE "CODE" IN ('PAYROLL_PAYMENT', 'SUPPLIER_PAYMENT') AND "OPERATION" = 'S'`);
  }

  async down() {}
}
