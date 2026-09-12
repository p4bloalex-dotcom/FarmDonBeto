import { AsyncLocalStorage } from 'node:async_hooks';

const requestContext = new AsyncLocalStorage();

export const getRequestContext = () => requestContext.getStore();

export const runWithRequestContext = (store, callback) => requestContext.run(store, callback);