import { redis } from "@/lib/redis";

const SESSION_PREFIX = "session:";
const PRESENCE_PREFIX = "presence:";
const RATE_LIMIT_PREFIX = "ratelimit:";
const CACHE_PREFIX = "cache:";

export const redisFeatures = {
  async setSession(sessionId: string, userId: string, ttlSeconds: number) {
    await redis.set(`${SESSION_PREFIX}${sessionId}`, userId, "EX", ttlSeconds);
  },

  async getSessionUserId(sessionId: string) {
    return redis.get(`${SESSION_PREFIX}${sessionId}`);
  },

  async deleteSession(sessionId: string) {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
  },

  async setPresence(userId: string, ttlSeconds = 60) {
    await redis.set(`${PRESENCE_PREFIX}${userId}`, "online", "EX", ttlSeconds);
  },

  async isOnline(userId: string) {
    return (await redis.exists(`${PRESENCE_PREFIX}${userId}`)) === 1;
  },

  async rateLimit(key: string, windowSeconds: number, maxRequests: number) {
    const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(maxRequests - count, 0),
      resetInSeconds: Math.max(ttl, 0),
    };
  },

  async setCache<T>(key: string, value: T, ttlSeconds: number) {
    await redis.set(`${CACHE_PREFIX}${key}`, JSON.stringify(value), "EX", ttlSeconds);
  },

  async getCache<T>(key: string): Promise<T | null> {
    const value = await redis.get(`${CACHE_PREFIX}${key}`);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  },
};
