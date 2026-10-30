export interface ClubCommunityConfig {
  teamId: string;
  funnySectionTitle: string; // ej: 'El Oso de la Jornada' / 'La Vikingada' / 'La Torada'
  historySectionTitle: string; // ej: 'El Baúl Histórico' / 'La Vikingoteca' / 'La Rayadoteca'
  slogan: string; // ej: '¡Garra, Pasión y Hermandad!'
  bannerUrl?: string;
  crestUrl?: string;
}

export type PostType = 'standard' | 'match_card' | 'official_notice';

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  teamId: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorNumber?: number;
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
  createdAt: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds (ej. '🔥': ['u-1', 'u-2'])
  comments: CommunityComment[];
  matchData?: {
    matchId?: string;
    homeTeamName: string;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
    scorers?: string[];
    date?: string;
    stage?: string;
  };
}

export interface NextMatchCall {
  teamId: string;
  rivalName: string;
  rivalShortName?: string;
  rivalColor?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  field: string;
  tournamentName?: string;
  confirmations: Record<string, 'yes' | 'no'>; // userId -> 'yes' | 'no'
  updatedAt: number;
}

export interface VoteOption {
  id: string;
  label: string;
  sublabel?: string;
  votes: string[]; // array of userIds
}

export interface PostMatchVote {
  id: string;
  teamId: string;
  type: 'mvp' | 'funny';
  title: string;
  question: string;
  options: VoteOption[];
  isActive: boolean;
  createdAt: string;
}

export type MemoryCategory = 'Campeonatos' | 'Premiaciones' | 'Asados y Convivencias' | 'Clásicos y Recuerdos';

export interface HistoricalMemory {
  id: string;
  teamId: string;
  title: string;
  category: MemoryCategory;
  year: string;
  imageUrl: string;
  description?: string;
  authorName?: string;
  createdAt: string;
}

export interface CommunityNotification {
  id: string;
  teamId: string;
  postId: string;
  type: 'comment' | 'reaction' | 'notice' | 'vote';
  message: string;
  createdAt: string;
  readBy: string[]; // userIds who have seen this
}
