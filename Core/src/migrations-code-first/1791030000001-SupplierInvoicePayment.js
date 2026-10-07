export class SupplierInvoicePayment1791030000001 {
  name = 'SupplierInvoicePayment1791030000001';

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" ADD "PAYMENT_SOURCE_TYPE" varchar2(20)');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" ADD "FINANCIAL_ACCOUNT_ID" number');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" ADD "CASH_SESSION_ID" number');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" ADD "PAID_AT" timestamp');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" ADD "PAID_BY" number');
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" DROP COLUMN "PAID_BY"');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" DROP COLUMN "PAID_AT"');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" DROP COLUMN "CASH_SESSION_ID"');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" DROP COLUMN "FINANCIAL_ACCOUNT_ID"');
    await queryRunner.query('ALTER TABLE "TB_SUPPLIER_INVOICE" DROP COLUMN "PAYMENT_SOURCE_TYPE"');
  }
}
