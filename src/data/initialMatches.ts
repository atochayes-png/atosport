import { Match, Matchday } from '../types/match';

export const INITIAL_MATCHDAYS: Matchday[] = [
  // Jornadas para t-1 (Liga Premier Nocturna 2026)
  {
    id: 'md-t1-1',
    tournamentId: 't-1',
    number: 1,
    name: 'Jornada 1',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'md-t1-2',
    tournamentId: 't-1',
    number: 2,
    name: 'Jornada 2',
    createdAt: '2026-02-16T00:00:00.000Z',
  },
  {
    id: 'md-t1-3',
    tournamentId: 't-1',
    number: 3,
    name: 'Jornada 3',
    createdAt: '2026-02-17T00:00:00.000Z',
  },

  // Jornadas para t-2 (Copa Metropolitana Élite)
  {
    id: 'md-t2-1',
    tournamentId: 't-2',
    number: 1,
    name: 'Jornada 1',
    createdAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: 'md-t2-2',
    tournamentId: 't-2',
    number: 2,
    name: 'Jornada 2',
    createdAt: '2026-02-21T00:00:00.000Z',
  },
];

export const INITIAL_MATCHES: Match[] = [
  // --- Torneo t-1 • Jornada 1 ---
  {
    id: 'm-t1-101',
    tournamentId: 't-1',
    matchdayNumber: 1,
    homeTeamId: 'team-101', // Atlético Modelo
    awayTeamId: 'team-102', // Deportivo Montejo
    date: '2026-11-06',
    time: '19:00',
    field: 'Cancha 1 (Principal)',
    status: 'Finalizado',
    homeScore: 3,
    awayScore: 1,
    createdAt: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'm-t1-102',
    tournamentId: 't-1',
    matchdayNumber: 1,
    homeTeamId: 'team-103', // Real Itzimná
    awayTeamId: 'team-104', // F.C. Altabrisa
    date: '2026-11-06',
    time: '20:15',
    field: 'Cancha 1 (Principal)',
    status: 'Finalizado',
    homeScore: 2,
    awayScore: 2,
    createdAt: '2026-02-15T10:30:00.000Z',
  },
  {
    id: 'm-t1-103',
    tournamentId: 't-1',
    matchdayNumber: 1,
    homeTeamId: 'team-105', // Halcones del Prado
    awayTeamId: 'team-106', // Cerveceros Sporting
    date: '2026-11-07',
    time: '19:30',
    field: 'Cancha 2',
    status: 'En Vivo',
    homeScore: 2,
    awayScore: 1,
    liveStage: '2T',
    liveMinute: "68'",
    createdAt: '2026-02-15T11:00:00.000Z',
  },
  {
    id: 'm-t1-104',
    tournamentId: 't-1',
    matchdayNumber: 1,
    homeTeamId: 'team-107', // Tiburones Caucel
    awayTeamId: 'team-108', // Santos García
    date: '2026-11-07',
    time: '21:00',
    field: 'Cancha 2',
    status: 'Programado',
    createdAt: '2026-02-15T11:30:00.000Z',
  },

  // --- Torneo t-1 • Jornada 2 ---
  {
    id: 'm-t1-201',
    tournamentId: 't-1',
    matchdayNumber: 2,
    homeTeamId: 'team-102', // Deportivo Montejo
    awayTeamId: 'team-103', // Real Itzimná
    date: '2026-11-13',
    time: '19:00',
    field: 'Cancha 1 (Principal)',
    status: 'Programado',
    createdAt: '2026-02-16T09:00:00.000Z',
  },
  {
    id: 'm-t1-202',
    tournamentId: 't-1',
    matchdayNumber: 2,
    homeTeamId: 'team-104', // F.C. Altabrisa
    awayTeamId: 'team-101', // Atlético Modelo
    date: '2026-11-13',
    time: '20:30',
    field: 'Cancha 1 (Principal)',
    status: 'Programado',
    createdAt: '2026-02-16T09:30:00.000Z',
  },

  // --- Torneo t-2 • Jornada 1 ---
  {
    id: 'm-t2-101',
    tournamentId: 't-2',
    matchdayNumber: 1,
    homeTeamId: 'team-201', // Lobos Ciudad Caucel
    awayTeamId: 'team-202', // Dragones de Montejo
    date: '2026-11-08',
    time: '10:00',
    field: 'Estadio Olímpico Municipal',
    status: 'Programado',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'm-t2-102',
    tournamentId: 't-2',
    matchdayNumber: 1,
    homeTeamId: 'team-203', // Jaguares UADY
    awayTeamId: 'team-204', // Furia Roja FC
    date: '2026-11-08',
    time: '12:00',
    field: 'Estadio Olímpico Municipal',
    status: 'Programado',
    createdAt: '2026-02-20T11:00:00.000Z',
  },
];
