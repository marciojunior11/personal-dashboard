import { ConflictError } from '@personal-dashboard/shared/errors';
import { OrganizationMember, OrganizationMemberRole } from '@domain/identity';
import { MockOrganizationMemberRepository } from '@infrastructure/identity';

const newMember = (organizationId = 'org-1', userId = 'user-1') =>
  OrganizationMember.create({
    userId,
    organizationId,
    role: OrganizationMemberRole.OWNER,
  });

describe('MockOrganizationMemberRepository', () => {
  let repository: MockOrganizationMemberRepository;

  beforeEach(() => {
    repository = new MockOrganizationMemberRepository();
  });

  it('finds every membership of a user', async () => {
    const own = newMember('org-1');
    const gym = newMember('org-2');
    await repository.insert(own);
    await repository.insert(gym);
    await repository.insert(newMember('org-1', 'user-2'));

    expect(await repository.findByUserId('user-1')).toEqual([own, gym]);
  });

  it('returns an empty list for a user with no memberships', async () => {
    expect(await repository.findByUserId('unknown')).toEqual([]);
  });

  it('rejects a duplicated id', async () => {
    const member = newMember();
    await repository.insert(member);

    await expect(repository.insert(member)).rejects.toThrow(ConflictError);
  });

  it('rejects the same user joining the same organization twice', async () => {
    await repository.insert(newMember());

    await expect(repository.insert(newMember())).rejects.toThrow(ConflictError);
  });
});
