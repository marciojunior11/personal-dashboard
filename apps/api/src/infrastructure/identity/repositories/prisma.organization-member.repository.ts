import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ConflictError } from '@personal-dashboard/shared/errors';
import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import type { IOrganizationMemberRepository } from '@application/identity';
import type { OrganizationMember } from '@domain/identity';
import {
  uniqueViolationFields,
  type PrismaTransactionHost,
} from '@infrastructure/database';
import { OrganizationMemberMapper } from '@infrastructure/identity/mappers';

/** `IOrganizationMemberRepository` on the `organization_members` table; joins the current unit of work. */
@Injectable()
export class PrismaOrganizationMemberRepository implements IOrganizationMemberRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  /** @throws {ConflictError} when the user is already a member of the organization. */
  async insert(member: OrganizationMember): Promise<void> {
    try {
      await this.txHost.tx.organizationMember.create({
        data: OrganizationMemberMapper.toPersistence(member),
      });
    } catch (error) {
      if (uniqueViolationFields(error) === null) throw error;
      throw new ConflictError(
        IdentityErrorCodes.ORGANIZATION_MEMBER_DUPLICATED,
      );
    }
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    const rows = await this.txHost.tx.organizationMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => OrganizationMemberMapper.toDomain(row));
  }
}
