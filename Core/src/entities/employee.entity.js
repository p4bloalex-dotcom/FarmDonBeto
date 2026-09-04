import { EntitySchema } from 'typeorm';

export const EmployeeEntity = new EntitySchema({
  name: 'Employee',
  tableName: 'TB_EMPLOYEE',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    firstName: { name: 'FIRST_NAME', type: String, length: 100 },
    middleName: { name: 'MIDDLE_NAME', type: String, length: 100, nullable: true },
    otherNames: { name: 'OTHER_NAMES', type: String, length: 100, nullable: true },
    lastName: { name: 'LAST_NAME', type: String, length: 100 },
    secondLastname: { name: 'SECOND_LASTNAME', type: String, length: 100, nullable: true },
    phone: { name: 'PHONE', type: String, length: 20 },
    gender: { name: 'GENDER', type: String, length: 1 },
    email: { name: 'EMAIL', type: String, length: 120, unique: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    companyId: { name: 'COMPANY_ID', type: Number, nullable: true },
    branchId: { name: 'BRANCH_ID', type: Number, nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    company: { type: 'many-to-one', target: 'Company', joinColumn: { name: 'COMPANY_ID' }, nullable: true },
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' }, nullable: true }
  }
});
