import type {
  IRegisterInput,
  IUserOutput,
} from '@personal-dashboard/shared/identity';
import { BirthDate, Email, FullName, PhoneNumber } from '@domain/common';
import { User } from '@domain/identity';
import type { IUseCase } from '@application/common';
import type { IPasswordHasher } from '@application/criptography';
import type { IUserRepository } from './user-repository.interface.js';

/** Registers a new user and returns its public data. */
export class RegisterUseCase implements IUseCase<IRegisterInput, IUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Expects `data` already validated against `registerInputSchema` at the
   * boundary (`ZodValidationPipe`).
   *
   * @throws {DomainError} when the input breaks a domain rule.
   */
  async handle(data: IRegisterInput): Promise<IUserOutput> {
    const user = User.create({
      fullName: FullName.create(data.nomeCompleto),
      birthDate: BirthDate.create(data.dataNascimento),
      email: data.email ? Email.create(data.email) : null,
      phone: data.celular ? PhoneNumber.create(data.celular) : null,
      passwordHash: await this.passwordHasher.hash(data.senha),
    });
    await this.userRepository.insert(user);

    return {
      id: user.id,
      nomeCompleto: user.fullName.value,
      dataNascimento: user.birthDate.value,
      email: user.email?.value,
      celular: user.phone?.value,
    };
  }
}
