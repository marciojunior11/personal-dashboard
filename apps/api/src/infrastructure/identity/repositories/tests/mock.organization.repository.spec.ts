import { ConflictError } from '@personal-dashboard/shared/errors';
import {
  Organization,
  OrganizationName,
  OrganizationType,
} from '@domain/identity';
import { MockOrganizationRepository } from '@infrastructure/identity';

const newOrganization = () =>
  Organization.create({
    name: OrganizationName.create('Maria da Silva'),
    type: OrganizationType.INDIVIDUAL,
  });

describe('MockOrganizationRepository', () => {
  let repository: MockOrganizationRepository;

  beforeEach(() => {
    repository = new MockOrganizationRepository();
  });

  it('finds an inserted organization by id', async () => {
    const organization = newOrganization();
    await repository.insert(organization);

    expect(await repository.findById(organization.id)).toBe(organization);
  });

  it('returns null for an unknown id', async () => {
    expect(await repository.findById('unknown')).toBeNull();
  });

  it('rejects a duplicated id', async () => {
    const organization = newOrganization();
    await repository.insert(organization);

    await expect(repository.insert(organization)).rejects.toThrow(
      ConflictError,
    );
  });
});
