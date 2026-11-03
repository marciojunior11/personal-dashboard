import type { Session as SessionRow } from '@generated/prisma';
import { Session } from '@domain/identity';

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
};
