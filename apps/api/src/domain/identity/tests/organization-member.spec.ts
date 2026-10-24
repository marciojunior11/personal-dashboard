import { DomainError } from '@personal-dashboard/shared/errors';
import {
  OrganizationMember,
  OrganizationMemberRole,
  type IOrganizationMemberProps,
} from '@domain/identity';

const props = (
  overrides: Partial<IOrganizationMemberProps> = {},
): IOrganizationMemberProps => ({
  userId: 'user-1',
  organizationId: 'org-1',
  role: OrganizationMemberRole.OWNER,
  ...overrides,
});

describe('OrganizationMember', () => {
  it('creates a member with a generated id', () => {
    const member = OrganizationMember.create(props());

    expect(member.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(member.userId).toBe('user-1');
    expect(member.organizationId).toBe('org-1');
    expect(member.role).toBe(OrganizationMemberRole.OWNER);
    expect(member.isOwner).toBe(true);
  });

  it.each([{ userId: '' }, { organizationId: '' }])(
    'requires a user and an organization (%j)',
    (overrides) => {
      expect(() => OrganizationMember.create(props(overrides))).toThrow(
        DomainError,
      );
    },
  );

  it('changes the role', () => {
    const member = OrganizationMember.create(props());

    member.changeRole(OrganizationMemberRole.PROFESSIONAL);
    expect(member.role).toBe(OrganizationMemberRole.PROFESSIONAL);
    expect(member.isOwner).toBe(false);
  });

  it('rejects changing to the same role', () => {
    const member = OrganizationMember.create(props());
    expect(() => member.changeRole(OrganizationMemberRole.OWNER)).toThrow(
      DomainError,
    );
  });

  it('restores a member keeping its id and compares by id', () => {
    const restored = OrganizationMember.restore('member-1', props());

    expect(restored.id).toBe('member-1');
    expect(
      restored.equals(
        OrganizationMember.restore(
          'member-1',
          props({ role: OrganizationMemberRole.PROFESSIONAL }),
        ),
      ),
    ).toBe(true);
    expect(restored.equals(OrganizationMember.create(props()))).toBe(false);
  });
});
