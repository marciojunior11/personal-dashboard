import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ConflictError } from '@personal-dashboard/shared/errors';
import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import type { IOrganizationRepository } from '@application/identity';
import type { Organization } from '@domain/identity';
import {
  uniqueViolationFields,
  type PrismaTransactionHost,
} from '@infrastructure/database';
import { OrganizationMapper } from '@infrastructure/identity/mappers';

/** `IOrganizationRepository` on the `organizations` table; joins the current unit of work. */
@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  async insert(organization: Organization): Promise<void> {
    try {
      await this.txHost.tx.organization.create({
        data: OrganizationMapper.toPersistence(organization),
      });
    } catch (error) {
      if (uniqueViolationFields(error) === null) throw error;
      throw new ConflictError(IdentityErrorCodes.ORGANIZATION_ID_TAKEN, {
        id: organization.id,
      });
    }
  }

  async findById(id: string): Promise<Organization | null> {
    const row = await this.txHost.tx.organization.findUnique({ where: { id } });
    return row === null ? null : OrganizationMapper.toDomain(row);
  }
}
