export const TENANT_TABLES = [
  'TB_INVENTORY',
  'TB_SALE',
  'TB_PURCHASE',
  'TB_PURCHASE_REQUEST',
  'TB_PURCHASE_REQUEST_DETAIL',
  'TB_PURCHASE_RECEIPT',
  'TB_PURCHASE_RECEIPT_DETAIL',
  'TB_SUPPLIER_INVOICE',
  'TB_PURCHASE_RETURN',
  'TB_EMPLOYEE',
  'TB_CASH_REGISTER',
  'TB_CASH_SESSION',
  'TB_CASH_MOVEMENT',
  'TB_MOVE_INVENTORY',
  'TB_DELIVERY_REQUEST',
  'TB_DELIVERY_REQUEST_DETAIL',
  'TB_FIXED_ASSET',
  'TB_CUSTOMER_ORDER',
  'TB_CUSTOMER_ORDER_DETAIL',
  'TB_BRANCH'
];

export const addBranchRlsPolicy = async (queryRunner, tableName) => {
  await queryRunner.query(`BEGIN
    DBMS_RLS.DROP_POLICY(USER, '${tableName}', 'RLS_BRANCH');
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;`);

  await queryRunner.query(`BEGIN
    DBMS_RLS.ADD_POLICY(
      OBJECT_SCHEMA => USER,
      OBJECT_NAME => '${tableName}',
      POLICY_NAME => 'RLS_BRANCH',
      STATEMENT_TYPES => 'SELECT',
      FUNCTION_SCHEMA => USER,
      POLICY_FUNCTION => 'F_BRANCH_RLS',
      UPDATE_CHECK => FALSE,
      ENABLE => TRUE
    );
  END;`);
};

export const dropBranchRlsPolicy = async (queryRunner, tableName) => {
  await queryRunner.query(`BEGIN
    DBMS_RLS.DROP_POLICY(USER, '${tableName}', 'RLS_BRANCH');
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;`);
};
