import type { User as UserRow } from '@generated/prisma';
import { BirthDate, Email, FullName, PhoneNumber } from '@domain/common';
import { User } from '@domain/identity';

/** `YYYY-MM-DD` of a `DATE` column, which Prisma reads as UTC midnight. */
const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Converts between the `users` table and the `User` entity. */
export const UserMapper = {
  toDomain(row: UserRow): User {
    return User.restore(row.id, {
      fullName: FullName.create(row.fullName),
      birthDate: BirthDate.create(toIsoDate(row.birthDate)),
      email: row.email === null ? null : Email.create(row.email),
      phone: row.phone === null ? null : PhoneNumber.create(row.phone),
      passwordHash: row.passwordHash,
    });
  },

  toPersistence(user: User) {
    return {
      id: user.id,
      fullName: user.fullName.value,
      birthDate: new Date(`${user.birthDate.value}T00:00:00.000Z`),
      email: user.email?.value ?? null,
      phone: user.phone?.value ?? null,
      passwordHash: user.passwordHash,
    };
  },
};
