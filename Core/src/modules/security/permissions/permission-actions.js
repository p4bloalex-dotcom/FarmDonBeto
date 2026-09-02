export const actions = {
  view: { key: 'view', name: 'Ver' },
  create: { key: 'create', name: 'Crear' },
  edit: { key: 'edit', name: 'Editar' },
  delete: { key: 'delete', name: 'Eliminar' }
};

export const crudActions = () => [actions.view, actions.create, actions.edit, actions.delete];
export const readEditActions = () => [actions.view, actions.edit];
export const readOnlyActions = () => [actions.view];
