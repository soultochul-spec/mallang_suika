import './style.css';
import { fruitAt } from './fruits';
import { drawFruitCharacter } from './fruit-art';
import { SuikaGame } from './game';
import type { GameState } from './types';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('App root is missing');

app.innerHTML = `
  <section class="shell">
    <header class="hero">
      <div>
        <p class="eyebrow">MELON MINGLE</p>
        <h1>말랑 수박 합체</h1>
      </div>
      <button class="sound-button" type="button" aria-label="소리 끄기">🔊</button>
    </header>

    <div class="score-row" aria-live="polite">
      <article class="score-card score-card--main"><span>점수</span><strong data-score>0</strong></article>
      <article class="score-card"><span>최고 기록</span><strong data-best>0</strong></article>
    </div>

    <div class="game-layout">
      <aside class="side-panel">
        <span class="panel-label">다음 과일</span>
        <canvas class="next-canvas" width="120" height="120" aria-label="다음 과일"></canvas>
        <strong data-next-name>체리</strong>
      </aside>

      <div class="board-wrap">
        <canvas class="game-canvas" aria-label="수박 합체 게임판"></canvas>
        <div class="game-over" hidden>
          <div class="game-over__card">
            <span class="game-over__icon">🍉</span>
            <p>과일 탑 완성!</p>
            <h2>게임 오버</h2>
            <dl><div><dt>최종 점수</dt><dd data-final>0</dd></div><div><dt>최고 기록</dt><dd data-final-best>0</dd></div></dl>
            <button class="restart-button" type="button">다시 도전하기</button>
          </div>
        </div>
      </div>

      <aside class="side-panel fruit-guide">
        <span class="panel-label">합체 순서</span>
        <div class="fruit-chain" aria-label="과일 합체 순서"></div>
      </aside>
    </div>

    <footer class="controls">
      <span>↔ 마우스 · 터치 · 방향키로 이동</span>
      <span>● 클릭 · 탭 · 스페이스로 놓기</span>
    </footer>
  </section>
`;

const canvas = required<HTMLCanvasElement>('.game-canvas');
const nextCanvas = required<HTMLCanvasElement>('.next-canvas');
const score = required<HTMLElement>('[data-score]');
const best = required<HTMLElement>('[data-best]');
const nextName = required<HTMLElement>('[data-next-name]');
const overlay = required<HTMLElement>('.game-over');
const soundButton = required<HTMLButtonElement>('.sound-button');
const restartButton = required<HTMLButtonElement>('.restart-button');

let previousScore = 0;
let lastNext = -1;
const game = new SuikaGame(canvas, updateUI);
soundButton.addEventListener('click', game.toggleMute);
restartButton.addEventListener('click', game.restart);
buildFruitChain();

function updateUI(state: GameState): void {
  score.textContent = state.score.toLocaleString('ko-KR');
  best.textContent = state.bestScore.toLocaleString('ko-KR');
  if (state.score > previousScore) {
    score.closest('.score-card')?.classList.remove('score-pop');
    requestAnimationFrame(() => score.closest('.score-card')?.classList.add('score-pop'));
  }
  previousScore = state.score;
  soundButton.textContent = state.muted ? '🔇' : '🔊';
  soundButton.setAttribute('aria-label', state.muted ? '소리 켜기' : '소리 끄기');
  overlay.hidden = !state.isGameOver;
  if (state.isGameOver) {
    required<HTMLElement>('[data-final]').textContent = state.score.toLocaleString('ko-KR');
    required<HTMLElement>('[data-final-best]').textContent = state.bestScore.toLocaleString('ko-KR');
  }
  if (lastNext !== state.nextLevel) {
    drawNextFruit(state.nextLevel);
    nextName.textContent = fruitAt(state.nextLevel).name;
    lastNext = state.nextLevel;
  }
}

function drawNextFruit(level: number): void {
  const ctx = nextCanvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 120, 120);
  drawFruitCharacter(ctx, level, 60, 61, Math.min(42, fruitAt(level).radius * .75));
}

function buildFruitChain(): void {
  const chain = required<HTMLElement>('.fruit-chain');
  for (let level = 0; level < 11; level += 1) {
    const fruit = fruitAt(level);
    const dot = document.createElement('span');
    dot.className = 'fruit-dot';
    dot.style.setProperty('--fruit-color', fruit.color);
    dot.style.setProperty('--fruit-border', fruit.accent);
    dot.style.setProperty('--fruit-size', `${18 + level * 1.5}px`);
    dot.title = fruit.name;
    chain.append(dot);
  }
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}
