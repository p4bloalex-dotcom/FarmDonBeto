import { AppDataSource } from '../config/data-source.js';
import { getRegisteredScreens } from '../routes/route-registry.js';
import { logger } from '../utils/logger.js';

const categoryConfig = {
  Security: { name: 'Seguridad', icon: 'heroicons_solid:shield-check', order: 1 },
  Catalog: { name: 'Catalogo', icon: 'heroicons_solid:squares-2x2', order: 2 },
  Operation: { name: 'Operaciones', icon: 'heroicons_solid:briefcase', order: 3 },
  Configuration: { name: 'Configuraciones', icon: 'heroicons_solid:cog-6-tooth', order: 4 },
  Reports: { name: 'Reporte', icon: 'heroicons_solid:chart-bar-square', order: 5 },
  Audit: { name: 'Auditoria', icon: 'heroicons_solid:document-magnifying-glass', order: 6 }
};

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
    const validPaths = new Set(screens.map(screen => screen.routePath));
    for (const category of categories) {
      const config = categoryConfig[category] ?? { name: category, icon: 'folder', order: 0 };
      let parentMenu = await menuRepository.findOneBy({ path: category, idMenuFather: null });
      if (!parentMenu) {
        parentMenu = await menuRepository.save(menuRepository.create({
          name: config.name,
          icon: config.icon,
          path: category,
          status: 'E',
          order: config.order
        }));
      } else if (parentMenu.status !== 'E' || parentMenu.name !== config.name || parentMenu.icon !== config.icon || parentMenu.order !== config.order) {
        await menuRepository.update(parentMenu.id, { status: 'E', name: config.name, icon: config.icon, order: config.order });
        parentMenu = { ...parentMenu, status: 'E', name: config.name, icon: config.icon, order: config.order };
      }

      const parentRoleMenu = await roleMenuRepository.findOneBy({ idRole: adminRole.id, idMenu: parentMenu.id });
      if (!parentRoleMenu) {
        await roleMenuRepository.save(roleMenuRepository.create({ idRole: adminRole.id, idMenu: parentMenu.id, status: 'E' }));
      }

      const categoryScreens = screens.filter(screen => screen.category === category);
      for (const screen of categoryScreens) {
        let childMenu = await menuRepository.findOneBy({ path: screen.routePath, idMenuFather: parentMenu.id });
        if (!childMenu) {
          childMenu = await menuRepository.findOneBy({ path: screen.controller, idMenuFather: parentMenu.id });
        }
        if (!childMenu) {
          childMenu = await menuRepository.findOneBy({ path: screen.routePath, status: 'E' });
        }
        if (!childMenu) {
          childMenu = await menuRepository.save(menuRepository.create({
            name: screen.title,
            icon: screen.icon,
            path: screen.routePath,
            idMenuFather: parentMenu.id,
            status: 'E',
            order: 0
          }));
        } else if (childMenu.status !== 'E' || childMenu.path !== screen.routePath || childMenu.name !== screen.title || childMenu.icon !== screen.icon || childMenu.idMenuFather !== parentMenu.id) {
          await menuRepository.update(childMenu.id, { status: 'E', name: screen.title, icon: screen.icon, path: screen.routePath, idMenuFather: parentMenu.id });
          childMenu = { ...childMenu, status: 'E', name: screen.title, icon: screen.icon, path: screen.routePath, idMenuFather: parentMenu.id };
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
              isCheck: true,
              isGlobal: false
            }));
          }
        }

        const orphanMenus = await manager.getRepository('Menu')
          .createQueryBuilder('item')
          .where('item.idMenuFather = :parentId', { parentId: parentMenu.id })
          .andWhere('item.status = :active', { active: 'E' })
          .andWhere('item.path NOT IN (:...paths)', { paths: [...validPaths] })
          .getMany();
        for (const orphan of orphanMenus) {
          await menuRepository.update(orphan.id, { status: 'D' });
        }
      }
    }

    const obsoleteParents = await menuRepository.createQueryBuilder('menu')
      .where('menu.idMenuFather IS NULL')
      .andWhere('menu.status = :active', { active: 'E' })
      .andWhere('menu.path NOT IN (:...categories)', { categories })
      .getMany();
    for (const parent of obsoleteParents) {
      const obsoleteChildren = await menuRepository.findBy({ idMenuFather: parent.id });
      const obsoleteMenuIds = [parent.id, ...obsoleteChildren.map(child => child.id)];
      await menuRepository.update(parent.id, { status: 'D' });
      await menuRepository.createQueryBuilder()
        .update()
        .set({ status: 'D' })
        .where('idMenuFather = :parentId', { parentId: parent.id })
        .execute();
      await permissionRepository.createQueryBuilder()
        .update()
        .set({ status: 'D' })
        .where('menuId IN (:...menuIds)', { menuIds: obsoleteMenuIds })
        .execute();
    }
  });

  logger.info({ screens: screens.length }, 'Security menus and permissions generated from screen metadata');
};
