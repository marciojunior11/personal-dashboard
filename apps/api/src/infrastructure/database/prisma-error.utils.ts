import { Prisma } from '@generated/prisma';

/** What the Postgres driver adapter reports about the violated constraint. */
interface IDriverAdapterConstraint {
  fields?: unknown;
  index?: unknown;
}

/**
 * Whether `error` is Postgres rejecting a duplicate on a unique constraint,
 * and, when known, on which columns: the safety net under concurrent writes
 * that a lookup before inserting cannot catch. `null` means another error.
 */
export function uniqueViolationFields(error: unknown): string[] | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return null;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === 'string') return [target];

  // The driver adapter reports the constraint instead: its fields when it
  // knows them, or just its name.
  const cause = (
    error.meta?.driverAdapterError as
      | {
          cause?: { constraint?: IDriverAdapterConstraint; table?: unknown };
        }
      | undefined
  )?.cause;
  const constraint = cause?.constraint;
  if (Array.isArray(constraint?.fields)) return constraint.fields.map(String);
  if (
    typeof constraint?.index === 'string' &&
    typeof cause?.table === 'string'
  ) {
    return columnsOfConstraintName(constraint.index, cause.table);
  }
  return [];
}

/**
 * The columns in a constraint named the Postgres way, `<table>_<columns>_key`
 * (`users_email_key` → `email`). A multi-column name comes back joined
 * (`user_id_organization_id`), since underscores also appear inside names.
 */
function columnsOfConstraintName(name: string, table: string): string[] {
  const prefix = `${table}_`;
  const suffix = '_key';
  if (!name.startsWith(prefix) || !name.endsWith(suffix)) return [];
  return [name.slice(prefix.length, -suffix.length)];
}
