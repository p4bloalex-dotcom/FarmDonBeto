import { EntitySchema } from 'typeorm';

export const RoleMenuEntity = new EntitySchema({
  name: 'RoleMenu',
  tableName: 'TB_ROLE_MENU',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    idRole: { name: 'ID_ROLE', type: Number },
    idMenu: { name: 'ID_MENU', type: Number },
    status: { name: 'STATUS', type: String, length: 5, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    role: { type: 'many-to-one', target: 'Role', joinColumn: { name: 'ID_ROLE' } },
    menu: { type: 'many-to-one', target: 'Menu', joinColumn: { name: 'ID_MENU' } }
  },
  uniques: [{ name: 'UK_ROLE_MENU', columns: ['idRole', 'idMenu'] }]
});
