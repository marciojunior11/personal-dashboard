import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  IRateLimiter,
  IRateLimitResult,
  IRateLimitRule,
} from '@application/common';
import { RedisService } from '@infrastructure/redis';

/**
 * Subjects are hashed, so no e-mail, phone or IP shows up in Redis keys.
 * The scope stays readable, to inspect the counters by kind.
 */
const counterKey = (scope: string, subject: string) =>
  `ratelimit:${scope}:${createHash('sha256').update(subject).digest('hex')}`;

/**
 * `IRateLimiter` on Redis counters, shared by every API instance: a fixed
 * window per key, started by its first hit (`INCR`, then `EXPIRE NX`).
 */
@Injectable()
export class RedisRateLimiter implements IRateLimiter {
  private readonly logger = new Logger(RedisRateLimiter.name);

  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async consume(
    scope: string,
    subject: string,
    rule: IRateLimitRule,
  ): Promise<IRateLimitResult> {
    const key = counterKey(scope, subject);
    try {
      const [hits, , ttl] = await this.redis.client
        .multi()
        .incr(key)
        .expire(key, rule.windowSeconds, 'NX')
        .ttl(key)
        .exec();

      if (Number(hits) <= rule.limit) {
        return { allowed: true, retryAfterSeconds: 0 };
      }
      return { allowed: false, retryAfterSeconds: Math.max(Number(ttl), 1) };
    } catch (error) {
      this.logger.warn(
        `Rate limit de ${scope} indisponível (fail ${rule.failMode}): ${(error as Error).message}`,
      );
      return rule.failMode === 'open'
        ? { allowed: true, retryAfterSeconds: 0 }
        : { allowed: false, retryAfterSeconds: rule.windowSeconds };
    }
  }
}
