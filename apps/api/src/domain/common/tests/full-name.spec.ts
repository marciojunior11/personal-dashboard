import { DomainError } from '@personal-dashboard/shared/errors';
import { FullName } from '@domain/common';

describe('FullName', () => {
  it('normalizes spaces', () => {
    expect(FullName.create('  Maria   da  Silva ').value).toBe(
      'Maria da Silva',
    );
  });

  it('accepts accents, apostrophes and hyphens', () => {
    expect(FullName.create("João D'Ávila Ana-Clara").value).toBe(
      "João D'Ávila Ana-Clara",
    );
  });

  it.each([
    '',
    'Maria',
    'Maria S1lva',
    'Maria @Silva',
    `Ana ${'a'.repeat(150)}`,
  ])('rejects %j', (raw) => {
    expect(() => FullName.create(raw)).toThrow(DomainError);
  });
});
