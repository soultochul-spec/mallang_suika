import { describe, expect, it } from 'vitest';
import { loadBestScore, loadMuted, saveBestScore, saveMuted } from '../src/storage';

describe('storage', () => {
  it('loads valid values and recovers from corrupt data', () => {
    expect(loadBestScore({ getItem: () => '42' })).toBe(42);
    expect(loadBestScore({ getItem: () => 'nope' })).toBe(0);
    expect(loadMuted({ getItem: () => 'true' })).toBe(true);
  });
  it('writes normalized preferences', () => {
    const values = new Map<string, string>();
    const storage = { setItem: (key: string, value: string) => values.set(key, value) };
    saveBestScore(17.8, storage);
    saveMuted(true, storage);
    expect([...values.values()]).toEqual(['17', 'true']);
  });
  it('survives blocked storage access', () => {
    expect(loadBestScore({ getItem: () => { throw new Error('blocked'); } })).toBe(0);
    expect(() => saveBestScore(3, { setItem: () => { throw new Error('blocked'); } })).not.toThrow();
  });
});
