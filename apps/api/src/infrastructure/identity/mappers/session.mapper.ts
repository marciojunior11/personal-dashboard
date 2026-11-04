import type { Session as SessionRow } from '@generated/prisma';
import { Session } from '@domain/identity';

/** What `toCache` writes: `JSON.stringify` turns the dates into strings. */
interface ICachedSession {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  absoluteExpiresAt: string;
}

/** Converts between the `sessions` table and the `Session` entity. */
export const SessionMapper = {
  toDomain(row: SessionRow): Session {
    return Session.restore(row.id, {
      userId: row.userId,
      tokenHash: row.tokenHash,
      userAgent: row.userAgent,
      ip: row.ip,
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
      expiresAt: row.expiresAt,
      absoluteExpiresAt: row.absoluteExpiresAt,
    });
  },

  toPersistence(session: Session) {
    return {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
      absoluteExpiresAt: session.absoluteExpiresAt,
    };
  },

  /** The session as the JSON kept in the cache; dates as ISO 8601. */
  toCache(session: Session): string {
    return JSON.stringify(SessionMapper.toPersistence(session));
  },

  /** Rebuilds a session from `toCache`'s JSON. */
  fromCache(json: string): Session {
    const data = JSON.parse(json) as ICachedSession;
    return Session.restore(data.id, {
      userId: data.userId,
      tokenHash: data.tokenHash,
      userAgent: data.userAgent,
      ip: data.ip,
      createdAt: new Date(data.createdAt),
      lastSeenAt: new Date(data.lastSeenAt),
      expiresAt: new Date(data.expiresAt),
      absoluteExpiresAt: new Date(data.absoluteExpiresAt),
    });
  },
};
