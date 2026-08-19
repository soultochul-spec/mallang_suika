import type { FruitDefinition } from './types';

export const FRUITS: readonly FruitDefinition[] = [
  { level: 0, name: '포도알', radius: 16, color: '#a98bea', accent: '#7b61c8', score: 1, restitution: 0.28, friction: 0.035, face: 'happy', nextLevel: 1 },
  { level: 1, name: '체리', radius: 21, color: '#ff6f81', accent: '#e54d62', score: 3, restitution: 0.25, friction: 0.04, face: 'cheeky', nextLevel: 2 },
  { level: 2, name: '딸기', radius: 27, color: '#ff8295', accent: '#e85b73', score: 6, restitution: 0.23, friction: 0.045, face: 'happy', nextLevel: 3 },
  { level: 3, name: '귤', radius: 34, color: '#ffac5f', accent: '#ef883e', score: 10, restitution: 0.21, friction: 0.05, face: 'sleepy', nextLevel: 4 },
  { level: 4, name: '레몬', radius: 42, color: '#f8da65', accent: '#dcb73c', score: 15, restitution: 0.2, friction: 0.055, face: 'happy', nextLevel: 5 },
  { level: 5, name: '사과', radius: 51, color: '#f47b6d', accent: '#d9564c', score: 21, restitution: 0.18, friction: 0.06, face: 'cheeky', nextLevel: 6 },
  { level: 6, name: '배', radius: 60, color: '#d7d776', accent: '#afb352', score: 28, restitution: 0.16, friction: 0.065, face: 'sleepy', nextLevel: 7 },
  { level: 7, name: '복숭아', radius: 70, color: '#f6aaa5', accent: '#dd817d', score: 36, restitution: 0.14, friction: 0.07, face: 'happy', nextLevel: 8 },
  { level: 8, name: '파인애플', radius: 81, color: '#f2ca61', accent: '#c99b36', score: 45, restitution: 0.12, friction: 0.075, face: 'cheeky', nextLevel: 9 },
  { level: 9, name: '멜론', radius: 93, color: '#a9d98f', accent: '#72ae65', score: 55, restitution: 0.1, friction: 0.08, face: 'sleepy', nextLevel: 10 },
  { level: 10, name: '수박', radius: 108, color: '#6fbe75', accent: '#358a59', score: 66, restitution: 0.08, friction: 0.085, face: 'happy', nextLevel: null }
] as const;

export const SPAWN_LEVELS = [0, 1, 2, 3, 4] as const;

export function randomSpawnLevel(random = Math.random): number {
  return SPAWN_LEVELS[Math.floor(random() * SPAWN_LEVELS.length)] ?? 0;
}

export function fruitAt(level: number): FruitDefinition {
  const fruit = FRUITS[level];
  if (!fruit) throw new Error(`Unknown fruit level: ${level}`);
  return fruit;
}
