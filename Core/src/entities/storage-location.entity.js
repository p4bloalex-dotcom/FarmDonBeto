import { EntitySchema } from 'typeorm';

export const StorageLocationEntity = new EntitySchema({
  name: 'StorageLocation',
  tableName: 'TB_STORAGE_LOCATION',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    code: { name: 'CODE', type: String, length: 30 },
    name: { name: 'NAME', type: String, length: 120 },
    type: { name: 'TYPE', type: String, length: 40, default: 'GENERAL' },
    requiresTemperatureControl: { name: 'REQUIRES_TEMPERATURE_CONTROL', type: Boolean, default: false },
    minTemperature: { name: 'MIN_TEMPERATURE', type: 'decimal', precision: 6, scale: 2, nullable: true },
    maxTemperature: { name: 'MAX_TEMPERATURE', type: 'decimal', precision: 6, scale: 2, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } }
  }
});
