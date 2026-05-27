export type PlayerId = string;
export type MatchId = string;

export interface Player {
  id: PlayerId;
  name: string;
  createdAt: string;
}

export interface RoundScore {
  playerId: PlayerId;
  score: number | null;
}

export interface Round {
  index: number;
  scores: RoundScore[];
}

export type MatchStatus = 'active' | 'completed';

export interface PlayerTitle {
  playerId: PlayerId;
  key: string;
  /** Primary line (e.g. funny round nickname). */
  label: string;
  /** Secondary line (e.g. score-gap description); round titles only. */
  subtitle?: string;
}

/** Funny + descriptive lines shown beside a player name during a round. */
export interface RoundTitleDisplay {
  funny: string;
  descriptive: string;
}

export interface Match {
  id: MatchId;
  name: string;
  playerIds: PlayerId[];
  roundCount: number;
  rounds: Round[];
  status: MatchStatus;
  createdAt: string;
  completedAt?: string;
  titles?: PlayerTitle[];
}

import type { Tournament, TournamentId } from './tournament';

export type {
  DuelId,
  DuelStatus,
  Tournament,
  TournamentBracketRound,
  TournamentDuel,
  TournamentId,
  TournamentStatus,
} from './tournament';

export interface AppState {
  schemaVersion: 2;
  players: Player[];
  matches: Match[];
  tournaments: Tournament[];
  activeMatchId: MatchId | null;
  activeTournamentId: TournamentId | null;
}
