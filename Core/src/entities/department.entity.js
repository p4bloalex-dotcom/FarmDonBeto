import { EntitySchema } from 'typeorm';

export const DepartmentEntity = new EntitySchema({
  name: 'Department',
  tableName: 'TB_DEPARTMENT',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 100, unique: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true }
  }
});
