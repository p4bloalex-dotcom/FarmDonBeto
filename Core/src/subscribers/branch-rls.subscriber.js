import { getRequestContext } from '../utils/request-context.js';
import { cacheService } from '../services/cache.service.js';
import { TENANT_TABLES } from '../tenant/tenant-tables.js';

const CONTEXT_CALL = 'BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain, :isGlobal); END;';
const LEGACY_CONTEXT_CALL = 'BEGIN PKG_RLS_CTX.SET_BRANCH(:branch, :isMain); END;';

const CACHE_TTL_SECONDS = 60;
const CACHE_PREFIX = 'branch-rls:';

const cached = async (key, loader) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const entry = await cacheService.get(cacheKey);
  if (entry !== null) return entry;

  const value = await loader();
  await cacheService.set(cacheKey, value, CACHE_TTL_SECONDS);
  return value;
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
    const permission = await cached(`permission:${store.permissionName}`, () =>
      dataSource.getRepository('Permission').findOneBy({ name: store.permissionName })
    );

    if (permission) {
      isGlobal = await cached(`role-permission:${user.role}:${store.permissionName}`, () =>
        dataSource.getRepository('RolePermission').findOneBy({ idRole: user.role, idPermission: permission.id })
          .then(rolePermission => rolePermission?.isGlobal ?? false)
      );
    }
  }

  store.__rlsResolved = true;
  store.__rlsScope = {
    branchId: isGlobal ? null : (user.branchId ?? null),
    isMain: user.branchIsMain ? 1 : 0,
    isGlobal: isGlobal ? 1 : 0
  };
  return store.__rlsScope;
};

const applyBranchContext = async (runner, scope) => {
  try {
    await runner.query(CONTEXT_CALL, [scope?.branchId ?? null, scope?.isMain ?? 0, scope?.isGlobal ?? 0]);
  } catch (error) {
    if (error?.errorNum !== 6550 && error?.driverError?.errorNum !== 6550) throw error;
    await runner.query(LEGACY_CONTEXT_CALL, [scope?.branchId ?? null, scope?.isGlobal || scope?.isMain ? 1 : 0]);
  }
};

export const clearBranchRlsCache = async () => {
  await cacheService.delByPrefix(CACHE_PREFIX);
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
        const scope = await branchScope();
        await applyBranchContext(this, scope);
        return originalQuery.call(this, query, parameters, useStructuredResult);
      })();
    }

    return (async () => {
      const fresh = dataSource.createQueryRunner();
      fresh.__branchRlsApplied = true;
      try {
        const scope = await branchScope();
        await applyBranchContext(fresh, scope);
        return await fresh.query(query, parameters, useStructuredResult);
      } finally {
        await fresh.release();
      }
    })();
  };
};
