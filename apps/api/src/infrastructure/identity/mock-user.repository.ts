import { ConflictError } from '@personal-dashboard/shared/errors';
import type { IUserRepository } from '../../application/identity/user-repository.interface.js';
import type { User } from '../../domain/identity/user.js';

/**
 * In-memory `IUserRepository`, for development and tests. Records live in a
 * list and are lost when the process stops.
 */
export class MockUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  async insert(user: User): Promise<void> {
    if (this.users.some((existing) => existing.equals(user))) {
      throw new ConflictError(`Já existe um usuário com o id ${user.id}.`);
    }

    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
