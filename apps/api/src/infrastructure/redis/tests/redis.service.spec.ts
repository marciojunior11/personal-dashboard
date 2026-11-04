import { MisconfigurationError } from '@application/common';
import { RedisService } from '@infrastructure/redis';

describe('RedisService', () => {
  const original = process.env.REDIS_URL;

  afterEach(() => {
    process.env.REDIS_URL = original;
  });

  it('refuses to start without REDIS_URL', () => {
    delete process.env.REDIS_URL;
    expect(() => new RedisService()).toThrow(MisconfigurationError);
  });

  it('starts without Redis and fails commands fast meanwhile', async () => {
    // Nothing listens on this port.
    process.env.REDIS_URL = 'redis://127.0.0.1:1';
    const redis = new RedisService();

    const started = Date.now();
    await redis.onModuleInit();
    expect(Date.now() - started).toBeLessThan(3000);

    const commandStarted = Date.now();
    await expect(redis.client.get('any')).rejects.toThrow();
    expect(Date.now() - commandStarted).toBeLessThan(100);

    await redis.onModuleDestroy();
  });
});
