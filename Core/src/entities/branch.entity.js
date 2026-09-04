import { EntitySchema } from 'typeorm';

export const BranchEntity = new EntitySchema({
  name: 'Branch',
  tableName: 'TB_BRANCH',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 100 },
    phone: { name: 'PHONE', type: String, length: 20, nullable: true },
    email: { name: 'EMAIL', type: String, length: 120, nullable: true },
    address: { name: 'ADDRESS', type: String, length: 150, nullable: true },
    idDepartment: { name: 'ID_DEPARTMENT', type: Number, nullable: true },
    idMunicipality: { name: 'ID_MUNICIPALITY', type: Number, nullable: true },
    companyId: { name: 'COMPANY_ID', type: Number, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    company: { type: 'many-to-one', target: 'Company', joinColumn: { name: 'COMPANY_ID' }, nullable: true },
    department: { type: 'many-to-one', target: 'Department', joinColumn: { name: 'ID_DEPARTMENT' }, nullable: true },
    municipality: { type: 'many-to-one', target: 'Municipality', joinColumn: { name: 'ID_MUNICIPALITY' }, nullable: true }
  }
});
