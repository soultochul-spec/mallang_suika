import { describe, expect, it } from 'vitest';
import { FRUITS, SPAWN_LEVELS, fruitAt, randomSpawnLevel } from '../src/fruits';

describe('fruit definitions', () => {
  it('defines eleven increasingly larger fruit levels', () => {
    expect(FRUITS).toHaveLength(11);
    FRUITS.slice(1).forEach((fruit, index) => {
      expect(fruit.radius).toBeGreaterThan(FRUITS[index]!.radius);
      expect(fruit.score).toBeGreaterThan(FRUITS[index]!.score);
    });
    expect(FRUITS.at(-1)?.nextLevel).toBeNull();
  });

  it('only generates a lower starting fruit', () => {
    expect(randomSpawnLevel(() => 0)).toBe(SPAWN_LEVELS[0]);
    expect(randomSpawnLevel(() => 0.9999)).toBe(SPAWN_LEVELS.at(-1));
    expect(SPAWN_LEVELS).toContain(randomSpawnLevel(() => 0.52));
  });

  it('rejects unknown fruit levels', () => expect(() => fruitAt(99)).toThrow());
});
