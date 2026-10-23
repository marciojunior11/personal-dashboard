import { ConflictError } from '@personal-dashboard/shared/errors';
import type { IOrganizationMemberRepository } from '@application/identity';
import type { OrganizationMember } from '@domain/identity';

/**
 * In-memory `IOrganizationMemberRepository`, for development and tests.
 * Records live in a list and are lost when the process stops.
 */
export class MockOrganizationMemberRepository implements IOrganizationMemberRepository {
  private readonly members: OrganizationMember[] = [];

  /** A user joins each organization at most once. */
  async insert(member: OrganizationMember): Promise<void> {
    if (
      this.members.some(
        (existing) =>
          existing.equals(member) ||
          (existing.userId === member.userId &&
            existing.organizationId === member.organizationId),
      )
    ) {
      throw new ConflictError('O usuário já é membro desta organização.');
    }

    this.members.push(member);
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    return this.members.filter((member) => member.userId === userId);
  }
}
