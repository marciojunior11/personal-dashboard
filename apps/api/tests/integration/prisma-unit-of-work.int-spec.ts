import type { TestingModule } from '@nestjs/testing';
import type { IUnitOfWork } from '../../src/application/common/index.js';
import { BirthDate, Email, FullName } from '../../src/domain/common/index.js';
import { User } from '../../src/domain/identity/index.js';
import { UNIT_OF_WORK } from '../../src/infrastructure/database/index.js';
import { PrismaUserRepository } from '../../src/infrastructure/identity/index.js';
import { createDatabaseTestingModule } from '../support/database-testing-module.js';

const newUser = (email: string) =>
  User.create({
    fullName: FullName.create('Maria da Silva'),
    birthDate: BirthDate.create('1990-05-20'),
    email: Email.create(email),
    phone: null,
    passwordHash: '$argon2id$hash',
  });

describe('PrismaUnitOfWork', () => {
  let module: TestingModule;
  let unitOfWork: IUnitOfWork;
  let users: PrismaUserRepository;

  beforeEach(async () => {
    module = await createDatabaseTestingModule([PrismaUserRepository]);
    unitOfWork = module.get(UNIT_OF_WORK);
    users = module.get(PrismaUserRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  it('commits every write when the work succeeds', async () => {
    const first = newUser('a@mail.com');
    const second = newUser('b@mail.com');

    await unitOfWork.run(async () => {
      await users.insert(first);
      await users.insert(second);
    });

    expect(await users.findById(first.id)).not.toBeNull();
    expect(await users.findById(second.id)).not.toBeNull();
  });

  it('rolls every write back when the work throws', async () => {
    const user = newUser('a@mail.com');

    await expect(
      unitOfWork.run(async () => {
        await users.insert(user);
        throw new Error('a later step failed');
      }),
    ).rejects.toThrow('a later step failed');

    expect(await users.findById(user.id)).toBeNull();
  });

  it('rolls back the earlier writes when a later one is rejected', async () => {
    const user = newUser('a@mail.com');

    await expect(
      unitOfWork.run(async () => {
        await users.insert(user);
        await users.insert(newUser('a@mail.com')); // e-mail already taken
      }),
    ).rejects.toThrow();

    expect(await users.findById(user.id)).toBeNull();
  });
});
