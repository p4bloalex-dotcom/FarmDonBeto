/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Test11790221419297 {
    name = 'Test11790221419297'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "TB_BRANCH" DROP COLUMN "STATUS"`);
        await queryRunner.query(`ALTER TABLE "TB_BRANCH" ADD "STATUS" varchar2(1) DEFAULT 'E' NOT NULL`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "TB_BRANCH" DROP COLUMN "STATUS"`);
        await queryRunner.query(`ALTER TABLE "TB_BRANCH" ADD "STATUS" varchar2(2) DEFAULT 'E' NOT NULL`);
    }
}
