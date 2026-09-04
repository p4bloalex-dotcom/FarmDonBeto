import { EntitySchema } from 'typeorm';

export const MunicipalityEntity = new EntitySchema({
  name: 'Municipality',
  tableName: 'TB_MUNICIPALITY',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 120 },
    idDepartment: { name: 'ID_DEPARTMENT', type: Number },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true }
  },
  relations: {
    department: { type: 'many-to-one', target: 'Department', joinColumn: { name: 'ID_DEPARTMENT' } }
  },
  uniques: [{ name: 'UK_MUNICIPALITY_DEPARTMENT', columns: ['name', 'idDepartment'] }]
});
