import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import { ConflictError } from '@personal-dashboard/shared/errors';
import type { IUserRepository } from '@application/identity';
import type { User } from '@domain/identity';

/**
 * In-memory `IUserRepository`, for development and tests. Records live in a
 * list and are lost when the process stops.
 */
export class MockUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  async insert(user: User): Promise<void> {
    if (this.users.some((existing) => existing.equals(user))) {
      throw new ConflictError(IdentityErrorCodes.USER_ID_TAKEN, {
        id: user.id,
      });
    }

    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
