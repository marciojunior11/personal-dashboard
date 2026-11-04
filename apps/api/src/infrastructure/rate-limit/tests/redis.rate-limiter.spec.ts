import type { IRateLimitRule } from '@application/common';
import { RedisRateLimiter } from '@infrastructure/rate-limit';
import type { RedisService } from '@infrastructure/redis';

/** `INCR`, `EXPIRE NX` and `TTL` in a transaction, in memory. */
class FakeRedisClient {
  readonly counters = new Map<string, { hits: number; ttl: number }>();
  down = false;

  multi() {
    const replies: (() => number)[] = [];
    const multi = {
      incr: (key: string) => {
        replies.push(() => {
          const counter = this.counters.get(key) ?? { hits: 0, ttl: -1 };
          counter.hits += 1;
          this.counters.set(key, counter);
          return counter.hits;
        });
        return multi;
      },
      expire: (key: string, seconds: number, mode: 'NX') => {
        expect(mode).toBe('NX');
        replies.push(() => {
          const counter = this.counters.get(key)!;
          if (counter.ttl !== -1) return 0;
          counter.ttl = seconds;
          return 1;
        });
        return multi;
      },
      ttl: (key: string) => {
        replies.push(() => this.counters.get(key)?.ttl ?? -2);
        return multi;
      },
      exec: async () => {
        if (this.down) throw new Error('Redis is down');
        return replies.map((reply) => reply());
      },
    };
    return multi;
  }
}

const rule = (overrides: Partial<IRateLimitRule> = {}): IRateLimitRule => ({
  limit: 2,
  windowSeconds: 900,
  failMode: 'open',
  ...overrides,
});

describe('RedisRateLimiter', () => {
  let client: FakeRedisClient;
  let limiter: RedisRateLimiter;

  beforeEach(() => {
    client = new FakeRedisClient();
    limiter = new RedisRateLimiter({ client } as unknown as RedisService);
  });

  it('allows hits up to the limit and denies the next one', async () => {
    expect(await limiter.consume('login:ip', '203.0.113.7', rule())).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
    await limiter.consume('login:ip', '203.0.113.7', rule());

    expect(await limiter.consume('login:ip', '203.0.113.7', rule())).toEqual({
      allowed: false,
      retryAfterSeconds: 900,
    });
  });

  it('counts each subject and scope apart', async () => {
    await limiter.consume('login:ip', '203.0.113.7', rule({ limit: 1 }));

    const otherSubject = await limiter.consume(
      'login:ip',
      '198.51.100.1',
      rule({ limit: 1 }),
    );
    const otherScope = await limiter.consume(
      'login:id',
      '203.0.113.7',
      rule({ limit: 1 }),
    );
    expect(otherSubject.allowed).toBe(true);
    expect(otherScope.allowed).toBe(true);
  });

  it('starts the window on the first hit only', async () => {
    await limiter.consume('login:id', 'maria@mail.com', rule());
    await limiter.consume('login:id', 'maria@mail.com', rule());

    const [counter] = client.counters.values();
    expect(counter).toEqual({ hits: 2, ttl: 900 });
  });

  it('keeps subjects out of the keys', async () => {
    await limiter.consume('login:id', 'maria@mail.com', rule());

    const [key] = client.counters.keys();
    expect(key).toMatch(/^ratelimit:login:id:[0-9a-f]{64}$/);
    expect(key).not.toContain('maria');
  });

  it('lets requests through while Redis is down when failing open', async () => {
    client.down = true;

    expect(
      await limiter.consume('login:ip', '203.0.113.7', rule({ limit: 0 })),
    ).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it('refuses requests while Redis is down when failing closed', async () => {
    client.down = true;

    expect(
      await limiter.consume(
        'sms',
        '11987654321',
        rule({ failMode: 'closed', windowSeconds: 60 }),
      ),
    ).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });
});
