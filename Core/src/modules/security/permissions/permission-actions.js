export const actions = {
  view: { key: 'view', name: 'Ver' },
  create: { key: 'create', name: 'Crear' },
  edit: { key: 'edit', name: 'Editar' },
  delete: { key: 'delete', name: 'Eliminar' },
  authorize: { key: 'authorize', name: 'Autorizar' },
  reconcile: { key: 'reconcile', name: 'Conciliar' },
  report: { key: 'report', name: 'Reportes' },
  audit: { key: 'audit', name: 'Auditoria' },
  reverse: { key: 'reverse', name: 'Reversar' },
  request: { key: 'request', name: 'Solicitar' },
  order: { key: 'order', name: 'Ordenar' },
  approve: { key: 'approve', name: 'Aprobar' },
  receive: { key: 'receive', name: 'Recibir' },
  invoice: { key: 'invoice', name: 'Facturar' },
  pay: { key: 'pay', name: 'Pagar' },
  return: { key: 'return', name: 'Devolver' },
  accept: { key: 'accept', name: 'Aceptar' },
  send: { key: 'send', name: 'Enviar' },
  deliver: { key: 'deliver', name: 'Entregar' },
  reject: { key: 'reject', name: 'Rechazar' },
  cancel: { key: 'cancel', name: 'Cancelar' }
};

export const crudActions = () => [actions.view, actions.create, actions.edit, actions.delete];
export const readEditActions = () => [actions.view, actions.edit];
export const readOnlyActions = () => [actions.view];
