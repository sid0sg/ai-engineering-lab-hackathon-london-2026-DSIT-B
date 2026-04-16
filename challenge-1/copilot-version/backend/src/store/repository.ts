/**
 * In-memory data store – abstracted repository pattern, DynamoDB-swap-ready.
 *
 * Each repository exposes the same CRUD interface that would be implemented
 * by a DynamoDB adapter in production. The interface (IRepository<T>) is
 * separately exported for easy adapter substitution.
 */

export interface IRepository<T extends { id: string }> {
  create(item: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

/** Generic in-memory repository backed by a Map */
export class InMemoryRepository<T extends { id: string }> implements IRepository<T> {
  protected store: Map<string, T> = new Map();

  async create(item: T): Promise<T> {
    this.store.set(item.id, item);
    return item;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  /** Returns number of stored items (useful for tests) */
  size(): number {
    return this.store.size;
  }

  /** Clears all data (used in tests) */
  clear(): void {
    this.store.clear();
  }
}
