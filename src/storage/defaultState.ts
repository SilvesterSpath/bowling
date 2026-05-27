import type { AppState } from '../types';
import { SCHEMA_VERSION } from '../constants/storage';

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    players: [],
    matches: [],
    tournaments: [],
    activeMatchId: null,
    activeTournamentId: null,
  };
}
