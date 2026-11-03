import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity } from '@domain/common';
import { SessionPolicy } from './session-policy.js';

export interface ISessionProps {
  userId: string;
  /** Hash of the token the client holds; the domain never sees the token. */
  tokenHash: string;
  /** Only shown in the list of the user's devices; never trusted for security. */
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  lastSeenAt: Date;
  /** When the session ends: the idle deadline, capped at `absoluteExpiresAt`. */
  expiresAt: Date;
  absoluteExpiresAt: Date;
}

/** The idle deadline counted from `now`, never past the absolute one. */
const idleDeadline = (now: Date, absoluteExpiresAt: Date): Date =>
  new Date(
    Math.min(
      now.getTime() + SessionPolicy.IDLE_TIMEOUT_MS,
      absoluteExpiresAt.getTime(),
    ),
  );

/**
 * A logged-in user on one device. The client proves it with an opaque
 * token; only its hash is kept, so a leaked table does not open sessions.
 *
 * Methods take `now` instead of reading the clock, so callers decide the
 * time and tests control it.
 */
export class Session extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: ISessionProps,
  ) {
    super(id);

    if (props.userId.length === 0 || props.tokenHash.length === 0) {
      throw new DomainError(IdentityErrorCodes.SESSION_INCOMPLETE);
    }
  }

  /** Opens a new session at `now`, generating its id and its deadlines. */
  static create(
    props: Pick<ISessionProps, 'userId' | 'tokenHash' | 'userAgent' | 'ip'>,
    now: Date,
  ): Session {
    const absoluteExpiresAt = new Date(
      now.getTime() + SessionPolicy.ABSOLUTE_TIMEOUT_MS,
    );
    return new Session(crypto.randomUUID(), {
      ...props,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: idleDeadline(now, absoluteExpiresAt),
      absoluteExpiresAt,
    });
  }

  /** Rebuilds an existing session, e.g. when loading it from the database. */
  static restore(id: string, props: ISessionProps): Session {
    return new Session(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get userAgent(): string | null {
    return this.props.userAgent;
  }

  get ip(): string | null {
    return this.props.ip;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get lastSeenAt(): Date {
    return this.props.lastSeenAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get absoluteExpiresAt(): Date {
    return this.props.absoluteExpiresAt;
  }

  isExpired(now: Date): boolean {
    return now.getTime() >= this.props.expiresAt.getTime();
  }

  /**
   * Whether renewing now is worth a write: the session is still valid, its
   * idle deadline is close enough, and it can still move forward.
   */
  shouldRenew(now: Date): boolean {
    if (this.isExpired(now)) return false;
    const left = this.props.expiresAt.getTime() - now.getTime();
    return (
      left < SessionPolicy.RENEW_THRESHOLD_MS &&
      this.props.expiresAt.getTime() < this.props.absoluteExpiresAt.getTime()
    );
  }

  /** Records activity at `now`, pushing the idle deadline forward. */
  renew(now: Date): void {
    if (this.isExpired(now)) {
      throw new DomainError(IdentityErrorCodes.SESSION_EXPIRED);
    }
    this.props.lastSeenAt = now;
    this.props.expiresAt = idleDeadline(now, this.props.absoluteExpiresAt);
  }
}
