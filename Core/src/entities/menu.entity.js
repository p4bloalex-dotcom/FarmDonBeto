import { EntitySchema } from 'typeorm';

export const MenuEntity = new EntitySchema({
  name: 'Menu',
  tableName: 'TB_MENU',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 50 },
    icon: { name: 'ICON', type: String, length: 50 },
    idMenuFather: { name: 'ID_MENU_FATHER', type: Number, nullable: true },
    path: { name: 'PATH', type: String, length: 200 },
    status: { name: 'STATUS', type: String, length: 1, default: 'E' },
    order: { name: 'MENU_ORDER', type: Number, default: 0 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    parent: { type: 'many-to-one', target: 'Menu', joinColumn: { name: 'ID_MENU_FATHER' }, nullable: true }
  },
  indices: [{ name: 'IX_MENU_PATH_PARENT', columns: ['path', 'idMenuFather'] }]
});
