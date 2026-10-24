/**
 * Base class for value objects: immutable, identified only by their value.
 * Subclasses validate the raw input in a static `create` factory.
 */
export abstract class ValueObject<T> {
  protected constructor(public readonly value: T) {}

  /**
   * Two value objects are equal when they share type and value. Composite
   * values (objects, arrays, nested value objects) are compared by content.
   */
  equals(other: ValueObject<T> | null | undefined): boolean {
    return (
      other instanceof this.constructor &&
      ValueObject.sameValue(this.value, other.value)
    );
  }

  /** Serializes as the raw value (e.g. `"john@mail.com"`). */
  toJSON(): T {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  private static sameValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) {
      return true;
    }
    if (a instanceof ValueObject && b instanceof ValueObject) {
      return a.equals(b);
    }
    if (
      typeof a !== 'object' ||
      typeof b !== 'object' ||
      a === null ||
      b === null ||
      Array.isArray(a) !== Array.isArray(b)
    ) {
      return false;
    }

    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every(
        (key) =>
          Object.hasOwn(b, key) &&
          ValueObject.sameValue(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key],
          ),
      )
    );
  }
}
