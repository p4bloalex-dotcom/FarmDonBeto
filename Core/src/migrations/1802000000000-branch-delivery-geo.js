export class BranchDeliveryGeo1802000000000 {
  name = 'BranchDeliveryGeo1802000000000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE TB_BRANCH ADD LATITUDE NUMBER(10,7)');
    await queryRunner.query('ALTER TABLE TB_BRANCH ADD LONGITUDE NUMBER(10,7)');
    await queryRunner.query('ALTER TABLE TB_BRANCH ADD COVERAGE_RADIUS_KM NUMBER(8,2) DEFAULT 8 NOT NULL');
    await queryRunner.query('ALTER TABLE TB_BRANCH ADD AVERAGE_DELIVERY_MINUTES NUMBER DEFAULT 25 NOT NULL');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN AVERAGE_DELIVERY_MINUTES');
    await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN COVERAGE_RADIUS_KM');
    await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN LONGITUDE');
    await queryRunner.query('ALTER TABLE TB_BRANCH DROP COLUMN LATITUDE');
  }
}
