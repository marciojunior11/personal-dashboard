import { Email } from '@domain/common';

describe('ValueObject', () => {
  it('compares by value and serializes as the raw value', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
    expect(Email.create('a@b.com').equals(Email.create('c@b.com'))).toBe(false);
    expect(JSON.stringify({ email: Email.create('a@b.com') })).toBe(
      '{"email":"a@b.com"}',
    );
  });
});
