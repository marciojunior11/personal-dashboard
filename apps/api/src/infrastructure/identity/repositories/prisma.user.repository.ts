import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ConflictError } from '@personal-dashboard/shared/errors';
import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import type { IUserRepository } from '@application/identity';
import type { User } from '@domain/identity';
import {
  uniqueViolationFields,
  type PrismaTransactionHost,
} from '@infrastructure/database';
import { UserMapper } from '@infrastructure/identity/mappers';

/** `IUserRepository` on the `users` table; joins the current unit of work. */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  /**
   * @throws {ConflictError} when the e-mail, the phone or the id is taken:
   * the unique constraints are the safety net under concurrent sign-ups.
   */
  async insert(user: User): Promise<void> {
    try {
      await this.txHost.tx.user.create({
        data: UserMapper.toPersistence(user),
      });
    } catch (error) {
      const fields = uniqueViolationFields(error);
      if (fields === null) throw error;
      if (fields.includes('email')) {
        throw new ConflictError(IdentityErrorCodes.USER_EMAIL_TAKEN);
      }
      if (fields.includes('phone')) {
        throw new ConflictError(IdentityErrorCodes.USER_PHONE_TAKEN);
      }
      throw new ConflictError(IdentityErrorCodes.USER_ID_TAKEN, {
        id: user.id,
      });
    }
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.txHost.tx.user.findUnique({ where: { id } });
    return row === null ? null : UserMapper.toDomain(row);
  }
}
