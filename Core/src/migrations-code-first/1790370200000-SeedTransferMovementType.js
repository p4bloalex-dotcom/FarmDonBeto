export class SeedTransferMovementType1790370200000 {
  name = 'SeedTransferMovementType1790370200000';

  async up(queryRunner) {
    await queryRunner.query('UPDATE "TB_MOVEMENT_TYPE" SET "STATUS" = \'E\' WHERE UPPER("NAME") = \'TRASPASO\'');
    await queryRunner.query(`INSERT INTO "TB_MOVEMENT_TYPE" ("NAME", "STATUS")
      SELECT 'TRASPASO', 'E' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM "TB_MOVEMENT_TYPE" WHERE UPPER("NAME") = 'TRASPASO')`);
  }

  async down() {}
}
