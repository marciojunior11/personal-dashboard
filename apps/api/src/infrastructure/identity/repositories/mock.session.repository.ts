import type { ISessionRepository } from '@application/identity';
import type { Session } from '@domain/identity';

/**
 * In-memory `ISessionRepository`, for development and tests. Records live in
 * a list and are lost when the process stops.
 */
export class MockSessionRepository implements ISessionRepository {
  private sessions: Session[] = [];

  async insert(session: Session): Promise<void> {
    this.sessions.push(session);
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    return (
      this.sessions.find((session) => session.tokenHash === tokenHash) ?? null
    );
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessions
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
  }

  async update(session: Session): Promise<void> {
    this.sessions = this.sessions.map((existing) =>
      existing.equals(session) ? session : existing,
    );
  }

  async delete(session: Session): Promise<void> {
    this.sessions = this.sessions.filter(
      (existing) => !existing.equals(session),
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.sessions = this.sessions.filter(
      (session) => session.userId !== userId,
    );
  }
}
