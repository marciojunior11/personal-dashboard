import type { RedisService } from '../../src/infrastructure/redis/index.js';

/**
 * Empties the test logical database (`loadTestEnv` refuses development's).
 * Call it before each test, so each starts clean.
 */
export async function resetRedis(redis: RedisService): Promise<void> {
  if (!redis.client.isReady) {
    throw new Error(
      'Redis is not reachable: start it with `docker compose up -d`.',
    );
  }
  await redis.client.flushDb();
}
