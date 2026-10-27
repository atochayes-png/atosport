export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  representative: string; // Representante / Capitán
  phone: string;          // Teléfono / Contacto
  shortName: string;      // Siglas distintivas (ej. ATM, DPM)
  color: string;          // Color distintivo (hex)
  createdAt: string;      // ISO Date
}

export type TournamentDetailTab = 'equipos' | 'rol' | 'tabla' | 'cedulas';
