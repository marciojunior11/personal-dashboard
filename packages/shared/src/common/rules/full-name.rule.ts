export const FULL_NAME_MAX_LENGTH = 150;
/** Letters (accented included), optionally joined by `'` or `-` (e.g. D'Ávila, Ana-Clara). */
const WORD_PATTERN = /^\p{L}+(?:['-]\p{L}+)*$/u;

/** Trims and collapses inner spaces. */
export function normalizeFullName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Why `value` is not a person's full name (a first name and a surname), or
 * `null` if it is. Expects a value from `normalizeFullName`.
 */
export function checkFullName(value: string): string | null {
  const words = value.split(" ");

  if (words.length < 2) {
    return "O nome completo deve conter nome e sobrenome.";
  }
  if (value.length > FULL_NAME_MAX_LENGTH) {
    return `O nome completo deve ter no máximo ${FULL_NAME_MAX_LENGTH} caracteres.`;
  }
  if (!words.every((word) => WORD_PATTERN.test(word))) {
    return "O nome completo contém caracteres inválidos.";
  }
  return null;
}
