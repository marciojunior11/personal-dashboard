import { DomainError } from '@personal-dashboard/shared/errors';
import { BirthDate, Email, FullName, PhoneNumber } from '@domain/common';

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

describe('Email', () => {
  it('trims and lowercases', () => {
    expect(Email.create('  John@Mail.COM ').value).toBe('john@mail.com');
  });

  it.each([
    '',
    'john',
    'john@mail',
    'jo hn@mail.com',
    `${'a'.repeat(250)}@x.com`,
  ])('rejects %j', (raw) => {
    expect(() => Email.create(raw)).toThrow(DomainError);
  });
});

describe('PhoneNumber', () => {
  it.each(['11987654321', '(11) 98765-4321', '+55 11 98765-4321'])(
    'normalizes %j to digits',
    (raw) => {
      expect(PhoneNumber.create(raw).value).toBe('11987654321');
    },
  );

  it.each(['', '1198765432', '1187654321', '01987654321', '10987654321'])(
    'rejects %j',
    (raw) => {
      expect(() => PhoneNumber.create(raw)).toThrow(DomainError);
    },
  );
});

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

describe('ValueObject', () => {
  it('compares by value and serializes as the raw value', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
    expect(Email.create('a@b.com').equals(Email.create('c@b.com'))).toBe(false);
    expect(JSON.stringify({ email: Email.create('a@b.com') })).toBe(
      '{"email":"a@b.com"}',
    );
  });
});
