import { DomainError } from '@personal-dashboard/shared/errors';
import { Session, SessionPolicy } from '@domain/identity';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const NOW = new Date('2026-11-02T12:00:00.000Z');
const at = (msFromNow: number) => new Date(NOW.getTime() + msFromNow);

const newSession = () =>
  Session.create(
    {
      userId: 'user-1',
      tokenHash: 'a'.repeat(64),
      userAgent: 'Mozilla/5.0',
      ip: '203.0.113.7',
    },
    NOW,
  );

describe('Session', () => {
  it('creates a session with a generated id and its deadlines', () => {
    const session = newSession();

    expect(session.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(session.userId).toBe('user-1');
    expect(session.tokenHash).toBe('a'.repeat(64));
    expect(session.userAgent).toBe('Mozilla/5.0');
    expect(session.ip).toBe('203.0.113.7');
    expect(session.createdAt).toEqual(NOW);
    expect(session.lastSeenAt).toEqual(NOW);
    expect(session.expiresAt).toEqual(at(SessionPolicy.IDLE_TIMEOUT_MS));
    expect(session.absoluteExpiresAt).toEqual(
      at(SessionPolicy.ABSOLUTE_TIMEOUT_MS),
    );
  });

  it.each([{ userId: '' }, { tokenHash: '' }])(
    'requires a user and a token hash (%j)',
    (overrides) => {
      expect(() =>
        Session.create(
          {
            userId: 'user-1',
            tokenHash: 'a'.repeat(64),
            userAgent: null,
            ip: null,
            ...overrides,
          },
          NOW,
        ),
      ).toThrow(DomainError);
    },
  );

  it('expires at its idle deadline', () => {
    const session = newSession();

    expect(session.isExpired(at(SessionPolicy.IDLE_TIMEOUT_MS - 1))).toBe(
      false,
    );
    expect(session.isExpired(at(SessionPolicy.IDLE_TIMEOUT_MS))).toBe(true);
  });

  it('only asks to be renewed once its idle deadline is close', () => {
    const session = newSession();

    expect(session.shouldRenew(at(HOUR_MS))).toBe(false);
    expect(session.shouldRenew(at(4 * DAY_MS))).toBe(true);
    expect(session.shouldRenew(at(SessionPolicy.IDLE_TIMEOUT_MS))).toBe(false);
  });

  it('pushes the idle deadline forward when renewed', () => {
    const session = newSession();
    const later = at(4 * DAY_MS);

    session.renew(later);

    expect(session.lastSeenAt).toEqual(later);
    expect(session.expiresAt).toEqual(
      at(4 * DAY_MS + SessionPolicy.IDLE_TIMEOUT_MS),
    );
  });

  it('never extends a session past its absolute deadline', () => {
    const session = newSession();
    const nearTheEnd = at(SessionPolicy.ABSOLUTE_TIMEOUT_MS - DAY_MS);

    // Renewed every few days until the end: the last renewal is capped.
    for (let day = 4; day < 30; day += 3) session.renew(at(day * DAY_MS));
    session.renew(nearTheEnd);

    expect(session.expiresAt).toEqual(session.absoluteExpiresAt);
    expect(session.shouldRenew(nearTheEnd)).toBe(false);
    expect(session.isExpired(session.absoluteExpiresAt)).toBe(true);
  });

  it('rejects renewing an expired session', () => {
    const session = newSession();

    expect(() => session.renew(at(SessionPolicy.IDLE_TIMEOUT_MS))).toThrow(
      DomainError,
    );
  });

  it('restores a session keeping its id and compares by id', () => {
    const session = newSession();
    const restored = Session.restore(session.id, {
      userId: session.userId,
      tokenHash: session.tokenHash,
      userAgent: null,
      ip: null,
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
      absoluteExpiresAt: session.absoluteExpiresAt,
    });

    expect(restored.id).toBe(session.id);
    expect(restored.equals(session)).toBe(true);
    expect(restored.equals(newSession())).toBe(false);
  });
});
