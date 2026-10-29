export type SportType = 
  | 'Fútbol 11' 
  | 'Fútbol 7' 
  | 'Fútbol Rápido' 
  | 'Futsal' 
  | 'Básquetbol' 
  | 'Voleibol';

export type TournamentStatus = 'En Inscripciones' | 'Activo' | 'Próximo' | 'Finalizado';

export type TieBreakerCriterion = 'Diferencia de Goles' | 'Goles a Favor' | 'Enfrentamiento Directo';

export interface TournamentRules {
  pointsWin: number;           // Regular win (default: 3)
  pointsDraw: number;          // Regular draw without penalties (default: 1)
  pointsLoss: number;          // Regular loss (default: 0)
  penaltiesEnabled: boolean;   // Desempate por penales en caso de empate
  pointsPenaltiesWin: number;  // Puntos ganador de penales (default: 2)
  pointsPenaltiesLoss: number; // Puntos perdedor de penales (default: 1)
  tieBreakerPriority: TieBreakerCriterion; // Criterio de desempate en tabla
  minMatchesForPlayoffs: number; // Mínimo de partidos en fase regular para liguilla (default: 6)
  blockIneligiblePlayoffs: boolean; // Bloqueo automático de alineación indebida en Liguilla (default: true)
  halfDurationMinutes: number; // Duración de cada tiempo reglamentario en minutos (default: 35)
  totalPeriods: number;        // Número de tiempos reglamentarios (default: 2)
}

export const DEFAULT_TOURNAMENT_RULES: TournamentRules = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  penaltiesEnabled: false,
  pointsPenaltiesWin: 2,
  pointsPenaltiesLoss: 1,
  tieBreakerPriority: 'Diferencia de Goles',
  minMatchesForPlayoffs: 6,
  blockIneligiblePlayoffs: true,
  halfDurationMinutes: 35,
  totalPeriods: 2,
};

export interface InitialTeamStats {
  teamId: string;
  played: number; // JJ
  won: number;    // JG
  drawn: number;  // JE
  lost: number;   // JP
  penaltiesWon: number; // GP / PE
  penaltiesLost: number; // PP
  goalsFor: number; // GF
  goalsAgainst: number; // GC
  penaltyPoints: number; // PEN (Puntos de sanción / deducción)
  yellowCards: number; // TA
  redCards: number; // TR
}

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  venue: string;
  season: string;
  status: TournamentStatus;
  teamsCount: number;
  maxTeams: number;
  rules?: TournamentRules;
  initialStats?: Record<string, InitialTeamStats>;
  startDate?: string;
  createdAt: string;
}
