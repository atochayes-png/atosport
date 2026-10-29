export type MatchStatus = 'Programado' | 'En Vivo' | 'Finalizado' | 'Pospuesto';
export type MatchStage = 'Fase Regular' | 'Cuartos de Final' | 'Semifinal' | 'Gran Final' | 'Liguilla';

export interface Matchday {
  id: string;
  tournamentId: string;
  number: number;
  name: string;
  createdAt: string;
}

export interface MatchAttendance {
  matchId: string;
  tournamentId: string;
  homePresentPlayerIds: string[];
  awayPresentPlayerIds: string[];
  benchPhotoHome?: string; // base64 / DataURL
  benchPhotoAway?: string; // base64 / DataURL
  confirmedAt?: string;    // ISO timestamp
  confirmedBy?: string;    // Usuario que validó la lista
  confirmedByUserId?: string;
  isLocked: boolean;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchdayNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:mm
  field: string; // Cancha / Campo
  status: MatchStatus;
  stage?: MatchStage;
  isPlayoffs?: boolean;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  penaltyWinnerId?: string;
  liveMinute?: string;
  liveStage?: '1T' | 'Medio Tiempo' | '2T' | 'Tiempo Extra';
  createdAt: string;
}

