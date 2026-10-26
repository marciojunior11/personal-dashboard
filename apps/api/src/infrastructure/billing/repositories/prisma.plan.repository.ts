import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { IPlanRepository } from '@application/billing';
import type { Plan, PlanCode } from '@domain/billing';
import type { PrismaTransactionHost } from '@infrastructure/database';
import { PlanMapper } from '@infrastructure/billing/mappers';

/**
 * `IPlanRepository` on the `plans` table. The catalog is reference data
 * inserted by a migration, so this repository only reads it.
 */
@Injectable()
export class PrismaPlanRepository implements IPlanRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  async findByCode(code: PlanCode): Promise<Plan | null> {
    const row = await this.txHost.tx.plan.findUnique({ where: { code } });
    return row === null ? null : PlanMapper.toDomain(row);
  }
}
