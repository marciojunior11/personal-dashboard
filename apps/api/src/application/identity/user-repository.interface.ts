import type { User } from '../../domain/identity/user.js';

/** Persistence contract for users, implemented in the infrastructure layer. */
export interface IUserRepository {
  /** Persists a new user. */
  insert(user: User): Promise<void>;

  /** Returns the user with the given id, or `null` if none exists. */
  findById(id: string): Promise<User | null>;
}
