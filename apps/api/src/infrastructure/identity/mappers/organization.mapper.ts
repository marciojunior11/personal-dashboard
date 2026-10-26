import type { Organization as OrganizationRow } from '@generated/prisma';
import {
  Organization,
  OrganizationName,
  type OrganizationType,
} from '@domain/identity';

/** Converts between the `organizations` table and the `Organization` entity. */
export const OrganizationMapper = {
  toDomain(row: OrganizationRow): Organization {
    return Organization.restore(row.id, {
      name: OrganizationName.create(row.name),
      // The database enum has the same values as the domain's.
      type: row.type as OrganizationType,
    });
  },

  toPersistence(organization: Organization) {
    return {
      id: organization.id,
      name: organization.name.value,
      type: organization.type,
    };
  },
};
