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
  label: string;
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

export interface AppState {
  schemaVersion: 1;
  players: Player[];
  matches: Match[];
  activeMatchId: MatchId | null;
}
