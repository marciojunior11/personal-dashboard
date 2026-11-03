const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How long a session lives. Activity pushes the idle deadline forward, but
 * never past the absolute one: after it, the user has to log in again.
 */
export const SessionPolicy = {
  /** A session nobody uses for this long ends. */
  IDLE_TIMEOUT_MS: 7 * DAY_MS,
  /** No session lives longer than this, however much it is used. */
  ABSOLUTE_TIMEOUT_MS: 30 * DAY_MS,
  /**
   * A session is only renewed once less than this is left until its idle
   * deadline, so an active session costs one write every few days instead
   * of one per request.
   */
  RENEW_THRESHOLD_MS: (7 * DAY_MS) / 2,
} as const;
