import { getRequestContext } from '../utils/request-context.js';
import { logger } from '../utils/logger.js';

const TENANT_TABLES = [
  'TB_INVENTORY',
  'TB_SALE',
  'TB_PURCHASE',
  'TB_EMPLOYEE',
  'TB_CASH_REGISTER',
  'TB_CASH_SESSION',
  'TB_CASH_MOVEMENT',
  'TB_BRANCH'
];

const CONTEXT_CALL = 'BEGIN PKG_RLS_CTX.SET_BRANCH(:branch); END;';

const permissionCache = new Map();
const rolePermissionCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const cached = (cache, key, loader) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < CACHE_TTL_MS) {
    return Promise.resolve(entry.value);
  }
  return Promise.resolve(loader()).then(value => {
    cache.set(key, { value, at: Date.now() });
    return value;
  });
};

const touchesTenantTable = query => {
  if (typeof query !== 'string') return false;
  const upper = query.toUpperCase();
  return TENANT_TABLES.some(table => upper.includes(`"${table}"`) || upper.includes(table));
};

const resolveBranchScope = dataSource => async () => {
  const store = getRequestContext();
  if (!store?.user?.id) return null;
  if (store.__rlsResolved) return store.__rlsScope;

  const { user } = store;
  let isGlobal = false;

  if (store.permissionName && user.role) {
    const permission = await cached(permissionCache, store.permissionName, () =>
      dataSource.getRepository('Permission').findOneBy({ name: store.permissionName })
    );

    if (permission) {
      isGlobal = await cached(rolePermissionCache, `${user.role}:${store.permissionName}`, () =>
        dataSource.getRepository('RolePermission').findOneBy({ idRole: user.role, idPermission: permission.id })
          .then(rolePermission => rolePermission?.isGlobal ?? false)
      );
    }
  }

  store.__rlsResolved = true;
  store.__rlsScope = isGlobal ? null : (user.branchId ?? null);
  return store.__rlsScope;
};

export const clearBranchRlsCache = () => {
  permissionCache.clear();
  rolePermissionCache.clear();
};

export const installBranchRls = dataSource => {

  const runner = dataSource.createQueryRunner();
  const RunnerClass = runner.constructor;
  runner.release().catch(() => {});
  const originalQuery = RunnerClass.prototype.query;
  const branchScope = resolveBranchScope(dataSource);


  RunnerClass.prototype.query = function branchRlsQuery(query, parameters, useStructuredResult = false) {

    if (this.__branchRlsApplied) {
      return originalQuery.call(this, query, parameters, useStructuredResult);
    }

    if (!touchesTenantTable(query)) {
      return originalQuery.call(this, query, parameters, useStructuredResult);
    }

    if (this.isTransactionActive) {
      return (async () => {
        await this.query(CONTEXT_CALL, [await branchScope()]);
        return originalQuery.call(this, query, parameters, useStructuredResult);
      })();
    }

    return (async () => {
      const fresh = dataSource.createQueryRunner();
      fresh.__branchRlsApplied = true;
      try {
        const scope = await branchScope();
        await fresh.query(CONTEXT_CALL, [await scope]);
        return await fresh.query(query, parameters, useStructuredResult);
      } finally {
        await fresh.release();
      }
    })();
  };
};