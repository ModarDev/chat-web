import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  client.on("error", () => {
    // Silence noisy build-time connection errors when Redis is not running.
  });

  return client;
}

export const redis =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}