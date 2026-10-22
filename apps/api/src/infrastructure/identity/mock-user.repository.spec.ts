import { ConflictError } from '@personal-dashboard/shared/errors';
import { BirthDate } from '../../domain/common/birth-date.js';
import { Email } from '../../domain/common/email.js';
import { FullName } from '../../domain/common/full-name.js';
import { User } from '../../domain/identity/user.js';
import { MockUserRepository } from './mock-user.repository.js';

const newUser = () =>
  User.create({
    fullName: FullName.create('Maria da Silva'),
    birthDate: BirthDate.create('1990-05-20'),
    email: Email.create('maria@mail.com'),
    phone: null,
    passwordHash: '$argon2id$hash',
  });

describe('MockUserRepository', () => {
  let repository: MockUserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
  });

  it('finds an inserted user by id', async () => {
    const user = newUser();
    await repository.insert(user);

    expect(await repository.findById(user.id)).toBe(user);
  });

  it('returns null for an unknown id', async () => {
    expect(await repository.findById('unknown')).toBeNull();
  });

  it('rejects a duplicated id', async () => {
    const user = newUser();
    await repository.insert(user);

    await expect(repository.insert(user)).rejects.toThrow(ConflictError);
  });
});
