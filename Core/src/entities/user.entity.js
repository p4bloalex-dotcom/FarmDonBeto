import { EntitySchema } from 'typeorm';

export const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'TB_USER',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 50, unique: true },
    password: { name: 'PASSWORD', type: String, length: 255 },
    salt: { name: 'SALT', type: String, length: 255 },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    hasChangedPass: { name: 'HAS_CHANGED_PASS', type: Boolean, default: false },
    lastLogin: { name: 'LAST_LOGIN', type: 'timestamp', nullable: true },
    idPersonal: { name: 'ID_PERSONAL', type: Number, nullable: true },
    idRole: { name: 'ID_ROLE', type: Number },
    companyId: { name: 'COMPANY_ID', type: Number, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    role: { type: 'many-to-one', target: 'Role', joinColumn: { name: 'ID_ROLE' } },
    employee: { type: 'one-to-one', target: 'Employee', joinColumn: { name: 'ID_PERSONAL' } }

  }
});
