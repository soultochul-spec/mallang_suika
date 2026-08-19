import { fruitAt } from './fruits';
import type { MergeEvent } from './types';

export const DANGER_GRACE_MS = 1100;
export const DROP_GRACE_MS = 850;

export function createMergeEvent(
  a: { id: number; level: number; x: number; y: number },
  b: { id: number; level: number; x: number; y: number }
): MergeEvent | null {
  if (a.id === b.id || a.level !== b.level) return null;
  const source = fruitAt(a.level);
  if (source.nextLevel === null) return null;
  return {
    sourceIds: [a.id, b.id],
    sourceLevel: a.level,
    nextLevel: source.nextLevel,
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: fruitAt(source.nextLevel).score
  };
}

export function shouldGameOver(overSince: number | null, now: number): boolean {
  return overSince !== null && now - overSince >= DANGER_GRACE_MS;
}
