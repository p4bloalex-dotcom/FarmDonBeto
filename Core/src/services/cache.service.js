import { createClient } from 'redis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const memoryCache = new Map();

let client;
let redisReady = false;

const memoryGet = key => {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
};

export const cacheService = {
  async connect() {
    if (!env.redis.enabled || client) return;

    client = createClient({ url: env.redis.url });
    client.on('error', error => {
      redisReady = false;
      logger.warn({ error }, 'Redis cache unavailable, using memory fallback');
    });
    client.on('ready', () => {
      redisReady = true;
      logger.info('Redis cache connected');
    });
    client.on('end', () => {
      redisReady = false;
    });

    try {
      await client.connect();
    } catch (error) {
      redisReady = false;
      logger.warn({ error }, 'Redis cache connection failed, using memory fallback');
    }
  },

  async disconnect() {
    if (!client) return;
    try {
      await client.quit();
    } catch (error) {
      logger.warn({ error }, 'Redis cache shutdown failed');
    } finally {
      client = undefined;
      redisReady = false;
    }
  },

  async get(key) {
    if (redisReady) {
      try {
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        redisReady = false;
        logger.warn({ error, key }, 'Redis cache read failed, using memory fallback');
      }
    }

    return memoryGet(key);
  },

  async set(key, value, ttlSeconds = env.redis.defaultTtlSeconds) {
    if (redisReady) {
      try {
        await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
        return;
      } catch (error) {
        redisReady = false;
        logger.warn({ error, key }, 'Redis cache write failed, using memory fallback');
      }
    }

    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async delByPrefix(prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }

    if (!redisReady) return;

    try {
      for await (const key of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
        await client.del(key);
      }
    } catch (error) {
      redisReady = false;
      logger.warn({ error, prefix }, 'Redis cache prefix delete failed');
    }
  },

  async clearAll() {
    memoryCache.clear();

    if (!redisReady) return;

    try {
      for await (const key of client.scanIterator({ MATCH: '*', COUNT: 100 })) {
        await client.del(key);
      }
    } catch (error) {
      redisReady = false;
      logger.warn({ error }, 'Redis cache clear failed');
    }
  }
};
