export class AddIsGlobalRolePermission1757536440000 {
  name = 'AddIsGlobalRolePermission1757536440000';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE T_ROLE_PERMISSION ADD IS_GLOBAL NUMBER(1) DEFAULT 0 NOT NULL');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE T_ROLE_PERMISSION DROP COLUMN IS_GLOBAL');
  }
}
