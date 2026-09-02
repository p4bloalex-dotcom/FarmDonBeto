import { EntitySchema } from 'typeorm';

export const PermissionEntity = new EntitySchema({
  name: 'Permission',
  tableName: 'TB_PERMISSION',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 80 },
    description: { name: 'DESCRIPTION', type: String, length: 200, nullable: true },
    status: { name: 'STATUS', type: String, length: 5, default: 'E' },
    category: { name: 'CATEGORY', type: String, length: 80 },
    menuId: { name: 'MENU_ID', type: Number, nullable: true }
  },
  relations: {
    menu: { type: 'many-to-one', target: 'Menu', joinColumn: { name: 'MENU_ID' }, nullable: true }
  },
  uniques: [{ name: 'UK_PERMISSION_NAME', columns: ['name'] }]
});
