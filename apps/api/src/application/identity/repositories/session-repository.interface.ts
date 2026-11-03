import type { Session } from '@domain/identity';

/** Persistence contract for sessions, implemented in the infrastructure layer. */
export interface ISessionRepository {
  /** Persists a new session. */
  insert(session: Session): Promise<void>;

  /** Returns the session whose token has this hash, or `null` if none exists. */
  findByTokenHash(tokenHash: string): Promise<Session | null>;

  /** Returns every session of the user, most recently used first. */
  findByUserId(userId: string): Promise<Session[]>;

  /**
   * Persists the activity recorded by `Session.renew`. Does nothing if the
   * session is gone, e.g. logged out from another tab in the meantime.
   */
  update(session: Session): Promise<void>;

  /** Removes the session; does nothing if it is already gone. */
  delete(session: Session): Promise<void>;

  /** Removes every session of the user, logging them out everywhere. */
  deleteByUserId(userId: string): Promise<void>;
}
