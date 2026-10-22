/**
 * Base class for value objects: immutable, identified only by their value.
 * Subclasses validate the raw input in a static `create` factory.
 */
export abstract class ValueObject<T> {
  protected constructor(public readonly value: T) {}

  /** Two value objects are equal when they share type and value. */
  equals(other: ValueObject<T> | null | undefined): boolean {
    return other instanceof this.constructor && other.value === this.value;
  }

  /** Serializes as the raw value (e.g. `"john@mail.com"`). */
  toJSON(): T {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
