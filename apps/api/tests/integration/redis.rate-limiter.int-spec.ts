import { Test, type TestingModule } from '@nestjs/testing';
import { RedisRateLimiter } from '../../src/infrastructure/rate-limit/index.js';
import {
  RedisModule,
  RedisService,
} from '../../src/infrastructure/redis/index.js';
import { resetRedis } from '../support/redis.js';

const rule = { limit: 2, windowSeconds: 900, failMode: 'closed' } as const;

describe('RedisRateLimiter', () => {
  let module: TestingModule;
  let redis: RedisService;
  let limiter: RedisRateLimiter;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [RedisRateLimiter],
    }).compile();
    await module.init();
    redis = module.get(RedisService);
    limiter = module.get(RedisRateLimiter);
    await resetRedis(redis);
  });

  afterEach(async () => {
    await module.close();
  });

  it('allows hits up to the limit and denies the next one until the window ends', async () => {
    await limiter.consume('login:ip', '203.0.113.7', rule);
    await limiter.consume('login:ip', '203.0.113.7', rule);

    const denied = await limiter.consume('login:ip', '203.0.113.7', rule);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBeGreaterThan(890);
    expect(denied.retryAfterSeconds).toBeLessThanOrEqual(900);
  });

  it('keeps the window from the first hit', async () => {
    await limiter.consume('login:id', 'maria@mail.com', rule);
    const [key] = await redis.client.keys('ratelimit:login:id:*');
    await redis.client.expire(key, 10);

    await limiter.consume('login:id', 'maria@mail.com', rule);

    expect(await redis.client.ttl(key)).toBeLessThanOrEqual(10);
    expect(key).not.toContain('maria');
  });
});
