/**
 * Unit tests: in-memory repository
 */

import { InMemoryRepository } from '../store/repository';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

describe('InMemoryRepository', () => {
  let repo: InMemoryRepository<TestItem>;

  beforeEach(() => {
    repo = new InMemoryRepository<TestItem>();
  });

  describe('create', () => {
    it('stores and returns the item', async () => {
      const item: TestItem = { id: '1', name: 'Test', value: 42 };
      const stored = await repo.create(item);
      expect(stored).toEqual(item);
    });

    it('increases the store size', async () => {
      await repo.create({ id: '1', name: 'A', value: 1 });
      await repo.create({ id: '2', name: 'B', value: 2 });
      expect(repo.size()).toBe(2);
    });
  });

  describe('findById', () => {
    it('returns the item for a known id', async () => {
      const item: TestItem = { id: 'abc', name: 'Foo', value: 99 };
      await repo.create(item);
      const found = await repo.findById('abc');
      expect(found).toEqual(item);
    });

    it('returns null for unknown id', async () => {
      const found = await repo.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all stored items', async () => {
      await repo.create({ id: '1', name: 'A', value: 1 });
      await repo.create({ id: '2', name: 'B', value: 2 });
      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });

    it('returns empty array when store is empty', async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('merges patch into existing item', async () => {
      await repo.create({ id: '1', name: 'Original', value: 1 });
      const updated = await repo.update('1', { name: 'Updated' });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated');
      expect(updated!.value).toBe(1); // unchanged
    });

    it('returns null for non-existent id', async () => {
      const updated = await repo.update('ghost', { name: 'Ghost' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('removes the item and returns true', async () => {
      await repo.create({ id: '1', name: 'ToDelete', value: 0 });
      const result = await repo.delete('1');
      expect(result).toBe(true);
      expect(await repo.findById('1')).toBeNull();
    });

    it('returns false for non-existent id', async () => {
      const result = await repo.delete('ghost');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('empties the store', async () => {
      await repo.create({ id: '1', name: 'A', value: 1 });
      repo.clear();
      expect(repo.size()).toBe(0);
    });
  });
});
