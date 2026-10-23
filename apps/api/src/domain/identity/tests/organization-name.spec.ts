import { DomainError } from '@personal-dashboard/shared/errors';
import { OrganizationName } from '@domain/identity';

describe('OrganizationName', () => {
  it('trims and collapses spaces', () => {
    expect(OrganizationName.create('  Studio   Força  Total ').value).toBe(
      'Studio Força Total',
    );
  });

  it.each(['', ' ', 'A', 'A'.repeat(151)])('rejects %j', (raw) => {
    expect(() => OrganizationName.create(raw)).toThrow(DomainError);
  });
});
