/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddMedicineImageUrl1791138939208 {
  name = 'AddMedicineImageUrl1791138939208';

    /**
     * @param {QueryRunner} queryRunner
     */
  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_MEDICINE" ADD "IMAGE_URL" varchar2(500)');
  }

    /**
     * @param {QueryRunner} queryRunner
     */
  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_MEDICINE" DROP COLUMN "IMAGE_URL"');
  }
}
