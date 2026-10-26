import type { OrganizationMember as OrganizationMemberRow } from '@generated/prisma';
import {
  OrganizationMember,
  type OrganizationMemberRole,
} from '@domain/identity';

/** Converts between the `organization_members` table and the `OrganizationMember` entity. */
export const OrganizationMemberMapper = {
  toDomain(row: OrganizationMemberRow): OrganizationMember {
    return OrganizationMember.restore(row.id, {
      userId: row.userId,
      organizationId: row.organizationId,
      // The database enum has the same values as the domain's.
      role: row.role as OrganizationMemberRole,
    });
  },

  toPersistence(member: OrganizationMember) {
    return {
      id: member.id,
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
    };
  },
};
