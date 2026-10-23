import { DomainError } from '@personal-dashboard/shared/errors';
import { BirthDate } from '@domain/common';

describe('BirthDate', () => {
  const today = new Date(2026, 9, 21); // 2026-10-21

  it('accepts a valid date', () => {
    expect(BirthDate.create('1990-05-20', today).value).toBe('1990-05-20');
  });

  it.each([
    '20/05/1990',
    '1990-5-20',
    '2023-02-30',
    '2026-10-22',
    '1890-01-01',
  ])('rejects %j', (raw) => {
    expect(() => BirthDate.create(raw, today)).toThrow(DomainError);
  });

  it('computes age around the birthday', () => {
    const birthDate = BirthDate.create('2000-10-21', today);
    expect(birthDate.ageAt(new Date(2026, 9, 20))).toBe(25);
    expect(birthDate.ageAt(today)).toBe(26);
  });
});
