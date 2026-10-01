import { addBranchRlsPolicy } from '../tenant/tenant-tables.js';

export class ImproveFixedAssets1790790000000 {
  name = 'ImproveFixedAssets1790790000000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "BRAND" varchar2(80)');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "MODEL" varchar2(80)');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "SERIAL_NUMBER" varchar2(80)');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "SUPPLIER" varchar2(120)');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "CONDITION" varchar2(10) DEFAULT \'BUENO\' NOT NULL');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" ADD "ATTRIBUTES" clob');
    await queryRunner.query('UPDATE "TB_FIXED_ASSET" SET "CATEGORY" = \'Otro\' WHERE "CATEGORY" IS NULL');
    await queryRunner.query('UPDATE "TB_FIXED_ASSET" SET "PURCHASE_DATE" = "CREATED_AT" WHERE "PURCHASE_DATE" IS NULL');
    await queryRunner.query('UPDATE "TB_FIXED_ASSET" SET "STATUS" = \'D\' WHERE "STATUS" = \'I\'');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" MODIFY "CATEGORY" varchar2(80) NOT NULL');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" MODIFY "PURCHASE_DATE" timestamp NOT NULL');
    await addBranchRlsPolicy(queryRunner, 'TB_FIXED_ASSET');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" MODIFY "PURCHASE_DATE" timestamp NULL');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" MODIFY "CATEGORY" varchar2(80) NULL');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "ATTRIBUTES"');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "CONDITION"');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "SUPPLIER"');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "SERIAL_NUMBER"');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "MODEL"');
    await queryRunner.query('ALTER TABLE "TB_FIXED_ASSET" DROP COLUMN "BRAND"');
    await addBranchRlsPolicy(queryRunner, 'TB_FIXED_ASSET');
  }
}
