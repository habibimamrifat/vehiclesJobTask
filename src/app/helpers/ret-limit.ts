import redis from '../config/redis.js';

const MAX_REQUESTS = Number(
  process.env.RATE_LIMIT_MAX_REQUESTS || 100,
);
const WINDOW_SECONDS = Number(
  process.env.RATE_LIMIT_WINDOW_SECONDS || 60,
);

export async function checkRateLimit(
  key: string,
): Promise<boolean> {

  const redisKey = `rate-limit:${key}`;
  const current = await redis.incr(redisKey);
  
  if (current === 1) {
    await redis.expire(
      redisKey,
      WINDOW_SECONDS,
    );
  }

  return current <= MAX_REQUESTS;
}