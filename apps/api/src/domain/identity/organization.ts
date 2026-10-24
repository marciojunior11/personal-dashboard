import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity } from '@domain/common';
import type { OrganizationName } from './organization-name.js';

/**
 * INDIVIDUAL: a self-employed professional working alone.
 * BUSINESS: a gym or studio with a team.
 * It only adapts the UI and billing; access rules are the same for both.
 */
export const OrganizationType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const;

export type OrganizationType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

export interface IOrganizationProps {
  name: OrganizationName;
  type: OrganizationType;
}

/**
 * The tenant: every customer-owned record belongs to one organization. A
 * self-employed professional gets an INDIVIDUAL one on sign-up, so there is
 * a single ownership rule for everyone.
 */
export class Organization extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: IOrganizationProps,
  ) {
    super(id);
  }

  /** Creates a new organization, generating its id. */
  static create(props: IOrganizationProps): Organization {
    return new Organization(crypto.randomUUID(), props);
  }

  /** Rebuilds an existing organization, e.g. when loading it from the database. */
  static restore(id: string, props: IOrganizationProps): Organization {
    return new Organization(id, props);
  }

  get name(): OrganizationName {
    return this.props.name;
  }

  get type(): OrganizationType {
    return this.props.type;
  }

  rename(name: OrganizationName): void {
    this.props.name = name;
  }

  /** Turns a self-employed professional's organization into a team one. */
  becomeBusiness(): void {
    if (this.props.type === OrganizationType.BUSINESS) {
      throw new DomainError('A organização já é do tipo empresa.');
    }
    this.props.type = OrganizationType.BUSINESS;
  }
}
