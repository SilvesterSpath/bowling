import type { PlayerId, Round } from './index';

export type TournamentId = string;
export type DuelId = string;
export type TournamentStatus = 'active' | 'completed';
export type DuelStatus = 'pending' | 'active' | 'completed';

export interface TournamentDuel {
  id: DuelId;
  playerAId: PlayerId;
  playerBId: PlayerId;
  rounds: Round[];
  winnerId: PlayerId | null;
  status: DuelStatus;
  tieBreakRounds?: Round[];
}

export interface TournamentBracketRound {
  index: number;
  label: string;
  duels: TournamentDuel[];
  byePlayerId?: PlayerId;
}

export interface Tournament {
  id: TournamentId;
  name: string;
  playerIds: PlayerId[];
  roundsPerDuel: number;
  status: TournamentStatus;
  currentRoundIndex: number;
  activeDuelId: DuelId | null;
  bracketRounds: TournamentBracketRound[];
  championId?: PlayerId;
  createdAt: string;
  completedAt?: string;
}
