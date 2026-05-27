import type { AppState } from '../types';
import { SCHEMA_VERSION } from '../constants/storage';
import { defaultState } from './defaultState';

export function migrateState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') {
    return defaultState();
  }

  const candidate = raw as Partial<AppState>;

  if (candidate.schemaVersion !== SCHEMA_VERSION) {
    return defaultState();
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    players: Array.isArray(candidate.players) ? candidate.players : [],
    matches: Array.isArray(candidate.matches) ? candidate.matches : [],
    activeMatchId:
      typeof candidate.activeMatchId === 'string'
        ? candidate.activeMatchId
        : null,
  };
}
