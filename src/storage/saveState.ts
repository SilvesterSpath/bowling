import { STORAGE_KEY } from '../constants/storage';
import type { AppState } from '../types';

export type SaveError = 'quota' | 'unknown';

export type SaveResult =
  | { ok: true }
  | { ok: false; error: SaveError };

export function saveState(state: AppState): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.code === 22)
    ) {
      return { ok: false, error: 'quota' };
    }
    return { ok: false, error: 'unknown' };
  }
}
