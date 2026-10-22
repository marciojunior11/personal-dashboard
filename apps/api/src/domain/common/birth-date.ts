import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_AGE = 130;

/**
 * A birth date, stored as an ISO 8601 date (`YYYY-MM-DD`) with no time or
 * time zone, so it never shifts a day when serialized.
 */
export class BirthDate extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** `today` is injectable so validation can be tested deterministically. */
  static create(raw: string, today: Date = new Date()): BirthDate {
    const value = raw.trim();
    const match = ISO_DATE_PATTERN.exec(value);
    if (!match) {
      throw new DomainError(
        'Data de nascimento inválida. Use o formato AAAA-MM-DD.',
      );
    }

    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    // Rejects dates that roll over, such as 2023-02-30.
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new DomainError('Data de nascimento inválida.');
    }

    const birthDate = new BirthDate(value);
    const age = birthDate.ageAt(today);
    if (age < 0) {
      throw new DomainError('A data de nascimento não pode estar no futuro.');
    }
    if (age > MAX_AGE) {
      throw new DomainError('Data de nascimento inválida.');
    }

    return birthDate;
  }

  /** Age in full years on the given date. */
  ageAt(date: Date = new Date()): number {
    const [year, month, day] = this.value.split('-').map(Number);
    const currentMonth = date.getMonth() + 1;
    const hadBirthday =
      currentMonth > month || (currentMonth === month && date.getDate() >= day);

    return date.getFullYear() - year - (hadBirthday ? 0 : 1);
  }
}
