import { DomainError } from '@personal-dashboard/shared/errors';
import {
  OrganizationName,
  Organization,
  OrganizationType,
  type IOrganizationProps,
} from '@domain/identity';

const props = (
  overrides: Partial<IOrganizationProps> = {},
): IOrganizationProps => ({
  name: OrganizationName.create('Maria da Silva'),
  type: OrganizationType.INDIVIDUAL,
  ...overrides,
});

describe('Organization', () => {
  it('creates an organization with a generated id', () => {
    const organization = Organization.create(props());

    expect(organization.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(organization.name.value).toBe('Maria da Silva');
    expect(organization.type).toBe(OrganizationType.INDIVIDUAL);
  });

  it('renames', () => {
    const organization = Organization.create(props());

    organization.rename(OrganizationName.create('Academia Movimento'));
    expect(organization.name.value).toBe('Academia Movimento');
  });

  it('turns an individual organization into a business', () => {
    const organization = Organization.create(props());

    organization.becomeBusiness();
    expect(organization.type).toBe(OrganizationType.BUSINESS);
    expect(() => organization.becomeBusiness()).toThrow(DomainError);
  });

  it('restores an organization keeping its id and compares by id', () => {
    const restored = Organization.restore('org-1', props());

    expect(restored.id).toBe('org-1');
    expect(
      restored.equals(
        Organization.restore(
          'org-1',
          props({ name: OrganizationName.create('Outro nome') }),
        ),
      ),
    ).toBe(true);
    expect(restored.equals(Organization.create(props()))).toBe(false);
  });
});
