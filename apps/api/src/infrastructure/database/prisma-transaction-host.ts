import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import type { PrismaService } from './prisma.service.js';

/**
 * What repositories inject to reach the database: `txHost.tx` is the current
 * transaction when a unit of work is running, the plain client otherwise.
 */
export type PrismaTransactionHost = TransactionHost<
  TransactionalAdapterPrisma<PrismaService>
>;
