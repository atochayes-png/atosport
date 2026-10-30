import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings2, 
  Bell, 
  MessageSquare, 
  Trophy, 
  Clock, 
  MapPin, 
  Calendar, 
  Pin, 
  Send, 
  Image as ImageIcon, 
  Check, 
  X, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Sparkles, 
  BookOpen, 
  Users, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { Team } from '../../types/team';
import { Player } from '../../types/player';
import { 
  ClubCommunityConfig, 
  CommunityPost, 
  CommunityComment, 
  NextMatchCall, 
  PostMatchVote, 
  HistoricalMemory, 
  CommunityNotification 
} from '../../types/community';
import { useAuth } from '../../context/AuthContext';
import { 
  DEFAULT_COMMUNITY_CONFIGS, 
  INITIAL_COMMUNITY_POSTS, 
  INITIAL_NEXT_MATCHES, 
  INITIAL_VOTES, 
  INITIAL_MEMORIES 
} from '../../data/initialCommunities';
import { 
  broadcastCommunityUpdate, 
  useRealtimeClubCommunity, 
  CommunityRealtimePayload 
} from '../../services/communityRealtimeService';
import { useMatchCountdown } from '../../utils/countdownTimer';
import { CommunitySettingsModal } from './CommunitySettingsModal';
import { EditNextMatchModal } from './EditNextMatchModal';
import { NewMemoryModal } from './NewMemoryModal';

interface ClubCommunityViewProps {
  team: Team;
  players?: Player[];
  tournamentName?: string;
  onBack: () => void;
}

export const ClubCommunityView: React.FC<ClubCommunityViewProps> = ({
  team,
  players = [],
  tournamentName = 'Torneo Oficial',
  onBack,
}) => {
  const { currentUser } = useAuth();
  const teamColor = team.color || '#10B981';

  // 1. Community Configuration (Términos personalizados & lema)
  const configStorageKey = `atosport_community_config_${team.id}`;
  const [config, setConfig] = useState<ClubCommunityConfig>(() => {
    try {
      const saved = localStorage.getItem(configStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading community config:', e);
    }
    return DEFAULT_COMMUNITY_CONFIGS[team.id] || {
      teamId: team.id,
      funnySectionTitle: 'El Oso de la Jornada',
      historySectionTitle: 'El Baúl Histórico',
      slogan: '¡Garra, Unión y Tradición Deportiva!',
    };
  });

  // 2. Next Match Call & Attendance
  const matchStorageKey = `atosport_community_next_match_${team.id}`;
  const [nextMatch, setNextMatch] = useState<NextMatchCall>(() => {
    try {
      const saved = localStorage.getItem(matchStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading next match:', e);
    }
    return INITIAL_NEXT_MATCHES[team.id] || {
      teamId: team.id,
      rivalName: 'Rival por definir',
      date: new Date(Date.now() + 18 * 3600 * 1000).toISOString().split('T')[0],
      time: '20:00',
      field: 'Cancha 1 (Estadio)',
      tournamentName,
      confirmations: {},
      updatedAt: Date.now(),
    };
  });

  // 3. Social Feed Posts ('La Tribuna')
  const postsStorageKey = `atosport_community_posts_${team.id}`;
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem(postsStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading posts:', e);
    }
    const defaultPosts = INITIAL_COMMUNITY_POSTS.filter((p) => p.teamId === team.id);
    return defaultPosts.length > 0 ? defaultPosts : INITIAL_COMMUNITY_POSTS;
  });

  // 4. Votes ('Tercer Tiempo': MVP + Sección Chusca)
  const votesStorageKey = `atosport_community_votes_${team.id}`;
  const [votes, setVotes] = useState<PostMatchVote[]>(() => {
    try {
      const saved = localStorage.getItem(votesStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading votes:', e);
    }
    const defaultVotes = INITIAL_VOTES.filter((v) => v.teamId === team.id);
    return defaultVotes.length > 0 ? defaultVotes : INITIAL_VOTES;
  });

  // 5. Historical Memories ('El Baúl')
  const memoriesStorageKey = `atosport_community_memories_${team.id}`;
  const [memories, setMemories] = useState<HistoricalMemory[]>(() => {
    try {
      const saved = localStorage.getItem(memoriesStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading memories:', e);
    }
    const defaultMems = INITIAL_MEMORIES.filter((m) => m.teamId === team.id);
    return defaultMems.length > 0 ? defaultMems : INITIAL_MEMORIES;
  });

  // Modals & UI States
  const [activeTab, setActiveTab] = useState<'tribuna' | 'tercer_tiempo' | 'baul'>('tribuna');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMatchOpen, setIsEditMatchOpen] = useState(false);
  const [isNewMemoryModalOpen, setIsNewMemoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // New Post Form State
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isOfficialNotice, setIsOfficialNotice] = useState(false);
  const [postSuccessNotice, setPostSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Bell State
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Permissions
  const isCaptainOrAdmin = 
    currentUser?.role === 'MASTER' || 
    currentUser?.role === 'ADMIN_LIGA' || 
    (currentUser?.role === 'REPRESENTANTE' && currentUser.teamId === team.id);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem(configStorageKey, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config, configStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(matchStorageKey, JSON.stringify(nextMatch));
    } catch (e) {
      console.error(e);
    }
  }, [nextMatch, matchStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(postsStorageKey, JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts, postsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(votesStorageKey, JSON.stringify(votes));
    } catch (e) {
      console.error(e);
    }
  }, [votes, votesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(memoriesStorageKey, JSON.stringify(memories));
    } catch (e) {
      console.error(e);
    }
  }, [memories, memoriesStorageKey]);

  // Hook de Sincronización en Tiempo Real mediante Supabase Realtime
  useRealtimeClubCommunity(team.id, (payload: CommunityRealtimePayload) => {
    if (payload.eventType === 'NEW_POST' && payload.post) {
      setPosts((prev) => [payload.post!, ...prev.filter((p) => p.id !== payload.post!.id)]);
      if (payload.post.authorId !== currentUser?.id) {
        setUnreadCount((c) => c + 1);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            teamId: team.id,
            postId: payload.post!.id,
            type: payload.post!.type === 'official_notice' ? 'notice' : 'comment',
            message: `${payload.post!.authorName} publicó en La Tribuna`,
            createdAt: new Date().toISOString(),
            readBy: [],
          },
          ...prev,
        ]);
      }
    } else if (payload.eventType === 'NEW_COMMENT' && payload.comment) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === payload.comment!.postId
            ? { ...p, comments: [...p.comments, payload.comment!] }
            : p
        )
      );
      if (payload.comment.authorId !== currentUser?.id) {
        setUnreadCount((c) => c + 1);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            teamId: team.id,
            postId: payload.comment!.postId,
            type: 'comment',
            message: `${payload.comment!.authorName} comentó en una publicación`,
            createdAt: new Date().toISOString(),
            readBy: [],
          },
          ...prev,
        ]);
      }
    } else if (payload.eventType === 'TOGGLE_REACTION' && payload.reactionData) {
      const { postId, emoji, userId, hasReacted } = payload.reactionData;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const currentList = p.reactions[emoji] || [];
          const updatedList = hasReacted
            ? Array.from(new Set([...currentList, userId]))
            : currentList.filter((id) => id !== userId);
          return {
            ...p,
            reactions: { ...p.reactions, [emoji]: updatedList },
          };
        })
      );
    } else if (payload.eventType === 'UPDATE_ATTENDANCE' && payload.attendanceData) {
      const { userId, status } = payload.attendanceData;
      setNextMatch((prev) => ({
        ...prev,
        confirmations: { ...prev.confirmations, [userId]: status },
        updatedAt: Date.now(),
      }));
    } else if (payload.eventType === 'CAST_VOTE' && payload.voteData) {
      const { voteId, optionId, userId } = payload.voteData;
      setVotes((prev) =>
        prev.map((v) => {
          if (v.id !== voteId) return v;
          return {
            ...v,
            options: v.options.map((opt) => {
              const withoutUser = opt.votes.filter((uid) => uid !== userId);
              return opt.id === optionId
                ? { ...opt, votes: [...withoutUser, userId] }
                : { ...opt, votes: withoutUser };
            }),
          };
        })
      );
    } else if (payload.eventType === 'UPDATE_CONFIG' && payload.configData) {
      setConfig(payload.configData);
    } else if (payload.eventType === 'NEW_MEMORY' && payload.memoryData) {
      setMemories((prev) => [payload.memoryData!, ...prev]);
    }
  });

  // Countdown clock state
  const countdown = useMatchCountdown(nextMatch.date, nextMatch.time);

  // Attendance stats
  const confirmationsList = Object.entries(nextMatch.confirmations || {});
  const confirmedCount = confirmationsList.filter(([, status]) => status === 'yes').length;
  const currentUserAttendance = currentUser ? nextMatch.confirmations[currentUser.id] : undefined;

  // Toggle Attendance
  const handleToggleAttendance = (status: 'yes' | 'no') => {
    if (!currentUser) return;
    const newConfirmations = {
      ...nextMatch.confirmations,
      [currentUser.id]: status,
    };
    const updatedMatch: NextMatchCall = {
      ...nextMatch,
      confirmations: newConfirmations,
      updatedAt: Date.now(),
    };
    setNextMatch(updatedMatch);

    broadcastCommunityUpdate(team.id, 'UPDATE_ATTENDANCE', {
      attendanceData: { teamId: team.id, userId: currentUser.id, status },
    });
  };

  // Handle Photo selection for new post
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage) return;

    const currentAuthorPlayer = players.find((p) => p.id === currentUser?.playerId);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      teamId: team.id,
      type: isOfficialNotice && isCaptainOrAdmin ? 'official_notice' : 'standard',
      isPinned: isOfficialNotice && isCaptainOrAdmin,
      authorId: currentUser?.id || 'u-anon',
      authorName: currentUser?.displayName || 'Miembro del Club',
      authorRole: currentUser?.role === 'REPRESENTANTE' ? 'Capitán / Representante' : 'Jugador Federado',
      authorNumber: currentAuthorPlayer?.number,
      content: newPostText.trim(),
      imageUrl: newPostImage || undefined,
      createdAt: new Date().toISOString(),
      reactions: {},
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostText('');
    setNewPostImage(null);
    setIsOfficialNotice(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setPostSuccessNotice('¡Publicación compartida con el equipo!');
    setTimeout(() => setPostSuccessNotice(null), 3000);

    broadcastCommunityUpdate(team.id, 'NEW_POST', { post: newPost });
  };

  // Toggle Reaction on a Post
  const handleReaction = (postId: string, emoji: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentList = post.reactions[emoji] || [];
    const hasReacted = currentList.includes(currentUser.id);

    const updatedList = hasReacted
      ? currentList.filter((id) => id !== currentUser.id)
      : [...currentList, currentUser.id];

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, reactions: { ...p.reactions, [emoji]: updatedList } }
          : p
      )
    );

    broadcastCommunityUpdate(team.id, 'TOGGLE_REACTION', {
      reactionData: { postId, emoji, userId: currentUser.id, hasReacted: !hasReacted },
    });
  };

  // Submit Comment on a Post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !currentUser) return;

    const newComment: CommunityComment = {
      id: `comm-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorRole: currentUser.role === 'REPRESENTANTE' ? 'Capitán' : 'Jugador',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));

    broadcastCommunityUpdate(team.id, 'NEW_COMMENT', { comment: newComment });
  };

  // Cast Vote on MVP or Funny
  const handleCastVote = (voteId: string, optionId: string) => {
    if (!currentUser) return;

    setVotes((prev) =>
      prev.map((v) => {
        if (v.id !== voteId) return v;
        return {
          ...v,
          options: v.options.map((opt) => {
            const withoutUser = opt.votes.filter((uid) => uid !== currentUser.id);
            return opt.id === optionId
              ? { ...opt, votes: [...withoutUser, currentUser.id] }
              : { ...opt, votes: withoutUser };
          }),
        };
      })
    );

    broadcastCommunityUpdate(team.id, 'CAST_VOTE', {
      voteData: { voteId, optionId, userId: currentUser.id },
    });
  };

  // Filter Memories
  const filteredMemories = useMemo(() => {
    if (selectedCategory === 'Todas') return memories;
    return memories.filter((m) => m.category === selectedCategory);
  }, [memories, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP BAR DE NAVEGACIÓN Y ACCIONES */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Club</span>
        </button>

        <div className="flex items-center gap-2 relative">
          {/* Notificaciones Internas Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setUnreadCount(0);
              }}
              className="p-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors relative"
              title="Notificaciones de La Tribuna"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-30 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Actividad Reciente
                  </span>
                  <span className="text-[10px] text-slate-400">En tiempo real</span>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Sin novedades recientes en el vestidor.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.message}</p>
                        <span className="text-[10px] text-slate-400">Hace unos momentos</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Configuración de Comunidad (Capitán / Admin) */}
          {isCaptainOrAdmin && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Personalizar términos y lema"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Personalizar Términos</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CLUB HERO HEADER IDENTITARIO */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Glow de color del equipo */}
        <div 
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: teamColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shrink-0"
              style={{
                backgroundColor: teamColor,
                boxShadow: `0 8px 24px ${teamColor}40`,
              }}
            >
              {team.shortName || team.name.slice(0, 3).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Comunidad Privada de Club
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{tournamentName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {team.name}
              </h1>

              {config.slogan && (
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 italic flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>"{config.slogan}"</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Plantilla Registrada
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {players.length} Jugadores
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TARJETA DESTACADA: PRÓXIMO PARTIDO CON CUENTA REGRESIVA Y CONVOCATORIA */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-[#0B0F17] to-slate-950 border border-slate-800 shadow-xl overflow-hidden text-white">
        {/* Glow dinámico de proximidad si faltan menos de 24 horas */}
        {countdown.isLessThan24h && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10 space-y-5">
          {/* Cabecera del Próximo Partido */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                <span>Próximo Encuentro Oficial</span>
                {countdown.isLessThan24h && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    ¡Menos de 24h!
                  </span>
                )}
              </h2>
            </div>

            {isCaptainOrAdmin && (
              <button
                onClick={() => setIsEditMatchOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Editar Convocatoria</span>
              </button>
            )}
          </div>

          {/* Duelo de Equipos y Cronómetro Regresivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Enfrentamiento */}
            <div className="lg:col-span-7 flex items-center justify-between sm:justify-start sm:gap-8">
              {/* Equipo Local (Tu Club) */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                  style={{ backgroundColor: teamColor }}
                >
                  {team.shortName || 'MI CLUB'}
                </div>
                <span className="font-extrabold text-sm sm:text-base text-white">{team.name}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Tu Equipo</span>
              </div>

              {/* VS Central */}
              <div className="flex flex-col items-center px-2">
                <span className="text-xl sm:text-2xl font-black text-slate-500 tracking-widest select-none">
                  VS
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate max-w-[140px]">{nextMatch.field}</span>
                </div>
              </div>

              {/* Equipo Rival */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-black text-sm shadow-md">
                  {nextMatch.rivalShortName || nextMatch.rivalName.slice(0, 3).toUpperCase()}
                </div>
                <span className="font-extrabold text-sm sm:text-base text-white">{nextMatch.rivalName}</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>{nextMatch.date} • {nextMatch.time} hrs</span>
                </div>
              </div>
            </div>

            {/* Cronómetro Regresivo Deportivo Digital (Segudo a segundo) */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Tiempo Restante para el Silbatazo</span>
              </span>

              {countdown.isPast ? (
                <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  ¡Partido en Proceso o Concluido!
                </div>
              ) : (
                <div className="flex items-center gap-2 font-mono">
                  {/* Horas */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl font-black shadow-inner shadow-emerald-500/10">
                      {countdown.hours}
                    </div>
                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">HORAS</span>
                  </div>

                  <span className="text-xl font-black text-emerald-400 animate-pulse pb-3">:</span>

                  {/* Minutos */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl font-black shadow-inner shadow-emerald-500/10">
                      {countdown.minutes}
                    </div>
                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">MIN</span>
                  </div>

                  <span className="text-xl font-black text-emerald-400 animate-pulse pb-3">:</span>

                  {/* Segundos */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl font-black shadow-inner shadow-emerald-500/10">
                      {countdown.seconds}
                    </div>
                    <span className="text-[9px] font-sans font-bold text-slate-400 mt-0.5">SEG</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Confirmación de Asistencia en 1 Toque */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">
                    {confirmedCount} Confirmados
                  </span>
                  <span className="text-xs text-slate-400">para este partido</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentUserAttendance === 'yes' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Has confirmado tu asistencia
                    </span>
                  ) : currentUserAttendance === 'no' ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <X className="w-3 h-3" /> Has notificado que no podrás asistir
                    </span>
                  ) : (
                    'Confirma tu asistencia con 1 toque para el capitán'
                  )}
                </p>
              </div>
            </div>

            {/* Botones de Confirmación 1 Toque */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleToggleAttendance('yes')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentUserAttendance === 'yes'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-102 ring-2 ring-emerald-400'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Voy / Confirmo</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAttendance('no')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentUserAttendance === 'no'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-102 ring-2 ring-rose-400'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
                <span>No puedo ir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BARRA DE PESTAÑAS (TABS) DE LA COMUNIDAD */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('tribuna')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'tribuna'
              ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>La Tribuna (Feed Social)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'tribuna' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            {posts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tercer_tiempo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'tercer_tiempo'
              ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Votaciones del Tercer Tiempo</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'tercer_tiempo' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            {votes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('baul')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'baul'
              ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{config.historySectionTitle || 'El Baúl Histórico'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'baul' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            {memories.length}
          </span>
        </button>
      </div>

      {/* 5. TAB 1: LA TRIBUNA (FEED SOCIAL INTERACTIVO) */}
      {activeTab === 'tribuna' && (
        <div className="space-y-6">
          {/* Caja de Publicación */}
          <div className="rounded-3xl p-5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: teamColor }}
              >
                {currentUser?.displayName?.slice(0, 2).toUpperCase() || 'YO'}
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {currentUser?.displayName || 'Jugador'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Publicar en La Tribuna de {team.name}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="¿Qué pasa en el vestidor? Comparte impresiones, fotos del juego o avisos..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />

              {/* Vista previa de imagen adjunta */}
              {newPostImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-64">
                  <img src={newPostImage} alt="Adjunto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Barra de opciones de publicación */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="community-photo-upload"
                  />
                  <label
                    htmlFor="community-photo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>Adjuntar Foto</span>
                  </label>

                  {isCaptainOrAdmin && (
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isOfficialNotice}
                        onChange={(e) => setIsOfficialNotice(e.target.checked)}
                        className="rounded border-amber-400 text-amber-500 focus:ring-amber-500"
                      />
                      <Pin className="w-3.5 h-3.5" />
                      <span>Fijar como Aviso Oficial</span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!newPostText.trim() && !newPostImage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>
              </div>
            </form>

            {postSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{postSuccessNotice}</span>
              </div>
            )}
          </div>

          {/* Feed de Publicaciones */}
          <div className="space-y-4">
            {posts.map((post) => {
              const isPinned = post.isPinned || post.type === 'official_notice';
              const commentsOpen = Boolean(expandedComments[post.id]);
              const commentsCount = post.comments?.length || 0;

              return (
                <div
                  key={post.id}
                  className={`rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0B0F17] border shadow-sm transition-all space-y-4 ${
                    isPinned
                      ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Badge de Aviso Oficial si está fijado */}
                  {isPinned && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider w-fit">
                      <Pin className="w-3.5 h-3.5" />
                      <span>📌 AVISO OFICIAL DEL CAPITÁN</span>
                    </div>
                  )}

                  {/* Header de la Publicación */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                        style={{ backgroundColor: teamColor }}
                      >
                        {post.authorNumber ? `#${post.authorNumber}` : post.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {post.authorName}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {post.authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Oficial de Partido (si es post de resultado) */}
                  {post.type === 'match_card' && post.matchData && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
                        <span>Tarjeta Oficial de Partido</span>
                        <span>{post.matchData.stage || 'Jornada'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-6 py-2">
                        <span className="font-extrabold text-base text-right flex-1 truncate">{post.matchData.homeTeamName}</span>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-black text-xl text-emerald-400">
                          {post.matchData.homeScore} - {post.matchData.awayScore}
                        </div>
                        <span className="font-extrabold text-base text-left flex-1 truncate">{post.matchData.awayTeamName}</span>
                      </div>
                      {post.matchData.scorers && (
                        <div className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-2">
                          Goles: {post.matchData.scorers.join(' • ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenido de Texto */}
                  {post.content && (
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {/* Imagen de la Publicación */}
                  {post.imageUrl && (
                    <div 
                      onClick={() => setLightboxImage(post.imageUrl!)}
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 cursor-pointer group relative"
                    >
                      <img 
                        src={post.imageUrl} 
                        alt="Foto de La Tribuna" 
                        className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Ver a tamaño completo
                      </div>
                    </div>
                  )}

                  {/* Barra de Reacciones y Comentarios */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    {/* Botones de Reacciones (❤️, 🔥, 👏, ⚽) */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { emoji: '🔥', label: 'Fuego' },
                        { emoji: '❤️', label: 'Amor' },
                        { emoji: '👏', label: 'Aplausos' },
                        { emoji: '⚽', label: 'Gol' },
                      ].map(({ emoji }) => {
                        const count = (post.reactions[emoji] || []).length;
                        const hasReacted = currentUser && (post.reactions[emoji] || []).includes(currentUser.id);

                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(post.id, emoji)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                              hasReacted
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[11px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón de Comentarios (Debate de Vestidor) */}
                    <button
                      type="button"
                      onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{commentsCount === 1 ? '1 Comentario' : `${commentsCount} Comentarios`}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${commentsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Hilo de Comentarios Desplegable */}
                  {commentsOpen && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {/* Lista de Comentarios */}
                      <div className="space-y-2.5">
                        {post.comments?.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/60 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleTimeString('es-MX', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Input para agregar comentario */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder="Escribe tu comentario en el vestidor..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 2: TERCER TIEMPO (VOTACIONES POST-PARTIDO: MVP Y SECCIÓN CHUSCA) */}
      {activeTab === 'tercer_tiempo' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>
              Votaciones activas tras el último partido disputado. ¡Haz valer tu voto de vestidor!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {votes.map((vote) => {
              const isMVP = vote.type === 'mvp';
              const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes.length, 0);
              const userHasVoted = currentUser && vote.options.some((opt) => opt.votes.includes(currentUser.id));
              const titleToShow = isMVP ? 'Votación MVP de la Semana' : (config.funnySectionTitle || 'El Oso de la Jornada');

              return (
                <div
                  key={vote.id}
                  className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isMVP
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                      }`}>
                        {isMVP ? '⭐ JUGADOR MÁS VALIOSO' : '🤪 MOMENTO CÓMICO'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {totalVotes} {totalVotes === 1 ? 'Voto' : 'Votos'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {titleToShow}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {vote.question}
                    </p>
                  </div>

                  {/* Opciones de Votación */}
                  <div className="space-y-2.5 pt-2">
                    {vote.options.map((option) => {
                      const count = option.votes.length;
                      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const isUserVote = currentUser && option.votes.includes(currentUser.id);

                      return (
                        <div
                          key={option.id}
                          onClick={() => handleCastVote(vote.id, option.id)}
                          className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                            isUserVote
                              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/60'
                          }`}
                        >
                          {/* Barra de Progreso en Vivo de Fondo */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 transition-all duration-500 opacity-20 pointer-events-none ${
                              isMVP ? 'bg-amber-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {option.label}
                                </span>
                                {isUserVote && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                              </div>
                              {option.sublabel && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {option.sublabel}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-black text-sm text-slate-900 dark:text-white">
                                {percentage}%
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {count} {count === 1 ? 'voto' : 'votos'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    {userHasVoted ? '✓ Tu voto está registrado (puedes cambiarlo pulsando otra opción)' : 'Toca sobre una opción para votar'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 3: EL BAÚL HISTÓRICO (ARCHIVO MULTIMEDIA DEL CLUB) */}
      {activeTab === 'baul' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Categorías de filtro */}
            <div className="flex flex-wrap items-center gap-2">
              {['Todas', 'Campeonatos', 'Premiaciones', 'Asados y Convivencias', 'Clásicos y Recuerdos'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewMemoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-sm active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Agregar Recuerdo</span>
            </button>
          </div>

          {/* Grid de Recuerdos Multimedia */}
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No hay recuerdos en esta categoría
              </h3>
              <p className="text-xs text-slate-400">
                Sube la primera foto de campeonato o asado del club.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => setLightboxImage(mem.imageUrl)}
                  className="group rounded-3xl overflow-hidden bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={mem.imageUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-950/70 text-white backdrop-blur-md">
                      {mem.category}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-sm">
                      {mem.year}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {mem.title}
                    </h4>
                    {mem.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {mem.description}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800">
                      Por: {mem.authorName || 'Club'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX PARA VER FOTO A TAMAÑO COMPLETO */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImage} alt="Foto completa" className="rounded-2xl max-h-[85vh] object-contain shadow-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN DE TÉRMINOS */}
      <CommunitySettingsModal
        isOpen={isSettingsOpen}
        team={team}
        config={config}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newConf) => {
          setConfig(newConf);
          broadcastCommunityUpdate(team.id, 'UPDATE_CONFIG', { configData: newConf });
        }}
      />

      {/* MODAL EDITAR CONVOCATORIA DE PRÓXIMO PARTIDO */}
      <EditNextMatchModal
        isOpen={isEditMatchOpen}
        team={team}
        nextMatch={nextMatch}
        onClose={() => setIsEditMatchOpen(false)}
        onSave={(updated) => {
          setNextMatch(updated);
          broadcastCommunityUpdate(team.id, 'UPDATE_ATTENDANCE', {
            attendanceData: { teamId: team.id, userId: currentUser?.id || 'admin', status: 'yes' },
          });
        }}
      />
      {/* MODAL AGREGAR RECUERDO AL BAÚL */}
      <NewMemoryModal
        isOpen={isNewMemoryModalOpen}
        team={team}
        authorName={currentUser?.displayName || 'Club'}
        onClose={() => setIsNewMemoryModalOpen(false)}
        onSave={(newMem) => {
          setMemories((prev) => [newMem, ...prev]);
          broadcastCommunityUpdate(team.id, 'NEW_MEMORY', { memoryData: newMem });
        }}
      />
    </div>
  );
};
