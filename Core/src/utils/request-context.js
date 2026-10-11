import { AsyncLocalStorage } from 'node:async_hooks';

const requestContext = new AsyncLocalStorage();

export const getRequestContext = () => requestContext.getStore();

export const runWithRequestContext = (store, callback) => requestContext.run(store, callback);

export const allowSecondaryBranchScope = branchId => {
  const store = getRequestContext();
  if (!store || branchId === undefined || branchId === null) return;
  store.secondaryBranchId = Number(branchId);
  store.__rlsResolved = false;
};
