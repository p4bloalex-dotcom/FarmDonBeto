/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class LightSanitaryControls1791417656831 {
    name = 'LightSanitaryControls1791417656831';

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_BRANCH" ADD "TECHNICAL_DIRECTOR_EMPLOYEE_ID" number');
        await queryRunner.query('ALTER TABLE "TB_BRANCH" ADD "SANITARY_LICENSE_NUMBER" varchar2(80)');
        await queryRunner.query('ALTER TABLE "TB_BRANCH" ADD "SANITARY_LICENSE_EXPIRES_AT" timestamp');
        await queryRunner.query('ALTER TABLE "TB_INVENTORY_LOT" ADD "SANITARY_STATUS" varchar2(30) DEFAULT \'APPROVED\' NOT NULL');
        await queryRunner.query('ALTER TABLE "TB_INVENTORY_LOT" ADD "SANITARY_BLOCK_REASON" varchar2(500)');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_INVENTORY_LOT" DROP COLUMN "SANITARY_BLOCK_REASON"');
        await queryRunner.query('ALTER TABLE "TB_INVENTORY_LOT" DROP COLUMN "SANITARY_STATUS"');
        await queryRunner.query('ALTER TABLE "TB_BRANCH" DROP COLUMN "SANITARY_LICENSE_EXPIRES_AT"');
        await queryRunner.query('ALTER TABLE "TB_BRANCH" DROP COLUMN "SANITARY_LICENSE_NUMBER"');
        await queryRunner.query('ALTER TABLE "TB_BRANCH" DROP COLUMN "TECHNICAL_DIRECTOR_EMPLOYEE_ID"');
    }
}
