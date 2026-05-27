import type { AppState, Match, Player } from '../types';
import {
  SCHEMA_VERSION,
  SCHEMA_VERSION_V1,
} from '../constants/storage';
import { defaultState } from './defaultState';

interface AppStateV1 {
  schemaVersion: typeof SCHEMA_VERSION_V1;
  players: Player[];
  matches: Match[];
  activeMatchId: string | null;
}

function migrateV1ToV2(candidate: AppStateV1): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    players: Array.isArray(candidate.players) ? candidate.players : [],
    matches: Array.isArray(candidate.matches) ? candidate.matches : [],
    tournaments: [],
    activeMatchId:
      typeof candidate.activeMatchId === 'string'
        ? candidate.activeMatchId
        : null,
    activeTournamentId: null,
  };
}

function migrateV2(candidate: Partial<AppState>): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    players: Array.isArray(candidate.players) ? candidate.players : [],
    matches: Array.isArray(candidate.matches) ? candidate.matches : [],
    tournaments: Array.isArray(candidate.tournaments)
      ? candidate.tournaments
      : [],
    activeMatchId:
      typeof candidate.activeMatchId === 'string'
        ? candidate.activeMatchId
        : null,
    activeTournamentId:
      typeof candidate.activeTournamentId === 'string'
        ? candidate.activeTournamentId
        : null,
  };
}

export function migrateState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') {
    return defaultState();
  }

  const candidate = raw as { schemaVersion?: number };

  if (candidate.schemaVersion === SCHEMA_VERSION_V1) {
    return migrateV1ToV2(raw as AppStateV1);
  }

  if (candidate.schemaVersion === SCHEMA_VERSION) {
    return migrateV2(raw as Partial<AppState>);
  }

  return defaultState();
}
