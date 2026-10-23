import { DomainError } from '@personal-dashboard/shared/errors';
import { Email } from '@domain/common';

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
