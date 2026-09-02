import { EntitySchema } from 'typeorm';

export const RolePermissionEntity = new EntitySchema({
  name: 'RolePermission',
  tableName: 'T_ROLE_PERMISSION',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    idRole: { name: 'ID_ROLE', type: Number },
    idPermission: { name: 'ID_PERMISSION', type: Number },
    status: { name: 'STATUS', type: String, length: 5, default: 'E' },
    isCheck: { name: 'IS_CHECK', type: Boolean, default: false },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    role: { type: 'many-to-one', target: 'Role', joinColumn: { name: 'ID_ROLE' } },
    permission: { type: 'many-to-one', target: 'Permission', joinColumn: { name: 'ID_PERMISSION' } }
  },
  uniques: [{ name: 'UK_ROLE_PERMISSION', columns: ['idRole', 'idPermission'] }]
});
