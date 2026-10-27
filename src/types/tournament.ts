export type SportType = 
  | 'Fútbol 11' 
  | 'Fútbol 7' 
  | 'Fútbol Rápido' 
  | 'Futsal' 
  | 'Básquetbol' 
  | 'Voleibol';

export type TournamentStatus = 'En Inscripciones' | 'Activo' | 'Próximo' | 'Finalizado';

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  venue: string;
  season: string;
  status: TournamentStatus;
  teamsCount: number;
  maxTeams: number;
  startDate?: string;
  createdAt: string;
}
