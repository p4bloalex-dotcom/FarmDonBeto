import { AppDataSource } from '../config/data-source.js';
import { getRegisteredScreens } from '../routes/route-registry.js';
import { logger } from '../utils/logger.js';

export const runSecuritySeeders = async () => {
  const screens = getRegisteredScreens();

  await AppDataSource.transaction(async manager => {
    const roleRepository = manager.getRepository('Role');
    const menuRepository = manager.getRepository('Menu');
    const permissionRepository = manager.getRepository('Permission');
    const roleMenuRepository = manager.getRepository('RoleMenu');
    const rolePermissionRepository = manager.getRepository('RolePermission');

    let adminRole = await roleRepository.findOneBy({ name: 'Administrador' });
    if (!adminRole) {
      adminRole = await roleRepository.save(roleRepository.create({ name: 'Administrador', status: 'E' }));
    }

    const categories = [...new Set(screens.map(screen => screen.category))];
    for (const category of categories) {
      let parentMenu = await menuRepository.findOneBy({ path: category, idMenuFather: null });
      if (!parentMenu) {
        parentMenu = await menuRepository.save(menuRepository.create({
          name: 'Sin descripcion',
          icon: 'folder',
          path: category,
          status: 'I',
          order: 0
        }));
      }

      const categoryScreens = screens.filter(screen => screen.category === category);
      for (const screen of categoryScreens) {
        let childMenu = await menuRepository.findOneBy({ path: screen.controller, idMenuFather: parentMenu.id });
        if (!childMenu) {
          childMenu = await menuRepository.save(menuRepository.create({
            name: screen.title,
            icon: screen.icon,
            path: screen.controller,
            idMenuFather: parentMenu.id,
            status: 'I',
            order: 0
          }));
        }

        const roleMenu = await roleMenuRepository.findOneBy({ idRole: adminRole.id, idMenu: childMenu.id });
        if (!roleMenu) {
          await roleMenuRepository.save(roleMenuRepository.create({ idRole: adminRole.id, idMenu: childMenu.id, status: 'E' }));
        }

        for (const permissionMetadata of Object.values(screen.permissions)) {
          let permission = await permissionRepository.findOneBy({ name: permissionMetadata.permissionName });
          if (!permission) {
            permission = await permissionRepository.save(permissionRepository.create({
              name: permissionMetadata.permissionName,
              description: `Generado automaticamente para ${permissionMetadata.permissionName}`,
              category,
              menuId: childMenu.id,
              status: 'E'
            }));
          }

          const rolePermission = await rolePermissionRepository.findOneBy({ idRole: adminRole.id, idPermission: permission.id });
          if (!rolePermission) {
            await rolePermissionRepository.save(rolePermissionRepository.create({
              idRole: adminRole.id,
              idPermission: permission.id,
              status: 'E',
              isCheck: true
            }));
          }
        }
      }
    }
  });

  logger.info({ screens: screens.length }, 'Security menus and permissions generated from screen metadata');
};
