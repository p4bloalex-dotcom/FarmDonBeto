import { EntitySchema } from 'typeorm';

export const CompanyEntity = new EntitySchema({
  name: 'Company',
  tableName: 'TB_COMPANY',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    name: { name: 'NAME', type: String, length: 100 },
    phone: { name: 'PHONE', type: String, length: 20 },
    idDepartment: { name: 'ID_DEPARTMENT', type: Number },
    idMunicipality: { name: 'ID_MUNICIPALITY', type: Number },
    address: { name: 'ADDRESS', type: String, length: 100, nullable: true },
    email: { name: 'EMAIL', type: String, length: 40 },
    logo: { name: 'LOGO', type: 'clob' },
    status: { name: 'STATUS', type: String, length: 2, default: 'E', nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  }
});
