
SET SERVEROUTPUT ON
WHENEVER SQLERROR CONTINUE

DECLARE
  v_exists  NUMBER;
  v_managed VARCHAR2(30);
BEGIN
  SELECT COUNT(*)
    INTO v_exists
    FROM ALL_OBJECTS
   WHERE OWNER = 'SYS'
     AND OBJECT_NAME = 'DBMS_REDEFINITION'
     AND OBJECT_TYPE IN ('PACKAGE', 'SYNONYM');

  IF v_exists = 0 THEN
    RAISE_APPLICATION_ERROR(-20001,
      'SYS.DBMS_REDEFINITION no existe en esta base. ' ||
      'Verifica que corras este script en el PDB correcto (XEPDB1) ' ||
      'o reinstala el paquete desde ?/rdbms/admin/dbmsredef.sql.');
  END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'GRANT EXECUTE ON SYS.DBMS_REDEFINITION TO APPFARMACIA';
  DBMS_OUTPUT.PUT_LINE('GRANT OK: execute on SYS.DBMS_REDEFINITION -> APPFARMACIA');
END;
/

-- Sanidad: el usuario debe poder ver el paquete ahora.
SET AUTOPRINT ON
VAR c_refcount NUMBER
BEGIN
  SELECT COUNT(*)
    INTO :c_refcount
    FROM ALL_OBJECTS
   WHERE OBJECT_NAME = 'DBMS_REDEFINITION'
     AND OBJECT_TYPE = 'PACKAGE';
END;
/

EXIT