import { EntitySchema } from 'typeorm';

export const AuditTrailLogEntity = new EntitySchema({
  name: 'AuditTrailLog',
  tableName: 'TB_AUDIT_TRAIL_LOG',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    tableName: { name: 'TABLE_NAME', type: String, length: 80 },
    action: { name: 'ACTION', type: String, length: 20 },
    recordId: { name: 'RECORD_ID', type: String, length: 80, nullable: true },
    userId: { name: 'USER_ID', type: Number, nullable: true },
    oldValues: { name: 'OLD_VALUES', type: 'clob', nullable: true },
    newValues: { name: 'NEW_VALUES', type: 'clob', nullable: true },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true }
  }
});
