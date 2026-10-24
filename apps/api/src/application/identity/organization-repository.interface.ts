import type { Organization } from '@domain/identity';

/** Persistence contract for organizations, implemented in the infrastructure layer. */
export interface IOrganizationRepository {
  /** Persists a new organization. */
  insert(organization: Organization): Promise<void>;

  /** Returns the organization with the given id, or `null` if none exists. */
  findById(id: string): Promise<Organization | null>;
}
