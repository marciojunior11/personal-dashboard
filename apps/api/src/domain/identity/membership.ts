import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity } from '@domain/common';

/**
 * OWNER: manages the organization (team, plan, billing) and also trains students.
 * PROFESSIONAL: trains students of the organization.
 */
export const MembershipRole = {
  OWNER: 'OWNER',
  PROFESSIONAL: 'PROFESSIONAL',
} as const;

export type MembershipRole =
  (typeof MembershipRole)[keyof typeof MembershipRole];

export interface IMembershipProps {
  userId: string;
  organizationId: string;
  role: MembershipRole;
}

/**
 * Links a user to an organization with a role. Roles live here, not on the
 * user, because the same person may own their own organization and work as a
 * professional in another one.
 */
export class Membership extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: IMembershipProps,
  ) {
    super(id);

    if (props.userId.length === 0 || props.organizationId.length === 0) {
      throw new DomainError(
        'O vínculo deve pertencer a um usuário e a uma organização.',
      );
    }
  }

  /** Creates a new membership, generating its id. */
  static create(props: IMembershipProps): Membership {
    return new Membership(crypto.randomUUID(), props);
  }

  /** Rebuilds an existing membership, e.g. when loading it from the database. */
  static restore(id: string, props: IMembershipProps): Membership {
    return new Membership(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get role(): MembershipRole {
    return this.props.role;
  }

  get isOwner(): boolean {
    return this.props.role === MembershipRole.OWNER;
  }

  /**
   * Keeping at least one owner per organization needs its other memberships,
   * so that rule belongs to the use case that calls this.
   */
  changeRole(role: MembershipRole): void {
    if (role === this.props.role) {
      throw new DomainError('O vínculo já possui esse papel.');
    }
    this.props.role = role;
  }
}
