import {
  DomainError,
  ValidationError,
  type IErrorIssue,
} from '@personal-dashboard/shared/errors';

/** One factory per input field, each building that field's value. */
type FieldFactories = Record<string, () => unknown>;

/** What each factory returned, under its field. */
type FieldValues<TFactories extends FieldFactories> = {
  [TField in keyof TFactories]: ReturnType<TFactories[TField]>;
};

/**
 * Builds each field's value through the domain, filing broken rules under
 * their field as a `ValidationError`.
 *
 * Value objects only know their rule, not which input field they came from;
 * the keys of `factories` supply that. Every factory runs, even after one
 * fails, so the client gets all its errors at once. A factory should depend
 * only on its own field: rules spanning several fields belong to the entity.
 *
 * @example
 * const { nomeCompleto, email } = validateFields({
 *   nomeCompleto: () => FullName.create(data.nomeCompleto),
 *   email: () => (data.email ? Email.create(data.email) : null),
 * });
 *
 * @throws {ValidationError} when any factory throws a `DomainError`, with
 * its message under that factory's field.
 * @throws whatever else a factory throws, unchanged: only a broken domain
 * rule is the client's fault.
 */
export function validateFields<TFactories extends FieldFactories>(
  factories: TFactories,
): FieldValues<TFactories> {
  const values: Partial<Record<keyof TFactories, unknown>> = {};
  const issues: IErrorIssue[] = [];

  for (const field of Object.keys(factories) as Extract<
    keyof TFactories,
    string
  >[]) {
    try {
      values[field] = factories[field]();
    } catch (error) {
      if (!(error instanceof DomainError)) throw error;
      issues.push({ field, code: error.code, message: error.message });
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  // Every factory ran without throwing, so every field holds its value.
  return values as FieldValues<TFactories>;
}
