import type { OrganizationMember } from '@domain/identity';

/** Persistence contract for organization members, implemented in the infrastructure layer. */
export interface IOrganizationMemberRepository {
  /** Persists a new member. */
  insert(member: OrganizationMember): Promise<void>;

  /** Returns every organization the user is a member of, one entry each. */
  findByUserId(userId: string): Promise<OrganizationMember[]>;
}
