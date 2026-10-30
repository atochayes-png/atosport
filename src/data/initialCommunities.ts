import { 
  ClubCommunityConfig, 
  CommunityPost, 
  NextMatchCall, 
  PostMatchVote, 
  HistoricalMemory 
} from '../types/community';

export const DEFAULT_COMMUNITY_CONFIGS: Record<string, ClubCommunityConfig> = {
  'team-101': {
    teamId: 'team-101',
    funnySectionTitle: 'El Oso de la Jornada',
    historySectionTitle: 'El Baúl Histórico',
    slogan: '¡Garra, Unión y Tradición Modelo!',
  },
  'team-102': {
    teamId: 'team-102',
    funnySectionTitle: 'La Montejada',
    historySectionTitle: 'La Montejoteca',
    slogan: '¡Fuerza Azul y Orgullo Montejo!',
  },
};

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    teamId: 'team-101',
    type: 'official_notice',
    isPinned: true,
    authorId: 'u-capitan',
    authorName: 'Carlos Pech',
    authorRole: 'Capitán / Representante',
    authorNumber: 8,
    content: '📌 AVISO OFICIAL: Muchachos, para el partido de este fin de semana es obligatorio presentarse 30 minutos antes para calentamiento y firma de cédula con el uniforme verde completo y espinilleras reglamentarias. ¡Puntualidad!',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: {
      '🔥': ['u-jugador', 'u-capitan', 'u-master'],
      '👏': ['u-jugador', 'u-admin-liga'],
      '⚽': ['u-jugador'],
    },
    comments: [
      {
        id: 'comm-1',
        postId: 'post-1',
        authorId: 'u-jugador',
        authorName: 'Carlos Méndez #10',
        authorRole: 'Jugador Federado',
        content: 'Enterado capi, ahí estaremos listos con la hielera y las vendas.',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
  },
  {
    id: 'post-2',
    teamId: 'team-101',
    type: 'match_card',
    authorId: 'u-system',
    authorName: 'Sistema de Liga',
    authorRole: 'Acta Oficial',
    content: 'Victoria contundente en el clásico de la jornada. Excelente desempeño táctico del plantel.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    matchData: {
      homeTeamName: 'Atlético Modelo',
      awayTeamName: 'Deportivo Montejo',
      homeScore: 3,
      awayScore: 1,
      scorers: ['Carlos Méndez (12\', 38\')', 'Raúl Pech (55\')', 'Manuel Canché (68\')'],
      date: '2026-03-24',
      stage: 'Jornada 7',
    },
    reactions: {
      '🔥': ['u-capitan', 'u-jugador', 'u-1', 'u-2'],
      '❤️': ['u-jugador', 'u-capitan'],
      '⚽': ['u-capitan', 'u-jugador'],
    },
    comments: [
      {
        id: 'comm-2',
        postId: 'post-2',
        authorId: 'u-capitan',
        authorName: 'Carlos Pech',
        authorRole: 'Capitán',
        content: 'Partidazo señores. Gran solidaridad defensiva en el segundo tiempo.',
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
      {
        id: 'comm-3',
        postId: 'post-2',
        authorId: 'u-jugador',
        authorName: 'Carlos Méndez #10',
        authorRole: 'Jugador',
        content: 'Ese pase filtrado para el segundo gol fue medio gol tuyo capi!',
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'post-3',
    teamId: 'team-101',
    type: 'standard',
    authorId: 'u-jugador',
    authorName: 'Carlos Méndez #10',
    authorRole: 'Jugador Federado',
    authorNumber: 10,
    content: '¡Gran convivencia después de la victoria! Dejo aquí la foto del festejo en el vestidor. La unión hace la fuerza 💪🍺',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reactions: {
      '❤️': ['u-capitan', 'u-jugador', 'u-master'],
      '🔥': ['u-capitan', 'u-jugador'],
      '👏': ['u-jugador'],
    },
    comments: [],
  },
];

// Helper to compute a match 14 hours from now for the dynamic countdown
const now = new Date();
const nextMatchDate = new Date(now.getTime() + 14 * 60 * 60 * 1000);
const pad2 = (n: number) => String(n).padStart(2, '0');
const formattedMatchDate = `${nextMatchDate.getFullYear()}-${pad2(nextMatchDate.getMonth() + 1)}-${pad2(nextMatchDate.getDate())}`;
const formattedMatchTime = `${pad2(nextMatchDate.getHours())}:${pad2(nextMatchDate.getMinutes())}`;

export const INITIAL_NEXT_MATCHES: Record<string, NextMatchCall> = {
  'team-101': {
    teamId: 'team-101',
    rivalName: 'Cerveceros Sporting',
    rivalShortName: 'CER',
    rivalColor: '#3B82F6',
    date: formattedMatchDate,
    time: formattedMatchTime,
    field: 'Cancha 1 (Estadio Principal)',
    tournamentName: 'Liga Premier Nocturna 2026',
    confirmations: {
      'u-capitan': 'yes',
      'u-jugador': 'yes',
      'p-1': 'yes',
      'p-2': 'yes',
      'p-3': 'yes',
      'p-4': 'yes',
      'p-5': 'yes',
      'p-6': 'yes',
      'p-7': 'no',
    },
    updatedAt: Date.now(),
  },
};

export const INITIAL_VOTES: PostMatchVote[] = [
  {
    id: 'vote-mvp-101',
    teamId: 'team-101',
    type: 'mvp',
    title: 'MVP de la Semana',
    question: '¿Quién fue el jugador más determinante en el triunfo 3-1 vs Deportivo Montejo?',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    options: [
      {
        id: 'opt-1',
        label: 'Carlos Méndez (#10)',
        sublabel: '2 goles y 1 asistencia clave',
        votes: ['u-capitan', 'u-master', 'u-1', 'u-2', 'u-3', 'u-4'],
      },
      {
        id: 'opt-2',
        label: 'Gabriel Pech (#1 - Portero)',
        sublabel: '5 atajadas providenciales',
        votes: ['u-jugador', 'u-5', 'u-6'],
      },
      {
        id: 'opt-3',
        label: 'Luis "Bala" Argaez (#7)',
        sublabel: 'Desborde y asistencia en el 1er tiempo',
        votes: ['u-7'],
      },
    ],
  },
  {
    id: 'vote-funny-101',
    teamId: 'team-101',
    type: 'funny',
    title: 'El Oso de la Jornada',
    question: 'Vota por el momento cómico o pifia más memorable del último encuentro:',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    options: [
      {
        id: 'opt-f1',
        label: 'El despeje al estacionamiento de Toño',
        sublabel: 'Activó la alarma de 3 camionetas al minuto 42',
        votes: ['u-capitan', 'u-jugador', 'u-1', 'u-2', 'u-3'],
      },
      {
        id: 'opt-f2',
        label: 'El resbalón de Memo en el festejo',
        sublabel: 'Iba a abrazar al goleador y terminó en el lodo',
        votes: ['u-master', 'u-4'],
      },
      {
        id: 'opt-f3',
        label: 'El penal que cobró hacia las nubes Chema',
        sublabel: 'Aún están buscando el balón en periférico',
        votes: ['u-5'],
      },
    ],
  },
];

export const INITIAL_MEMORIES: HistoricalMemory[] = [
  {
    id: 'mem-1',
    teamId: 'team-101',
    title: 'Campeones Copa Apertura 2025',
    category: 'Campeonatos',
    year: '2025',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    description: 'La tarde inolvidable de la final de vuelta. Empate en el global y victoria 4-3 en tanda de penales.',
    authorName: 'Carlos Pech',
    createdAt: '2025-11-20T18:00:00.000Z',
  },
  {
    id: 'mem-2',
    teamId: 'team-101',
    title: 'Bota de Oro para Carlos Méndez',
    category: 'Premiaciones',
    year: '2025',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
    description: 'Ceremonia de premiación: 19 goles en 14 jornadas para llevarse el título de goleo individual.',
    authorName: 'Directiva Liga',
    createdAt: '2025-12-05T20:30:00.000Z',
  },
  {
    id: 'mem-3',
    teamId: 'team-101',
    title: 'Gran Asado y Convivencia en la Quinta',
    category: 'Asados y Convivencias',
    year: '2024',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    description: 'Festejo con familias, carne asada y carnitas para celebrar la permanencia en primera fuerza.',
    authorName: 'Toño Alcocer',
    createdAt: '2024-08-15T16:00:00.000Z',
  },
];
