import { TransactionHost } from '@nestjs-cls/transactional';
import type { TestingModule } from '@nestjs/testing';
import type { IUnitOfWork } from '../../src/application/common/index.js';
import { BirthDate, Email, FullName } from '../../src/domain/common/index.js';
import { Session, User } from '../../src/domain/identity/index.js';
import {
  UNIT_OF_WORK,
  type PrismaTransactionHost,
} from '../../src/infrastructure/database/index.js';
import {
  PrismaSessionRepository,
  PrismaUserRepository,
  RedisSessionRepository,
  SESSION_CACHE_TOMBSTONE,
} from '../../src/infrastructure/identity/index.js';
import {
  RedisModule,
  RedisService,
} from '../../src/infrastructure/redis/index.js';
import { createDatabaseTestingModule } from '../support/database-testing-module.js';
import { resetRedis } from '../support/redis.js';

const newUser = () =>
  User.create({
    fullName: FullName.create('Maria da Silva'),
    birthDate: BirthDate.create('1990-05-20'),
    email: Email.create('maria@mail.com'),
    phone: null,
    passwordHash: '$argon2id$hash',
  });

describe('RedisSessionRepository', () => {
  let module: TestingModule;
  let redis: RedisService;
  let unitOfWork: IUnitOfWork;
  let database: PrismaSessionRepository;
  let sessions: RedisSessionRepository;
  let user: User;

  const newSession = (tokenHash = 'a'.repeat(64)) =>
    Session.create(
      { userId: user.id, tokenHash, userAgent: null, ip: null },
      new Date(),
    );
  const key = (session: Session) => `session:${session.tokenHash}`;

  beforeEach(async () => {
    module = await createDatabaseTestingModule(
      [PrismaUserRepository, PrismaSessionRepository],
      [RedisModule],
    );
    redis = module.get(RedisService);
    await resetRedis(redis);
    unitOfWork = module.get(UNIT_OF_WORK);
    database = module.get(PrismaSessionRepository);
    sessions = new RedisSessionRepository(
      database,
      redis,
      module.get<PrismaTransactionHost>(TransactionHost),
    );
    user = newUser();
    await module.get(PrismaUserRepository).insert(user);
  });

  afterEach(async () => {
    await module.close();
  });

  it('caches a session read from Postgres with a capped TTL', async () => {
    const session = newSession();
    await sessions.insert(session);

    const found = await sessions.findByTokenHash(session.tokenHash);

    expect(found?.equals(session)).toBe(true);
    expect(await redis.client.exists(key(session))).toBe(1);
    expect(await redis.client.ttl(key(session))).toBeLessThanOrEqual(15 * 60);
  });

  it('refreshes the copy on renewal and revokes it on removal', async () => {
    const session = newSession();
    await sessions.insert(session);
    await sessions.findByTokenHash(session.tokenHash);

    const later = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    session.renew(later);
    await sessions.update(session);
    expect(
      (await sessions.findByTokenHash(session.tokenHash))?.expiresAt,
    ).toEqual(session.expiresAt);

    await sessions.delete(session);
    expect(await redis.client.get(key(session))).toBe(SESSION_CACHE_TOMBSTONE);
    expect(await sessions.findByTokenHash(session.tokenHash)).toBeNull();

    // The Lua script leaves the tombstone alone.
    await sessions.update(session);
    expect(await redis.client.get(key(session))).toBe(SESSION_CACHE_TOMBSTONE);
  });

  it('does not cache what a unit of work reads before it rolls back', async () => {
    const session = newSession();

    await unitOfWork
      .run(async () => {
        await sessions.insert(session);
        expect(
          await sessions.findByTokenHash(session.tokenHash),
        ).not.toBeNull();
        throw new Error('rollback');
      })
      .catch(() => undefined);

    expect(await redis.client.exists(key(session))).toBe(0);
    expect(await sessions.findByTokenHash(session.tokenHash)).toBeNull();
  });

  it('revokes every session of a user', async () => {
    const first = newSession('a'.repeat(64));
    const second = newSession('b'.repeat(64));
    for (const session of [first, second]) {
      await sessions.insert(session);
      await sessions.findByTokenHash(session.tokenHash);
    }

    await sessions.deleteByUserId(user.id);

    expect(await sessions.findByTokenHash(first.tokenHash)).toBeNull();
    expect(await sessions.findByTokenHash(second.tokenHash)).toBeNull();
    expect(await database.findByUserId(user.id)).toEqual([]);
  });
});
