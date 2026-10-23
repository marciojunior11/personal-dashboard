import { DomainError } from '@personal-dashboard/shared/errors';
import {
  Membership,
  MembershipRole,
  type IMembershipProps,
} from '@domain/identity';

const props = (
  overrides: Partial<IMembershipProps> = {},
): IMembershipProps => ({
  userId: 'user-1',
  organizationId: 'org-1',
  role: MembershipRole.OWNER,
  ...overrides,
});

describe('Membership', () => {
  it('creates a membership with a generated id', () => {
    const membership = Membership.create(props());

    expect(membership.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(membership.userId).toBe('user-1');
    expect(membership.organizationId).toBe('org-1');
    expect(membership.role).toBe(MembershipRole.OWNER);
    expect(membership.isOwner).toBe(true);
  });

  it.each([{ userId: '' }, { organizationId: '' }])(
    'requires a user and an organization (%j)',
    (overrides) => {
      expect(() => Membership.create(props(overrides))).toThrow(DomainError);
    },
  );

  it('changes the role', () => {
    const membership = Membership.create(props());

    membership.changeRole(MembershipRole.PROFESSIONAL);
    expect(membership.role).toBe(MembershipRole.PROFESSIONAL);
    expect(membership.isOwner).toBe(false);
  });

  it('rejects changing to the same role', () => {
    const membership = Membership.create(props());
    expect(() => membership.changeRole(MembershipRole.OWNER)).toThrow(
      DomainError,
    );
  });

  it('restores a membership keeping its id and compares by id', () => {
    const restored = Membership.restore('membership-1', props());

    expect(restored.id).toBe('membership-1');
    expect(
      restored.equals(
        Membership.restore(
          'membership-1',
          props({ role: MembershipRole.PROFESSIONAL }),
        ),
      ),
    ).toBe(true);
    expect(restored.equals(Membership.create(props()))).toBe(false);
  });
});
