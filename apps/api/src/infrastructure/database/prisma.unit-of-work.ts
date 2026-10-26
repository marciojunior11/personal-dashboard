import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { IUnitOfWork } from '@application/common';
import type { PrismaTransactionHost } from './prisma-transaction-host.js';

/**
 * `IUnitOfWork` on a Prisma transaction. nestjs-cls keeps the transaction in
 * the request's context, so repositories using `txHost.tx` join it without
 * the use case passing anything around.
 */
@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.txHost.withTransaction(work);
  }
}
