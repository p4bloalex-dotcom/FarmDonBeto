import 'dotenv/config';
import { AppDataSource } from '../src/config/data-source.js';

const permissionMap = new Map([
  ['CashAdvanced.Ver', 'CashSession.Ver'],
  ['CashAdvanced.Crear', 'CashSession.Crear'],
  ['CashAdvanced.Autorizar', 'CashSession.Autorizar'],
  ['CashAdvanced.Reportes', 'CashSession.Reportes'],
  ['CashAdvanced.Auditoria', 'CashSession.Auditoria'],
  ['CashAdvanced.Conciliar', 'CashSession.Conciliar']
]);

const getOperationCashMenu = async manager => {
  const menuRepository = manager.getRepository('Menu');
  const operation = await menuRepository.findOneBy({ path: 'Operation', idMenuFather: null });
  if (!operation) throw new Error('No existe el menu padre Operation.');

  let cashMenu = await menuRepository.findOneBy({ path: 'cashsession', idMenuFather: operation.id });
  if (!cashMenu) {
    cashMenu = await menuRepository.findOneBy({ path: 'CashSession', idMenuFather: operation.id });
  }
  if (!cashMenu) throw new Error('No existe el menu de CashSession/cashsession.');

  await menuRepository.update(cashMenu.id, {
    name: 'Caja del dia',
    icon: 'heroicons_solid:banknotes',
    path: 'cashsession',
    idMenuFather: operation.id,
    status: 'E'
  });

  return { operation, cashMenu };
};

const ensurePermission = async (manager, name, cashMenuId) => {
  const permissionRepository = manager.getRepository('Permission');
  let permission = await permissionRepository.findOneBy({ name });

  if (!permission) {
    permission = await permissionRepository.save(permissionRepository.create({
      name,
      description: `Generado automaticamente para ${name}`,
      status: 'E',
      category: 'Operation',
      menuId: cashMenuId
    }));
    return permission;
  }

  await permissionRepository.update(permission.id, {
    status: 'E',
    category: 'Operation',
    menuId: cashMenuId
  });

  return { ...permission, status: 'E', category: 'Operation', menuId: cashMenuId };
};

const mergeRolePermissions = async (manager, oldPermission, newPermission) => {
  if (!oldPermission || !newPermission) return;

  const rolePermissionRepository = manager.getRepository('RolePermission');
  const oldRows = await rolePermissionRepository.findBy({ idPermission: oldPermission.id });

  for (const oldRow of oldRows) {
    const existing = await rolePermissionRepository.findOneBy({
      idRole: oldRow.idRole,
      idPermission: newPermission.id
    });

    if (!existing) {
      await rolePermissionRepository.save(rolePermissionRepository.create({
        idRole: oldRow.idRole,
        idPermission: newPermission.id,
        status: oldRow.status,
        isCheck: oldRow.isCheck,
        isGlobal: oldRow.isGlobal
      }));
    } else {
      await rolePermissionRepository.update(existing.id, {
        status: existing.status === 'E' || oldRow.status === 'E' ? 'E' : existing.status,
        isCheck: Boolean(existing.isCheck || oldRow.isCheck),
        isGlobal: Boolean(existing.isGlobal || oldRow.isGlobal)
      });
    }
  }
};

const deactivateOldCashAdvanced = async manager => {
  const permissionRepository = manager.getRepository('Permission');
  const menuRepository = manager.getRepository('Menu');

  for (const oldName of permissionMap.keys()) {
    const oldPermission = await permissionRepository.findOneBy({ name: oldName });
    if (oldPermission) await permissionRepository.update(oldPermission.id, { status: 'D' });
  }

  const oldMenus = await menuRepository.createQueryBuilder('menu')
    .where('menu.path = :path', { path: 'cash-advanced' })
    .orWhere('menu.path = :controller', { controller: 'CashAdvanced' })
    .getMany();

  for (const menu of oldMenus) {
    await menuRepository.update(menu.id, { status: 'D' });
  }
};

try {
  await AppDataSource.initialize();

  await AppDataSource.transaction(async manager => {
    const permissionRepository = manager.getRepository('Permission');
    const { cashMenu } = await getOperationCashMenu(manager);

    const targetPermissions = [
      'CashSession.Ver',
      'CashSession.Crear',
      'CashSession.Editar',
      'CashSession.Eliminar',
      'CashSession.Cerrar',
      'CashSession.Movimiento',
      'CashSession.Autorizar',
      'CashSession.Reportes',
      'CashSession.Auditoria',
      'CashSession.Conciliar'
    ];

    for (const name of targetPermissions) {
      await ensurePermission(manager, name, cashMenu.id);
    }

    for (const [oldName, newName] of permissionMap) {
      const oldPermission = await permissionRepository.findOneBy({ name: oldName });
      const newPermission = await ensurePermission(manager, newName, cashMenu.id);
      await mergeRolePermissions(manager, oldPermission, newPermission);
    }

    await deactivateOldCashAdvanced(manager);
  });

  console.log('CashSession and CashAdvanced menus/permissions unified.');
} finally {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
}
