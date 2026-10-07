/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddSaleChannel1790819400000 {
    name = 'AddSaleChannel1790819400000';

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_SALE" ADD "SALE_CHANNEL" varchar2(30) DEFAULT \'IN_STORE\' NOT NULL');
        await queryRunner.query('UPDATE "TB_SALE" SET "SALE_CHANNEL" = \'CALL_CENTER\' WHERE "ORIGINAL_ORDER_ID" IS NOT NULL');
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "TB_SALE" DROP COLUMN "SALE_CHANNEL"');
    }
}
