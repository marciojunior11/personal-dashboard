import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

const MAX_LENGTH = 150;
/** Letters (accented included), optionally joined by `'` or `-` (e.g. D'Ávila, Ana-Clara). */
const WORD_PATTERN = /^\p{L}+(?:['-]\p{L}+)*$/u;

/** A person's full name: at least a first name and a surname. */
export class FullName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** Trims and collapses inner spaces before validating. */
  static create(raw: string): FullName {
    const value = raw.trim().replace(/\s+/g, ' ');
    const words = value.split(' ');

    if (words.length < 2) {
      throw new DomainError('O nome completo deve conter nome e sobrenome.');
    }
    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `O nome completo deve ter no máximo ${MAX_LENGTH} caracteres.`,
      );
    }
    if (!words.every((word) => WORD_PATTERN.test(word))) {
      throw new DomainError('O nome completo contém caracteres inválidos.');
    }

    return new FullName(value);
  }
}
