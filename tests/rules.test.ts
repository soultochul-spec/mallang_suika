import { describe, expect, it } from 'vitest';
import { DANGER_GRACE_MS, createMergeEvent, shouldGameOver } from '../src/rules';

describe('merge rules', () => {
  it('merges equal levels at their midpoint', () => {
    expect(createMergeEvent({ id: 1, level: 2, x: 10, y: 20 }, { id: 2, level: 2, x: 30, y: 40 })).toMatchObject({
      sourceIds: [1, 2], sourceLevel: 2, nextLevel: 3, x: 20, y: 30, score: 10
    });
  });
  it('does not merge different fruit or duplicate bodies', () => {
    expect(createMergeEvent({ id: 1, level: 1, x: 0, y: 0 }, { id: 2, level: 2, x: 0, y: 0 })).toBeNull();
    expect(createMergeEvent({ id: 1, level: 1, x: 0, y: 0 }, { id: 1, level: 1, x: 0, y: 0 })).toBeNull();
  });
  it('keeps two maximum-level fruit separate', () => {
    expect(createMergeEvent({ id: 1, level: 10, x: 0, y: 0 }, { id: 2, level: 10, x: 0, y: 0 })).toBeNull();
  });
});

describe('danger timer', () => {
  it('expires only after the full grace period', () => {
    expect(shouldGameOver(null, 9999)).toBe(false);
    expect(shouldGameOver(1000, 1000 + DANGER_GRACE_MS - 1)).toBe(false);
    expect(shouldGameOver(1000, 1000 + DANGER_GRACE_MS)).toBe(true);
  });
});
