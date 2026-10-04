export class SeedPayrollCashMovementType1791010000000 {
  name = 'SeedPayrollCashMovementType1791010000000';

  async up(queryRunner) {
    await queryRunner.query(`UPDATE "TB_CASH_MOVEMENT_TYPE"
      SET "NAME" = 'Pago de nomina', "OPERATION" = 'S', "STATUS" = 'E'
      WHERE "CODE" = 'PAYROLL_PAYMENT'`);

    await queryRunner.query(`INSERT INTO "TB_CASH_MOVEMENT_TYPE" ("NAME", "CODE", "OPERATION", "STATUS")
      SELECT 'Pago de nomina', 'PAYROLL_PAYMENT', 'S', 'E' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM "TB_CASH_MOVEMENT_TYPE" WHERE "CODE" = 'PAYROLL_PAYMENT')`);
  }

  async down() {}
}
