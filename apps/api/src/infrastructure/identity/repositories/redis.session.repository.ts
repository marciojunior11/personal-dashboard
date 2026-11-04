import { Logger } from '@nestjs/common';
import type { ISessionRepository } from '@application/identity';
import type { Session } from '@domain/identity';
import type { PrismaTransactionHost } from '@infrastructure/database';
import { SessionMapper } from '@infrastructure/identity/mappers';
import type { RedisService } from '@infrastructure/redis';

/**
 * Longest a copy lives in the cache. It bounds how long a stale copy can
 * survive if an invalidation fails, e.g. Redis blinking during a logout.
 */
export const SESSION_CACHE_MAX_TTL_SECONDS = 15 * 60;

/**
 * Written in place of a removed session. Readers only fill the cache when
 * the key is empty, so a reader that loaded the session just before it was
 * removed, or before the removal was committed, cannot bring it back.
 */
export const SESSION_CACHE_TOMBSTONE = 'revoked';

/** Replaces the cached copy unless the session was removed meanwhile. */
export const SET_UNLESS_REVOKED_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[2] then return 0 end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[3])
return 1`;

const cacheKey = (tokenHash: string) => `session:${tokenHash}`;

/** Seconds a copy may live: until the session ends, at most the cap. */
const ttlSeconds = (session: Session, now: Date): number =>
  Math.min(
    Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000),
    SESSION_CACHE_MAX_TTL_SECONDS,
  );

/**
 * `ISessionRepository` with a Redis cache in front of another one (Postgres,
 * the source of truth), so that checking a session on each request costs no
 * database query.
 *
 * - Reads fill the cache; writes never put new sessions in it, so a unit of
 *   work that rolls back cannot leave behind a session that does not exist.
 * - Inside a unit of work, reads skip the cache: they may see uncommitted rows.
 * - Removing a session leaves a tombstone, so it stops working at once.
 * - When Redis fails, it logs and goes on with the database alone.
 */
export class RedisSessionRepository implements ISessionRepository {
  private readonly logger = new Logger(RedisSessionRepository.name);

  constructor(
    private readonly sessions: ISessionRepository,
    private readonly redis: RedisService,
    private readonly txHost: Pick<PrismaTransactionHost, 'isTransactionActive'>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  insert(session: Session): Promise<void> {
    return this.sessions.insert(session);
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    if (this.txHost.isTransactionActive()) {
      return this.sessions.findByTokenHash(tokenHash);
    }

    const key = cacheKey(tokenHash);
    const cached = await this.attempt(() => this.redis.client.get(key));
    if (cached === SESSION_CACHE_TOMBSTONE) return null;
    if (typeof cached === 'string') return SessionMapper.fromCache(cached);

    const session = await this.sessions.findByTokenHash(tokenHash);
    const ttl = session === null ? 0 : ttlSeconds(session, this.now());
    if (session !== null && ttl > 0) {
      await this.attempt(() =>
        this.redis.client.set(key, SessionMapper.toCache(session), {
          condition: 'NX',
          expiration: { type: 'EX', value: ttl },
        }),
      );
    }
    return session;
  }

  findByUserId(userId: string): Promise<Session[]> {
    return this.sessions.findByUserId(userId);
  }

  /**
   * Refreshes the copy instead of dropping it: a stale copy would keep
   * asking for a renewal, one database write per request.
   */
  async update(session: Session): Promise<void> {
    await this.sessions.update(session);

    const ttl = ttlSeconds(session, this.now());
    if (ttl <= 0) return;
    await this.attempt(() =>
      this.redis.client.eval(SET_UNLESS_REVOKED_SCRIPT, {
        keys: [cacheKey(session.tokenHash)],
        arguments: [
          SessionMapper.toCache(session),
          SESSION_CACHE_TOMBSTONE,
          String(ttl),
        ],
      }),
    );
  }

  async delete(session: Session): Promise<void> {
    await this.sessions.delete(session);
    await this.revoke([session]);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await this.sessions.findByUserId(userId);
    await this.sessions.deleteByUserId(userId);
    await this.revoke(sessions);
  }

  private async revoke(sessions: Session[]): Promise<void> {
    if (sessions.length === 0) return;
    const multi = this.redis.client.multi();
    for (const session of sessions) {
      multi.set(cacheKey(session.tokenHash), SESSION_CACHE_TOMBSTONE, {
        expiration: { type: 'EX', value: SESSION_CACHE_MAX_TTL_SECONDS },
      });
    }
    const revoked = await this.attempt(() => multi.exec());
    if (revoked === undefined) {
      // The copies may stay usable until their TTL runs out.
      this.logger.error(
        `Sessões removidas no banco, mas não no cache (até ${SESSION_CACHE_MAX_TTL_SECONDS}s): ${sessions.map((session) => session.id).join(', ')}`,
      );
    }
  }

  /** Runs a cache command; on failure logs it and returns `undefined`. */
  private async attempt<T>(command: () => Promise<T>): Promise<T | undefined> {
    try {
      return await command();
    } catch (error) {
      this.logger.warn(
        `Cache de sessões indisponível: ${(error as Error).message}`,
      );
      return undefined;
    }
  }
}
