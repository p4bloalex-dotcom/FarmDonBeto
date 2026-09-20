const foreignKeyMessages = new Map([
  ['FK_CASH_SESSION_REG', 'No se puede eliminar la caja porque tiene sesiones de caja registradas. Desactivala si ya no se usara.'],
  ['FK_CASH_MOVEMENT_SESSION', 'No se puede eliminar el registro porque tiene movimientos de caja asociados.'],
  ['FK_CASH_SESSION_USER', 'No se puede eliminar el usuario porque tiene sesiones de caja asociadas.'],
  ['FK_EMPLOYEE_BRANCH', 'No se puede eliminar la sucursal porque tiene personal asociado.'],
  ['FK_EMPLOYEE_COMPANY', 'No se puede eliminar la empresa porque tiene personal asociado.'],
  ['FK_USER_ROLE', 'No se puede eliminar el rol porque tiene usuarios asociados.'],
  ['FK_USER_PERSONAL', 'No se puede eliminar el personal porque tiene usuario asociado.'],
  ['FK_ROLE_MENU_ROLE', 'No se puede eliminar el rol porque tiene menus asignados.'],
  ['FK_ROLE_MENU_MENU', 'No se puede eliminar el menu porque esta asignado a uno o mas roles.'],
  ['FK_ROLE_PERMISSION_ROLE', 'No se puede eliminar el rol porque tiene permisos asignados.'],
  ['FK_ROLE_PERMISSION_PERMISSION', 'No se puede eliminar el permiso porque esta asignado a uno o mas roles.']
]);

export const isForeignKeyViolation = error => error?.errorNum === 2292;

export const getForeignKeyConflictMessage = error => {
  const constraint = error?.message?.match(/\(([^.]+)\.([^)]+)\)/)?.[2];
  return foreignKeyMessages.get(constraint) ?? 'No se puede eliminar el registro porque esta siendo utilizado en otro modulo.';
};
