import { DomainError } from '@personal-dashboard/shared/errors';
import {
  type BirthDate,
  type Email,
  Entity,
  type FullName,
  type PhoneNumber,
} from '@domain/common';

export interface IUserProps {
  fullName: FullName;
  birthDate: BirthDate;
  email: Email | null;
  phone: PhoneNumber | null;
  /** Already hashed by an `IPasswordHasher`; the domain never sees the plain password. */
  passwordHash: string;
}

/**
 * A system user. Invariant: has at least an e-mail or a phone, which are the
 * login identifiers.
 */
export class User extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: IUserProps,
  ) {
    super(id);

    if (props.email === null && props.phone === null) {
      throw new DomainError(
        'O usuário deve ter ao menos um e-mail ou celular.',
      );
    }
    if (props.passwordHash.length === 0) {
      throw new DomainError('O usuário deve ter uma senha.');
    }
  }

  /** Creates a new user, generating its id. */
  static create(props: IUserProps): User {
    return new User(crypto.randomUUID(), props);
  }

  /** Rebuilds an existing user, e.g. when loading it from the database. */
  static restore(id: string, props: IUserProps): User {
    return new User(id, props);
  }

  get fullName(): FullName {
    return this.props.fullName;
  }

  get birthDate(): BirthDate {
    return this.props.birthDate;
  }

  get email(): Email | null {
    return this.props.email;
  }

  get phone(): PhoneNumber | null {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }
}
