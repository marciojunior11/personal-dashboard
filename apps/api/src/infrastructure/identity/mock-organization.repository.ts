import { MessageCode } from '@personal-dashboard/i18n';
import { ConflictError } from '@personal-dashboard/shared/errors';
import type { IOrganizationRepository } from '@application/identity';
import type { Organization } from '@domain/identity';

/**
 * In-memory `IOrganizationRepository`, for development and tests. Records
 * live in a list and are lost when the process stops.
 */
export class MockOrganizationRepository implements IOrganizationRepository {
  private readonly organizations: Organization[] = [];

  async insert(organization: Organization): Promise<void> {
    if (this.organizations.some((existing) => existing.equals(organization))) {
      throw new ConflictError(MessageCode.ORGANIZATION_ID_TAKEN, {
        id: organization.id,
      });
    }

    this.organizations.push(organization);
  }

  async findById(id: string): Promise<Organization | null> {
    return (
      this.organizations.find((organization) => organization.id === id) ?? null
    );
  }
}
