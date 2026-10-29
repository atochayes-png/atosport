export type MatchStatus = 'Programado' | 'En Vivo' | 'Finalizado' | 'Pospuesto';

export interface Matchday {
  id: string;
  tournamentId: string;
  number: number;
  name: string;
  createdAt: string;
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
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  penaltyWinnerId?: string;
  createdAt: string;
}
