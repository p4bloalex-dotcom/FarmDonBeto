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
    branchType: { name: 'BRANCH_TYPE', type: String, length: 30, default: 'CENTRO_COMERCIAL' },
    idDepartment: { name: 'ID_DEPARTMENT', type: Number, nullable: true },
    idMunicipality: { name: 'ID_MUNICIPALITY', type: Number, nullable: true },
    companyId: { name: 'COMPANY_ID', type: Number, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    isMain: { name: 'IS_MAIN', type: Number, default: 0 },
    latitude: { name: 'LATITUDE', type: 'decimal', precision: 10, scale: 7, nullable: true },
    longitude: { name: 'LONGITUDE', type: 'decimal', precision: 10, scale: 7, nullable: true },
    coverageRadiusKm: { name: 'COVERAGE_RADIUS_KM', type: 'decimal', precision: 8, scale: 2, default: 8 },
    averageDeliveryMinutes: { name: 'AVERAGE_DELIVERY_MINUTES', type: Number, default: 25 },
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
