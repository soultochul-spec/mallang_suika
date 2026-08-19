export class GameAudio {
  private context: AudioContext | null = null;
  constructor(public muted: boolean) {}

  unlock(): void {
    if (this.muted) return;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
  }

  drop(): void { this.tone(180, 0.07, 'sine', 0.035); }
  merge(level: number): void { this.tone(330 + level * 34, 0.13, 'triangle', 0.06); }
  gameOver(): void {
    this.tone(220, 0.24, 'sine', 0.05);
    window.setTimeout(() => this.tone(145, 0.32, 'sine', 0.05), 140);
  }

  private tone(frequency: number, duration: number, type: OscillatorType, volume: number): void {
    if (this.muted || !this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}
