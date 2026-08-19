import { Bodies, Body, Composite, Engine, Events, Runner, type IEventCollision, type IEventTimestamped } from 'matter-js';
import { GameAudio } from './audio';
import { drawFruitCharacter } from './fruit-art';
import { FRUITS, fruitAt, randomSpawnLevel } from './fruits';
import { createMergeEvent, DROP_GRACE_MS, shouldGameOver } from './rules';
import { loadBestScore, loadMuted, saveBestScore, saveMuted } from './storage';
import type { GameState, Particle } from './types';

const WIDTH = 420;
const HEIGHT = 640;
const DANGER_Y = 118;
const DROP_Y = 60;
const WALL = 30;
const DROP_DELAY_MS = 520;

type FruitBody = Body & { plugin: { fruitLevel?: number; bornAt?: number; merging?: boolean } };

export class SuikaGame {
  readonly state: GameState;
  private readonly context: CanvasRenderingContext2D;
  private readonly audio: GameAudio;
  private engine = Engine.create({ gravity: { x: 0, y: 1.05 } });
  private runner = Runner.create();
  private fruits = new Set<FruitBody>();
  private particles: Particle[] = [];
  private dangerSince = new Map<number, number>();
  private animationId = 0;
  private lastFrame = performance.now();
  private shake = 0;
  private listeners: Array<() => void> = [];
  private onState: (state: GameState) => void;

  constructor(private canvas: HTMLCanvasElement, onState: (state: GameState) => void) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable');
    this.context = context;
    this.onState = onState;
    this.state = {
      score: 0,
      bestScore: loadBestScore(),
      currentLevel: randomSpawnLevel(),
      nextLevel: randomSpawnLevel(),
      aimX: WIDTH / 2,
      canDrop: true,
      isGameOver: false,
      muted: loadMuted()
    };
    this.audio = new GameAudio(this.state.muted);
    this.canvas.width = WIDTH * devicePixelRatio;
    this.canvas.height = HEIGHT * devicePixelRatio;
    this.context.scale(devicePixelRatio, devicePixelRatio);
    this.createWorld();
    this.bindInput();
    Events.on(this.engine, 'collisionStart', this.handleCollisions);
    Runner.run(this.runner, this.engine);
    this.animationId = requestAnimationFrame(this.frame);
    this.emit();
  }

  restart = (): void => {
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
    this.fruits.clear();
    this.particles = [];
    this.dangerSince.clear();
    Object.assign(this.state, {
      score: 0,
      currentLevel: randomSpawnLevel(),
      nextLevel: randomSpawnLevel(),
      aimX: WIDTH / 2,
      canDrop: true,
      isGameOver: false
    });
    this.createWorld();
    this.emit();
  };

  toggleMute = (): void => {
    this.state.muted = !this.state.muted;
    this.audio.muted = this.state.muted;
    if (!this.state.muted) this.audio.unlock();
    saveMuted(this.state.muted);
    this.emit();
  };

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    Runner.stop(this.runner);
    Events.off(this.engine, 'collisionStart', this.handleCollisions);
    this.listeners.forEach((dispose) => dispose());
  }

  private createWorld(): void {
    const options = { isStatic: true, friction: 0.25, restitution: 0.05, render: { visible: false } };
    Composite.add(this.engine.world, [
      Bodies.rectangle(-WALL / 2, HEIGHT / 2, WALL, HEIGHT * 2, options),
      Bodies.rectangle(WIDTH + WALL / 2, HEIGHT / 2, WALL, HEIGHT * 2, options),
      Bodies.rectangle(WIDTH / 2, HEIGHT + WALL / 2, WIDTH + WALL * 2, WALL, options)
    ]);
  }

  private bindInput(): void {
    const point = (clientX: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const logicalX = ((clientX - rect.left) / rect.width) * WIDTH;
      this.setAim(logicalX);
    };
    const pointerMove = (event: PointerEvent) => point(event.clientX);
    const pointerDown = (event: PointerEvent) => {
      event.preventDefault();
      point(event.clientX);
      this.audio.unlock();
      this.drop();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.audio.unlock();
        this.setAim(this.state.aimX + (event.key === 'ArrowLeft' ? -20 : 20));
      }
      if (event.code === 'Space') {
        event.preventDefault();
        this.audio.unlock();
        this.drop();
      }
    };
    this.canvas.addEventListener('pointermove', pointerMove);
    this.canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('keydown', keyDown);
    this.listeners.push(
      () => this.canvas.removeEventListener('pointermove', pointerMove),
      () => this.canvas.removeEventListener('pointerdown', pointerDown),
      () => window.removeEventListener('keydown', keyDown)
    );
  }

  private setAim(x: number): void {
    const radius = fruitAt(this.state.currentLevel).radius;
    this.state.aimX = Math.max(radius + 4, Math.min(WIDTH - radius - 4, x));
  }

  private drop(): void {
    if (!this.state.canDrop || this.state.isGameOver) return;
    const level = this.state.currentLevel;
    this.addFruit(level, this.state.aimX, DROP_Y, performance.now());
    this.state.canDrop = false;
    this.audio.drop();
    window.setTimeout(() => {
      if (this.state.isGameOver) return;
      this.state.currentLevel = this.state.nextLevel;
      this.state.nextLevel = randomSpawnLevel();
      this.state.canDrop = true;
      this.setAim(this.state.aimX);
      this.emit();
    }, DROP_DELAY_MS);
    this.emit();
  }

  private addFruit(level: number, x: number, y: number, bornAt: number): FruitBody {
    const definition = fruitAt(level);
    const body = Bodies.circle(x, y, definition.radius, {
      restitution: definition.restitution,
      friction: definition.friction,
      frictionAir: 0.0025,
      density: 0.0018 + level * 0.00004,
      slop: 0.03,
      label: `fruit-${level}`,
      render: { visible: false }
    }) as FruitBody;
    body.plugin.fruitLevel = level;
    body.plugin.bornAt = bornAt;
    body.plugin.merging = false;
    this.fruits.add(body);
    Composite.add(this.engine.world, body);
    return body;
  }

  private handleCollisions = (event: IEventCollision<Engine> & IEventTimestamped<Engine>): void => {
    if (this.state.isGameOver) return;
    for (const pair of event.pairs) {
      const a = pair.bodyA as FruitBody;
      const b = pair.bodyB as FruitBody;
      const levelA = a.plugin.fruitLevel;
      const levelB = b.plugin.fruitLevel;
      if (levelA === undefined || levelB === undefined || a.plugin.merging || b.plugin.merging) continue;
      const merge = createMergeEvent(
        { id: a.id, level: levelA, x: a.position.x, y: a.position.y },
        { id: b.id, level: levelB, x: b.position.x, y: b.position.y }
      );
      if (!merge) continue;
      a.plugin.merging = true;
      b.plugin.merging = true;
      this.fruits.delete(a);
      this.fruits.delete(b);
      this.dangerSince.delete(a.id);
      this.dangerSince.delete(b.id);
      Composite.remove(this.engine.world, [a, b]);
      const merged = this.addFruit(merge.nextLevel, merge.x, merge.y, performance.now() - DROP_GRACE_MS);
      Body.setVelocity(merged, {
        x: (a.velocity.x + b.velocity.x) * 0.22,
        y: Math.min(-1.5, (a.velocity.y + b.velocity.y) * 0.12 - 0.8)
      });
      this.state.score += merge.score;
      if (this.state.score > this.state.bestScore) {
        this.state.bestScore = this.state.score;
        saveBestScore(this.state.bestScore);
      }
      this.addParticles(merge.x, merge.y, fruitAt(merge.nextLevel).color);
      this.shake = Math.min(8, 2 + merge.nextLevel * 0.45);
      this.audio.merge(merge.nextLevel);
      this.emit();
    }
  };

  private addParticles(x: number, y: number, color: string): void {
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12 + Math.random() * 0.3;
      const speed = 1.4 + Math.random() * 2.6;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, radius: 2 + Math.random() * 3 });
    }
  }

  private frame = (now: number): void => {
    const delta = Math.min(32, now - this.lastFrame);
    this.lastFrame = now;
    if (!this.state.isGameOver) this.checkDanger(now);
    this.updateParticles(delta);
    this.render(now);
    this.animationId = requestAnimationFrame(this.frame);
  };

  private checkDanger(now: number): void {
    let expired = false;
    for (const fruit of this.fruits) {
      const radius = fruitAt(fruit.plugin.fruitLevel ?? 0).radius;
      const bornAt = fruit.plugin.bornAt ?? 0;
      const isSettled = now - bornAt > DROP_GRACE_MS && fruit.speed < 1.25;
      if (isSettled && fruit.position.y - radius < DANGER_Y) {
        const since = this.dangerSince.get(fruit.id) ?? now;
        this.dangerSince.set(fruit.id, since);
        if (shouldGameOver(since, now)) expired = true;
      } else {
        this.dangerSince.delete(fruit.id);
      }
    }
    if (expired) this.gameOver();
  }

  private gameOver(): void {
    this.state.isGameOver = true;
    this.state.canDrop = false;
    this.audio.gameOver();
    this.shake = 10;
    this.emit();
  }

  private updateParticles(delta: number): void {
    const scale = delta / 16.67;
    for (const particle of this.particles) {
      particle.x += particle.vx * scale;
      particle.y += particle.vy * scale;
      particle.vy += 0.08 * scale;
      particle.life -= 0.025 * scale;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.shake *= 0.87;
  }

  private render(now: number): void {
    const ctx = this.context;
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (this.shake > 0.15) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, '#fffaf0');
    sky.addColorStop(1, '#ffe8d7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.drawDangerLine(now);
    this.drawAimFruit();
    for (const fruit of this.fruits) this.drawFruit(fruit.position.x, fruit.position.y, fruit.plugin.fruitLevel ?? 0, fruit.angle, 1);
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.drawContainer();
    ctx.restore();
  }

  private drawDangerLine(now: number): void {
    const ctx = this.context;
    const dangerProgress = Math.max(0, ...Array.from(this.dangerSince.values(), (since) => (now - since) / 1100));
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = dangerProgress > 0 ? '#e96969' : '#e7b69c';
    ctx.globalAlpha = 0.65 + Math.min(0.35, dangerProgress * 0.35);
    ctx.beginPath();
    ctx.moveTo(12, DANGER_Y);
    ctx.lineTo(WIDTH - 12, DANGER_Y);
    ctx.stroke();
    ctx.restore();
  }

  private drawAimFruit(): void {
    if (!this.state.canDrop || this.state.isGameOver) return;
    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#9f796a';
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.moveTo(this.state.aimX, 0);
    ctx.lineTo(this.state.aimX, DROP_Y);
    ctx.stroke();
    this.drawFruit(this.state.aimX, DROP_Y, this.state.currentLevel, 0, 0.9);
    ctx.restore();
  }

  private drawContainer(): void {
    const ctx = this.context;
    ctx.strokeStyle = '#8e695d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(4, HEIGHT - 4);
    ctx.lineTo(WIDTH - 4, HEIGHT - 4);
    ctx.lineTo(WIDTH - 4, 10);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 16);
    ctx.lineTo(10, HEIGHT - 12);
    ctx.stroke();
  }

  private drawFruit(x: number, y: number, level: number, angle: number, scale: number): void {
    const fruit = fruitAt(level);
    drawFruitCharacter(this.context, level, x, y, fruit.radius * scale, angle, scale < 1 ? .76 : 1);
  }

  private emit(): void { this.onState({ ...this.state }); }
}

export { FRUITS };
