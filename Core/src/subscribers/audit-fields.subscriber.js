import { EntityManager, getMetadataArgsStorage } from 'typeorm';
import { getRequestContext } from '../utils/request-context.js';

const now = () => new Date();

const currentUser = () => getRequestContext()?.user ?? null;

const hasColumn = (metadata, name) => metadata.columns.some(column => column.propertyName === name || column.databaseName === name);
const isAuditLog = metadata => metadata?.name === 'AuditTrailLog' || metadata?.tableName === 'TB_AUDIT_TRAIL_LOG';
const ignoredProperties = new Set(['password', 'salt']);

const sanitize = value => {
  if (!value || typeof value !== 'object') return value ?? null;
  return Object.fromEntries(Object.entries(value).filter(([key, entry]) => !ignoredProperties.has(key) && typeof entry !== 'function'));
};

const stringify = value => {
  if (!value) return null;
  return JSON.stringify(sanitize(value));
};

const recordId = (metadata, entity) => {
  if (!entity) return null;
  const primary = metadata.primaryColumns?.[0];
  if (!primary) return entity.id == null ? null : String(entity.id);
  const value = entity[primary.propertyName] ?? entity[primary.databaseName];
  return value == null ? null : String(value);
};

const writeAuditLog = async (event, action, oldValues = null, newValues = null) => {
  if (isAuditLog(event.metadata)) return;
  const user = currentUser();
  await event.manager.insert('AuditTrailLog', {
    tableName: event.metadata.tableName,
    action,
    recordId: recordId(event.metadata, newValues ?? oldValues),
    userId: user?.id ?? null,
    oldValues: stringify(oldValues),
    newValues: stringify(newValues),
    createdAt: now()
  });
};

const fieldsForInsert = (metadata, entity) => {
  const user = currentUser();

  if (hasColumn(metadata, 'status') && entity.status == null) {
    entity.status = 'E';
  }
  if (hasColumn(metadata, 'createdAt') && entity.createdAt == null) {
    entity.createdAt = now();
  }
  if (hasColumn(metadata, 'updatedAt')) {
    entity.updatedAt = now();
  }
  if (hasColumn(metadata, 'createdBy') && entity.createdBy == null && user?.id) {
    entity.createdBy = user.id;
  }
  if (hasColumn(metadata, 'updatedBy') && entity.updatedBy == null && user?.id) {
    entity.updatedBy = user.id;
  }
  if (hasColumn(metadata, 'branchId') && entity.branchId == null && user?.branchId) {
    entity.branchId = user.branchId;
  }

  return entity;
};

const fieldsForUpdate = (metadata, entity) => {
  const user = currentUser();

  if (hasColumn(metadata, 'updatedAt')) {
    entity.updatedAt = now();
  }
  if (hasColumn(metadata, 'updatedBy') && user?.id) {
    entity.updatedBy = user.id;
  }

  return entity;
};

export class AuditFieldsSubscriber {
  beforeInsert(event) {
    if (event.entity) {
      fieldsForInsert(event.metadata, event.entity);
    }
  }

  beforeUpdate(event) {
    if (event.entity) {
      fieldsForUpdate(event.metadata, event.entity);
    }
  }

  async afterInsert(event) {
    await writeAuditLog(event, 'INSERT', null, event.entity);
  }

  async afterUpdate(event) {
    await writeAuditLog(event, 'UPDATE', event.databaseEntity, event.entity);
  }

  async afterRemove(event) {
    await writeAuditLog(event, 'DELETE', event.databaseEntity ?? event.entity, null);
  }
}

getMetadataArgsStorage().entitySubscribers.push({ target: AuditFieldsSubscriber });

let installed = false;

export const installAuditHooks = () => {
  if (installed) {
    return;
  }
  installed = true;

  const originalUpdate = EntityManager.prototype.update;
  EntityManager.prototype.update = function update(target, criteria, partialEntity) {
    if (partialEntity && typeof partialEntity === 'object') {
      const metadata = this.connection.getMetadata(target);
      if (metadata) {
        partialEntity = fieldsForUpdate(metadata, { ...partialEntity });
      }
    }
    return originalUpdate.call(this, target, criteria, partialEntity);
  };

  const originalInsert = EntityManager.prototype.insert;
  EntityManager.prototype.insert = function insert(target, entityOrEntities) {
    const metadata = this.connection.getMetadata(target);
    if (metadata) {
      if (Array.isArray(entityOrEntities)) {
        entityOrEntities = entityOrEntities.map(entity => fieldsForInsert(metadata, { ...entity }));
      } else if (entityOrEntities && typeof entityOrEntities === 'object') {
        entityOrEntities = fieldsForInsert(metadata, { ...entityOrEntities });
      }
    }
    return originalInsert.call(this, target, entityOrEntities);
  };
};
