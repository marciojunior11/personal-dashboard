/** Base class for entities: identified by their `id`, not by their attributes. */
export abstract class Entity<TId = string> {
  protected constructor(public readonly id: TId) {}

  /** Two entities are equal when they share type and id. */
  equals(other: Entity<TId> | null | undefined): boolean {
    return other instanceof this.constructor && other.id === this.id;
  }
}
