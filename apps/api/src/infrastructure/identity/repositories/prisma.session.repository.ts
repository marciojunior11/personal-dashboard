import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { ISessionRepository } from '@application/identity';
import type { Session } from '@domain/identity';
import type { PrismaTransactionHost } from '@infrastructure/database';
import { SessionMapper } from '@infrastructure/identity/mappers';

/** `ISessionRepository` on the `sessions` table; joins the current unit of work. */
@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  async insert(session: Session): Promise<void> {
    await this.txHost.tx.session.create({
      data: SessionMapper.toPersistence(session),
    });
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const row = await this.txHost.tx.session.findUnique({
      where: { tokenHash },
    });
    return row === null ? null : SessionMapper.toDomain(row);
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const rows = await this.txHost.tx.session.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
    return rows.map((row) => SessionMapper.toDomain(row));
  }

  // `updateMany` and `deleteMany` match zero rows instead of throwing when
  // the session is already gone.

  async update(session: Session): Promise<void> {
    await this.txHost.tx.session.updateMany({
      where: { id: session.id },
      data: { lastSeenAt: session.lastSeenAt, expiresAt: session.expiresAt },
    });
  }

  async delete(session: Session): Promise<void> {
    await this.txHost.tx.session.deleteMany({ where: { id: session.id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.txHost.tx.session.deleteMany({ where: { userId } });
  }
}
