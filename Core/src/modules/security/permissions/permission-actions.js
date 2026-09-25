export const actions = {
  view: { key: 'view', name: 'Ver' },
  create: { key: 'create', name: 'Crear' },
  edit: { key: 'edit', name: 'Editar' },
  delete: { key: 'delete', name: 'Eliminar' },
  authorize: { key: 'authorize', name: 'Autorizar' },
  reconcile: { key: 'reconcile', name: 'Conciliar' },
  report: { key: 'report', name: 'Reportes' },
  audit: { key: 'audit', name: 'Auditoria' },
  reverse: { key: 'reverse', name: 'Reversar' }
};

export const crudActions = () => [actions.view, actions.create, actions.edit, actions.delete];
export const readEditActions = () => [actions.view, actions.edit];
export const readOnlyActions = () => [actions.view];
