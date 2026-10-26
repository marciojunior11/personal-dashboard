import type {
  IRegisterInput,
  IUserOutput,
} from '@personal-dashboard/shared/identity';
import { BirthDate, Email, FullName, PhoneNumber } from '@domain/common';
import { PlanCode, Subscription } from '@domain/billing';
import {
  Organization,
  OrganizationMember,
  OrganizationMemberRole,
  OrganizationName,
  OrganizationType,
  User,
} from '@domain/identity';
import type {
  IPlanRepository,
  ISubscriptionRepository,
} from '@application/billing';
import { MisconfigurationError, type IUseCase } from '@application/common';
import type { IPasswordHasher } from '@application/criptography';
import type {
  IOrganizationMemberRepository,
  IOrganizationRepository,
  IUserRepository,
} from '@application/identity/repositories';

/**
 * Registers a self-employed professional: creates the user, an INDIVIDUAL
 * organization named after them, their OWNER membership and a LIMITED
 * subscription, then returns the user's public data.
 */
export class RegisterUseCase implements IUseCase<IRegisterInput, IUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly memberRepository: IOrganizationMemberRepository,
    private readonly planRepository: IPlanRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Expects `data` already validated against `registerInputSchema` at the
   * boundary (`ZodValidationPipe`).
   *
   * The schema applies the same format rules as the value objects, so their
   * guards below should never fire here; they keep the use case correct on
   * its own, for any caller that skips the schema.
   *
   * @throws {DomainError} when the input breaks a domain rule.
   * @throws {MisconfigurationError} when the catalog lacks the LIMITED plan.
   * `BillingModule` refuses to start in that case, so this guard should never
   * fire either.
   */
  async handle(data: IRegisterInput): Promise<IUserOutput> {
    const fullName = FullName.create(data.nomeCompleto);
    const birthDate = BirthDate.create(data.dataNascimento);
    const email = data.email ? Email.create(data.email) : null;
    const phone = data.celular ? PhoneNumber.create(data.celular) : null;

    const plan = await this.planRepository.findByCode(PlanCode.LIMITED);
    if (plan === null) {
      throw new MisconfigurationError(
        'Plano LIMITED não encontrado no catálogo: é o plano de toda organização nova, então o cadastro não pode continuar.',
      );
    }

    const user = User.create({
      fullName,
      birthDate,
      email,
      phone,
      passwordHash: await this.passwordHasher.hash(data.senha),
    });
    const organization = Organization.create({
      name: OrganizationName.create(fullName.value),
      type: OrganizationType.INDIVIDUAL,
    });
    const owner = OrganizationMember.create({
      userId: user.id,
      organizationId: organization.id,
      role: OrganizationMemberRole.OWNER,
    });
    const subscription = Subscription.create(organization.id, plan);

    // Everything is built and validated before the first write. Without a
    // transaction yet, a failed insert can still leave earlier ones behind;
    // the user goes first because it is the one expected to conflict.
    await this.userRepository.insert(user);
    await this.organizationRepository.insert(organization);
    await this.memberRepository.insert(owner);
    await this.subscriptionRepository.insert(subscription);

    return {
      id: user.id,
      nomeCompleto: user.fullName.value,
      dataNascimento: user.birthDate.value,
      email: user.email?.value,
      celular: user.phone?.value,
    };
  }
}
