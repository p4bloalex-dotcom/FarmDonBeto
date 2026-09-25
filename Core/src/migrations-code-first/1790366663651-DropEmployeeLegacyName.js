/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class DropEmployeeLegacyName1790366663651 {
    name = 'DropEmployeeLegacyName1790366663651';

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_EMPLOYEE" DROP COLUMN "NAME"');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_EMPLOYEE" ADD "NAME" varchar2(100)');
    }
}
