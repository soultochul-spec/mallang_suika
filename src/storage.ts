const BEST_KEY = 'melon-mingle-best';
const MUTED_KEY = 'melon-mingle-muted';

export function loadBestScore(storage: Pick<Storage, 'getItem'> | null = safeStorage()): number {
  try {
    const value = Number(storage?.getItem(BEST_KEY));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  try { storage?.setItem(BEST_KEY, String(Math.max(0, Math.floor(score)))); } catch { /* memory state remains */ }
}

export function loadMuted(storage: Pick<Storage, 'getItem'> | null = safeStorage()): boolean {
  try { return storage?.getItem(MUTED_KEY) === 'true'; } catch { return false; }
}

export function saveMuted(muted: boolean, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  try { storage?.setItem(MUTED_KEY, String(muted)); } catch { /* memory state remains */ }
}

function safeStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
