import { DomainError } from '@personal-dashboard/shared/errors';
import { BirthDate, Email, FullName, PhoneNumber } from '@domain/common';
import { User, type IUserProps } from '@domain/identity';

const props = (overrides: Partial<IUserProps> = {}): IUserProps => ({
  fullName: FullName.create('Maria da Silva'),
  birthDate: BirthDate.create('1990-05-20'),
  email: Email.create('maria@mail.com'),
  phone: null,
  passwordHash: '$argon2id$hash',
  ...overrides,
});

describe('User', () => {
  it('creates a user with a generated id', () => {
    const user = User.create(props());

    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user.fullName.value).toBe('Maria da Silva');
    expect(user.email?.value).toBe('maria@mail.com');
    expect(user.phone).toBeNull();
  });

  it('accepts only a phone as identifier', () => {
    const user = User.create(
      props({ email: null, phone: PhoneNumber.create('11987654321') }),
    );
    expect(user.phone?.value).toBe('11987654321');
  });

  it('requires an e-mail or a phone', () => {
    expect(() => User.create(props({ email: null, phone: null }))).toThrow(
      DomainError,
    );
  });

  it('requires a password hash', () => {
    expect(() => User.create(props({ passwordHash: '' }))).toThrow(DomainError);
  });

  it('restores a user keeping its id and compares by id', () => {
    const restored = User.restore('user-1', props());

    expect(restored.id).toBe('user-1');
    expect(
      restored.equals(User.restore('user-1', props({ phone: null }))),
    ).toBe(true);
    expect(restored.equals(User.create(props()))).toBe(false);
  });
});
