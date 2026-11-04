import { Session } from '@domain/identity';
import {
  MockSessionRepository,
  RedisSessionRepository,
  SESSION_CACHE_MAX_TTL_SECONDS,
  SESSION_CACHE_TOMBSTONE,
  SET_UNLESS_REVOKED_SCRIPT,
} from '@infrastructure/identity';
import type { RedisService } from '@infrastructure/redis';

const NOW = new Date('2026-11-02T12:00:00.000Z');

interface IEntry {
  value: string;
  ttl: number;
}

/** The handful of Redis commands the repository uses, in memory. */
class FakeRedisClient {
  readonly store = new Map<string, IEntry>();
  down = false;

  private check(): void {
    if (this.down) throw new Error('Redis is down');
  }

  async get(key: string): Promise<string | null> {
    this.check();
    return this.store.get(key)?.value ?? null;
  }

  async set(
    key: string,
    value: string,
    options: { condition?: 'NX'; expiration: { value: number } },
  ): Promise<string | null> {
    this.check();
    if (options.condition === 'NX' && this.store.has(key)) return null;
    this.store.set(key, { value, ttl: options.expiration.value });
    return 'OK';
  }

  async eval(
    script: string,
    options: { keys: string[]; arguments: string[] },
  ): Promise<number> {
    this.check();
    expect(script).toBe(SET_UNLESS_REVOKED_SCRIPT);
    const [key] = options.keys;
    const [value, tombstone, ttl] = options.arguments;
    if (this.store.get(key)?.value === tombstone) return 0;
    this.store.set(key, { value, ttl: Number(ttl) });
    return 1;
  }

  multi() {
    const commands: (() => Promise<unknown>)[] = [];
    const multi = {
      set: (...args: Parameters<FakeRedisClient['set']>) => {
        commands.push(() => this.set(...args));
        return multi;
      },
      exec: async () => {
        this.check();
        return Promise.all(commands.map((command) => command()));
      },
    };
    return multi;
  }
}

const newSession = (userId = 'user-1', tokenHash = 'a'.repeat(64)) =>
  Session.create({ userId, tokenHash, userAgent: null, ip: null }, NOW);

const key = (session: Session) => `session:${session.tokenHash}`;

describe('RedisSessionRepository', () => {
  let database: MockSessionRepository;
  let client: FakeRedisClient;
  let inTransaction: boolean;
  let repository: RedisSessionRepository;

  beforeEach(() => {
    database = new MockSessionRepository();
    client = new FakeRedisClient();
    inTransaction = false;
    repository = new RedisSessionRepository(
      database,
      { client } as unknown as RedisService,
      { isTransactionActive: () => inTransaction },
      () => NOW,
    );
  });

  it('inserts into the database only', async () => {
    const session = newSession();
    await repository.insert(session);

    expect(await database.findByTokenHash(session.tokenHash)).toBe(session);
    expect(client.store.size).toBe(0);
  });

  it('caches a session on the first read and serves the next from the cache', async () => {
    const session = newSession();
    await database.insert(session);

    expect((await repository.findByTokenHash(session.tokenHash))?.id).toBe(
      session.id,
    );
    expect(client.store.get(key(session))?.ttl).toBe(
      SESSION_CACHE_MAX_TTL_SECONDS,
    );

    const findInDatabase = vi.spyOn(database, 'findByTokenHash');
    const cached = await repository.findByTokenHash(session.tokenHash);
    expect(findInDatabase).not.toHaveBeenCalled();
    expect(cached?.equals(session)).toBe(true);
    expect(cached?.expiresAt).toEqual(session.expiresAt);
  });

  it('never caches longer than the session lives', async () => {
    const session = newSession();
    await database.insert(session);
    const nearTheEnd = new Date(session.expiresAt.getTime() - 60_000);
    repository = new RedisSessionRepository(
      database,
      { client } as unknown as RedisService,
      { isTransactionActive: () => false },
      () => nearTheEnd,
    );

    await repository.findByTokenHash(session.tokenHash);

    expect(client.store.get(key(session))?.ttl).toBe(60);
  });

  it('does not cache unknown tokens', async () => {
    expect(await repository.findByTokenHash('b'.repeat(64))).toBeNull();
    expect(client.store.size).toBe(0);
  });

  it('skips the cache inside a unit of work', async () => {
    const session = newSession();
    await database.insert(session);
    inTransaction = true;

    expect(await repository.findByTokenHash(session.tokenHash)).toBe(session);
    expect(client.store.size).toBe(0);
  });

  it('refreshes the cached copy after a renewal', async () => {
    const session = newSession();
    await database.insert(session);
    await repository.findByTokenHash(session.tokenHash);

    session.renew(new Date('2026-11-06T12:00:00.000Z'));
    await repository.update(session);

    const cached = await repository.findByTokenHash(session.tokenHash);
    expect(cached?.expiresAt).toEqual(session.expiresAt);
  });

  it('stops serving a removed session at once', async () => {
    const session = newSession();
    await database.insert(session);
    await repository.findByTokenHash(session.tokenHash);

    await repository.delete(session);

    expect(client.store.get(key(session))?.value).toBe(SESSION_CACHE_TOMBSTONE);
    expect(await repository.findByTokenHash(session.tokenHash)).toBeNull();
  });

  it('lets neither a late read nor a renewal bring a removed session back', async () => {
    const session = newSession();
    await database.insert(session);
    await repository.delete(session);
    // A read that loaded the row before the removal was committed.
    await database.insert(session);

    expect(await repository.findByTokenHash(session.tokenHash)).toBeNull();
    session.renew(new Date('2026-11-06T12:00:00.000Z'));
    await repository.update(session);
    expect(client.store.get(key(session))?.value).toBe(SESSION_CACHE_TOMBSTONE);
  });

  it('revokes every session of a user', async () => {
    const first = newSession('user-1', 'a'.repeat(64));
    const second = newSession('user-1', 'b'.repeat(64));
    const other = newSession('user-2', 'c'.repeat(64));
    for (const session of [first, second, other]) {
      await database.insert(session);
      await repository.findByTokenHash(session.tokenHash);
    }

    await repository.deleteByUserId('user-1');

    expect(await repository.findByTokenHash(first.tokenHash)).toBeNull();
    expect(await repository.findByTokenHash(second.tokenHash)).toBeNull();
    expect(
      (await repository.findByTokenHash(other.tokenHash))?.equals(other),
    ).toBe(true);
  });

  it('falls back to the database while Redis is down', async () => {
    const session = newSession();
    await database.insert(session);
    client.down = true;

    expect(await repository.findByTokenHash(session.tokenHash)).toBe(session);
    session.renew(new Date('2026-11-06T12:00:00.000Z'));
    await expect(repository.update(session)).resolves.toBeUndefined();
    await expect(repository.delete(session)).resolves.toBeUndefined();
    expect(await database.findByTokenHash(session.tokenHash)).toBeNull();
  });
});
