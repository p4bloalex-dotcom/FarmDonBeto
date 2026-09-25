export const registerAuditEvent = async (manager, { tableName, action, recordId = null, userId = null, oldValues = null, newValues = null }) => manager.getRepository('AuditTrailLog').save(manager.getRepository('AuditTrailLog').create({
  tableName,
  action,
  recordId: recordId == null ? null : String(recordId),
  userId,
  oldValues: oldValues == null ? null : JSON.stringify(oldValues),
  newValues: newValues == null ? null : JSON.stringify(newValues)
}));
