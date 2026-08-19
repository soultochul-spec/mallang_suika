export interface FruitDefinition {
  level: number;
  name: string;
  radius: number;
  color: string;
  accent: string;
  score: number;
  restitution: number;
  friction: number;
  face: 'happy' | 'sleepy' | 'cheeky';
  nextLevel: number | null;
}

export interface GameState {
  score: number;
  bestScore: number;
  currentLevel: number;
  nextLevel: number;
  aimX: number;
  canDrop: boolean;
  isGameOver: boolean;
  muted: boolean;
}

export interface MergeEvent {
  sourceIds: [number, number];
  sourceLevel: number;
  nextLevel: number;
  x: number;
  y: number;
  score: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  radius: number;
}
