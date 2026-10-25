import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity } from '@domain/common';

/**
 * OWNER: manages the organization (team, plan, billing) and also trains students.
 * PROFESSIONAL: trains students of the organization.
 */
export const OrganizationMemberRole = {
  OWNER: 'OWNER',
  PROFESSIONAL: 'PROFESSIONAL',
} as const;

export type OrganizationMemberRole =
  (typeof OrganizationMemberRole)[keyof typeof OrganizationMemberRole];

export interface IOrganizationMemberProps {
  userId: string;
  organizationId: string;
  role: OrganizationMemberRole;
}

/**
 * A user who is part of an organization, with a role. Students are not
 * members: they are served by the organization's members.
 *
 * Roles live here, not on the user, because the same person may own their
 * own organization and work as a professional in another one.
 */
export class OrganizationMember extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: IOrganizationMemberProps,
  ) {
    super(id);

    if (props.userId.length === 0 || props.organizationId.length === 0) {
      throw new DomainError(IdentityErrorCodes.ORGANIZATION_MEMBER_INCOMPLETE);
    }
  }

  /** Creates a new member, generating its id. */
  static create(props: IOrganizationMemberProps): OrganizationMember {
    return new OrganizationMember(crypto.randomUUID(), props);
  }

  /** Rebuilds an existing member, e.g. when loading it from the database. */
  static restore(
    id: string,
    props: IOrganizationMemberProps,
  ): OrganizationMember {
    return new OrganizationMember(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get role(): OrganizationMemberRole {
    return this.props.role;
  }

  get isOwner(): boolean {
    return this.props.role === OrganizationMemberRole.OWNER;
  }

  /**
   * Keeping at least one owner per organization needs its other members,
   * so that rule belongs to the use case that calls this.
   */
  changeRole(role: OrganizationMemberRole): void {
    if (role === this.props.role) {
      throw new DomainError(IdentityErrorCodes.ORGANIZATION_MEMBER_SAME_ROLE);
    }
    this.props.role = role;
  }
}
