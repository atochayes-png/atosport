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

  // Motor de Cronómetro Deportivo Continuo por Timestamp
  period?: number;                   // 0: sin iniciar, 1: 1T, 2: 2T
  startedAt?: number;                // timestamp epoch ms de inicio 1T (Date.now())
  firstHalfDurationSeconds?: number; // segundos acumulados al pitar el medio tiempo
  secondHalfStartedAt?: number;      // timestamp epoch ms de inicio 2T (Date.now())
  isTimerRunning?: boolean;          // indica si el cronómetro está corriendo
  halfDurationMinutes?: number;      // duración reglamentaria del tiempo
}

