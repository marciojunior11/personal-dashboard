import { Session } from '@domain/identity';
import { MockSessionRepository } from '@infrastructure/identity';

const NOW = new Date('2026-11-02T12:00:00.000Z');

const newSession = (userId = 'user-1', tokenHash = 'a'.repeat(64), now = NOW) =>
  Session.create({ userId, tokenHash, userAgent: null, ip: null }, now);

describe('MockSessionRepository', () => {
  let repository: MockSessionRepository;

  beforeEach(() => {
    repository = new MockSessionRepository();
  });

  it('finds a session by its token hash', async () => {
    const session = newSession();
    await repository.insert(session);

    expect(await repository.findByTokenHash('a'.repeat(64))).toBe(session);
    expect(await repository.findByTokenHash('b'.repeat(64))).toBeNull();
  });

  it("lists a user's sessions, most recently used first", async () => {
    const older = newSession('user-1', 'a'.repeat(64));
    const newer = newSession(
      'user-1',
      'b'.repeat(64),
      new Date('2026-11-03T12:00:00.000Z'),
    );
    await repository.insert(older);
    await repository.insert(newer);
    await repository.insert(newSession('user-2', 'c'.repeat(64)));

    expect(await repository.findByUserId('user-1')).toEqual([newer, older]);
  });

  it('deletes one session', async () => {
    const session = newSession();
    await repository.insert(session);

    await repository.delete(session);

    expect(await repository.findByTokenHash(session.tokenHash)).toBeNull();
  });

  it('deletes every session of a user', async () => {
    await repository.insert(newSession('user-1', 'a'.repeat(64)));
    await repository.insert(newSession('user-1', 'b'.repeat(64)));
    const other = newSession('user-2', 'c'.repeat(64));
    await repository.insert(other);

    await repository.deleteByUserId('user-1');

    expect(await repository.findByUserId('user-1')).toEqual([]);
    expect(await repository.findByUserId('user-2')).toEqual([other]);
  });
});
