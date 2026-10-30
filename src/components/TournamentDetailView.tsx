import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Trash2, 
  Shield, 
  Crown, 
  CalendarDays, 
  Table, 
  FileCheck, 
  CheckCircle2, 
  Share2, 
  Activity,
  Clock,
  Swords,
  AlertCircle,
  Edit3,
  ChevronDown,
  Check,
  Scale,
  Lock,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';
import { Tournament, TournamentStatus, TournamentRules } from '../types/tournament';
import { Team, TournamentDetailTab } from '../types/team';
import { Match, Matchday, MatchStatus, MatchAttendance } from '../types/match';
import { Player, TeamFinance } from '../types/player';
import { useAuth } from '../context/AuthContext';
import { NewTeamModal } from './NewTeamModal';
import { NewMatchModal } from './NewMatchModal';
import { ScoreModal } from './ScoreModal';
import { AttendanceModal } from './AttendanceModal';
import { StandingsTable } from './StandingsTable';
import { TeamRosterView } from './TeamRosterView';
import { ClubCommunityView } from './community/ClubCommunityView';
import { TournamentRulesConfig } from './TournamentRulesConfig';
import { PlayerProfileView } from './PlayerProfileView';
import { LiveMatchesBanner } from './LiveMatchesBanner';
import { LiveTimerBadge } from '../utils/matchTimer';
import { loadTournamentAttendances, saveTournamentAttendances } from '../utils/attendanceUtils';

const STATUS_CONFIG: Record<
  TournamentStatus,
  {
    label: string;
    badgeLabel: string;
    badgeClass: string;
    dotClass: string;
    description: string;
  }
> = {
  'En Inscripciones': {
    label: 'En Inscripciones',
    badgeLabel: 'En Inscripciones',
    badgeClass: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/30',
    dotClass: 'bg-blue-500 dark:bg-blue-400',
    description: 'Convocatoria abierta para registrar clubes',
  },
  'Activo': {
    label: 'Activo / En Curso',
    badgeLabel: 'Activo / En Curso',
    badgeClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400 animate-pulse',
    description: 'Partidos en desarrollo y rol activo',
  },
  'Finalizado': {
    label: 'Finalizado',
    badgeLabel: 'Finalizado',
    badgeClass: 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30 dark:border-slate-600/30',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
    description: 'Torneo concluido y tabla oficial definitiva',
  },
  'Próximo': {
    label: 'Próximo Torneo',
    badgeLabel: 'Próximo',
    badgeClass: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/30',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
    description: 'En fase de preparación y calendario previo',
  },
};

interface TournamentDetailViewProps {
  tournament: Tournament;
  teams: Team[];
  matchdays: Matchday[];
  matches: Match[];
  players?: Player[];
  teamFinances?: TeamFinance[];
  onBack: () => void;
  onAddTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddMatchday: (tournamentId: string) => void;
  onAddMatch: (match: Omit<Match, 'id' | 'createdAt'>) => void;
  onDeleteMatch: (matchId: string) => void;
  onUpdateScore: (
    matchId: string, 
    homeScore: number, 
    awayScore: number, 
    status: MatchStatus,
    homePenalties?: number,
    awayPenalties?: number,
    penaltyWinnerId?: string,
    liveMinute?: string,
    liveStage?: '1T' | 'Medio Tiempo' | '2T' | 'Tiempo Extra',
    timerData?: {
      period?: number;
      startedAt?: number;
      firstHalfDurationSeconds?: number;
      secondHalfStartedAt?: number;
      isTimerRunning?: boolean;
    }
  ) => void;
  onUpdateStatus?: (tournamentId: string, newStatus: TournamentStatus) => void;
  onUpdateTournamentRules?: (tournamentId: string, rules: TournamentRules) => void;
  onAddPlayer?: (playerData: Omit<Player, 'id' | 'createdAt'>) => void;
  onUpdatePlayer?: (playerId: string, playerData: Partial<Player>) => void;
  onDeletePlayer?: (playerId: string) => void;
  onUpdateFinance?: (teamId: string, finance: Partial<TeamFinance>) => void;
}

export const TournamentDetailView: React.FC<TournamentDetailViewProps> = ({
  tournament,
  teams,
  matchdays,
  matches,
  players = [],
  teamFinances = [],
  onBack,
  onAddTeam,
  onDeleteTeam,
  onAddMatchday,
  onAddMatch,
  onDeleteMatch,
  onUpdateScore,
  onUpdateStatus,
  onUpdateTournamentRules,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onUpdateFinance,
}) => {
  const { 
    currentUser, 
    canManageTournaments, 
    canManageTeams, 
    canManageRoster, 
    canEditScores, 
    canManageRules, 
    canManageSchedules, 
    isPlayer, 
    isReferee, 
    isCaptain 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TournamentDetailTab>(() => {
    if (isPlayer()) return 'credencial';
    if (isReferee()) return 'rol';
    return 'equipos';
  });
  const [selectedTeamForRoster, setSelectedTeamForRoster] = useState<Team | null>(null);
  const [selectedTeamForCommunity, setSelectedTeamForCommunity] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedMatchForScore, setSelectedMatchForScore] = useState<Match | null>(null);
  
  // Attendance and bench photo roll call states
  const [attendances, setAttendances] = useState<Record<string, MatchAttendance>>(() => {
    return loadTournamentAttendances(tournament.id);
  });
  const [selectedMatchForAttendance, setSelectedMatchForAttendance] = useState<Match | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  useEffect(() => {
    setAttendances(loadTournamentAttendances(tournament.id));
  }, [tournament.id]);

  const handleSaveAttendance = (newAttendance: MatchAttendance) => {
    setAttendances((prev) => {
      const updated = { ...prev, [newAttendance.matchId]: newAttendance };
      saveTournamentAttendances(tournament.id, updated);
      return updated;
    });
  };

  const [copyToast, setCopyToast] = useState(false);

  // Switch default tab if user switches role
  useEffect(() => {
    if (isPlayer()) {
      setActiveTab('credencial');
    }
  }, [currentUser?.role]);

  // Interactive Tournament Status Selector state
  const [currentStatus, setCurrentStatus] = useState<TournamentStatus>(tournament.status);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentStatus(tournament.status);
  }, [tournament.status]);

  // Handle outside click and Escape key for status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStatusMenuOpen(false);
      }
    };
    if (isStatusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStatusMenuOpen]);

  const handleStatusSelect = (newStatus: TournamentStatus) => {
    setCurrentStatus(newStatus);
    setIsStatusMenuOpen(false);

    // 1. Direct persistence in localStorage
    try {
      const saved = localStorage.getItem('atosport_tournaments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((t: Tournament) =>
            t.id === tournament.id ? { ...t, status: newStatus } : t
          );
          localStorage.setItem('atosport_tournaments', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Error persisting tournament status change:', err);
    }

    // 2. Notify parent state
    if (onUpdateStatus) {
      onUpdateStatus(tournament.id, newStatus);
    }
  };

  const currentStatusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['En Inscripciones'];

  // Filter teams registered for this specific tournament
  const tournamentTeams = teams.filter((t) => t.tournamentId === tournament.id);

  // Filter matchdays and matches for this tournament
  const tournamentMatchdays = matchdays
    .filter((md) => md.tournamentId === tournament.id)
    .sort((a, b) => a.number - b.number);

  const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);
  const finishedMatchesCount = tournamentMatches.filter((m) => m.status === 'Finalizado').length;

  // Active matchday state (defaults to first matchday or 1)
  const [selectedMatchdayNumber, setSelectedMatchdayNumber] = useState<number>(() => {
    return tournamentMatchdays.length > 0 ? tournamentMatchdays[0].number : 1;
  });

  // Make sure selectedMatchdayNumber exists if matchdays update
  const effectiveMatchdayNumber = tournamentMatchdays.some((md) => md.number === selectedMatchdayNumber)
    ? selectedMatchdayNumber
    : (tournamentMatchdays[0]?.number || 1);

  // Matches for current matchday
  const currentMatchdayMatches = tournamentMatches.filter(
    (m) => m.matchdayNumber === effectiveMatchdayNumber
  );

  // Search filter inside the tournament's teams
  const filteredTeams = tournamentTeams.filter((team) => {
    const q = searchTerm.toLowerCase();
    return (
      team.name.toLowerCase().includes(q) ||
      team.representative.toLowerCase().includes(q) ||
      team.shortName.toLowerCase().includes(q) ||
      team.phone.toLowerCase().includes(q)
    );
  });

  const registeredCount = tournamentTeams.length;
  const maxTeams = tournament.maxTeams || 16;
  const isFull = registeredCount >= maxTeams;
  const progressPercent = Math.min(100, Math.round((registeredCount / maxTeams) * 100));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 3000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Reciente';
    }
  };

  const formatMatchDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-MX', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (selectedTeamForCommunity) {
    const teamPlayers = players.filter((p) => p.teamId === selectedTeamForCommunity.id);
    return (
      <ClubCommunityView
        team={selectedTeamForCommunity}
        players={teamPlayers}
        tournamentName={tournament.name}
        onBack={() => {
          setSelectedTeamForCommunity(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (selectedTeamForRoster) {
    const teamPlayers = players.filter((p) => p.teamId === selectedTeamForRoster.id);
    const finance = teamFinances.find((f) => f.teamId === selectedTeamForRoster.id);

    return (
      <TeamRosterView
        team={selectedTeamForRoster}
        tournamentName={tournament.name}
        players={teamPlayers}
        teamFinance={finance}
        onBack={() => {
          setSelectedTeamForRoster(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddPlayer={onAddPlayer || (() => {})}
        onUpdatePlayer={onUpdatePlayer || (() => {})}
        onDeletePlayer={onDeletePlayer || (() => {})}
        onUpdateFinance={onUpdateFinance || (() => {})}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Back Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Torneos</span>
        </button>

        <div className="flex items-center gap-2">
          {copyToast && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ¡Enlace copiado!
            </span>
          )}

          <button
            onClick={handleShare}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex items-center gap-1.5 min-h-[40px]"
            title="Compartir Torneo"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Live Matches Direct Banner Alert */}
      <LiveMatchesBanner
        matches={tournamentMatches}
        teams={tournamentTeams}
        onOpenMatchScore={(match) => {
          setSelectedMatchForScore(match);
          setIsScoreModalOpen(true);
        }}
      />

      {/* Main Tournament Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card-dark overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Tournament Main Details */}
          <div className="space-y-4 max-w-3xl">
            {/* Badges row with Interactive Status Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                {tournament.sport}
              </span>

              {/* Tournament Status Indicator (Interactive only for organizers) */}
              {canManageTournaments() ? (
                <div className="relative inline-block" ref={statusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsStatusMenuOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isStatusMenuOpen}
                    title="Haz clic para cambiar el estado del torneo"
                    className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${currentStatusConfig.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${currentStatusConfig.dotClass}`} />
                    <span>{currentStatusConfig.badgeLabel}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform duration-200 ${
                        isStatusMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isStatusMenuOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 mt-2 w-64 p-1.5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Cambiar Estado del Torneo
                        </span>
                      </div>
                      <div className="space-y-1">
                        {(Object.keys(STATUS_CONFIG) as TournamentStatus[]).map((statusKey) => {
                          const cfg = STATUS_CONFIG[statusKey];
                          const isSelected = currentStatus === statusKey;
                          return (
                            <button
                              key={statusKey}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleStatusSelect(statusKey)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`} />
                                <div className="truncate">
                                  <div className="leading-snug">{cfg.label}</div>
                                  <div className="text-[10px] font-normal text-slate-400 dark:text-slate-500 truncate">
                                    {cfg.description}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStatusConfig.badgeClass}`}
                  title="Estado oficial del torneo"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${currentStatusConfig.dotClass}`} />
                  <span>{currentStatusConfig.badgeLabel}</span>
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {tournament.season}
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('reglas')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer shadow-xs active:scale-95"
                title={canManageRules() ? 'Configurar reglamento y puntuación' : 'Consultar reglamento oficial'}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span>{canManageRules() ? 'Reglamento / Puntuación' : 'Consultar Reglamento'}</span>
              </button>
            </div>

            {/* Tournament Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2.5 sm:gap-3">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{tournament.name}</span>
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">{tournament.venue}</span>
              </div>
            </div>
          </div>

          {/* Real-time Teams Counter Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200 dark:border-slate-800/80 space-y-3.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                Equipos Inscritos
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {progressPercent}% Lleno
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {registeredCount}
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-400 dark:text-slate-500">
                / {maxTeams} Equipos
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <span>
                {isFull ? (
                  <span className="text-amber-500 font-bold">Cupo completo</span>
                ) : (
                  <span>
                    Quedan <strong className="text-slate-900 dark:text-white">{maxTeams - registeredCount}</strong> cupos
                  </span>
                )}
              </span>
              <span className="text-[11px]">Máx: {maxTeams}</span>
            </div>

            {canManageTeams() && (
              <button
                onClick={() => setIsNewTeamModalOpen(true)}
                disabled={isFull}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  isFull
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 dark:shadow-emerald-glow'
                }`}
              >
                {isFull ? (
                  <span>Cupo Completo</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Inscribir Equipo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Management Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {[
            ...(isPlayer()
              ? [
                  {
                    id: 'credencial' as TournamentDetailTab,
                    label: 'Mi Credencial',
                    icon: Shield,
                    badge: 'Oficial',
                  },
                ]
              : []),
            {
              id: 'equipos' as TournamentDetailTab,
              label: isCaptain() ? 'Mi Club / Equipos' : 'Equipos',
              icon: Users,
              badge: registeredCount.toString(),
            },
            {
              id: 'rol' as TournamentDetailTab,
              label: 'Rol de Juegos',
              icon: CalendarDays,
              badge: tournamentMatches.length > 0 ? `${tournamentMatches.length}` : 'Activo',
            },
            {
              id: 'tabla' as TournamentDetailTab,
              label: 'Tabla de Posiciones',
              icon: Table,
              badge: finishedMatchesCount > 0 ? `${finishedMatchesCount} JJ` : 'Dinámica',
            },
            {
              id: 'reglas' as TournamentDetailTab,
              label: canManageRules() ? 'Reglamento / Puntuación' : 'Reglamento',
              icon: Scale,
              badge: tournament.rules?.penaltiesEnabled ? 'Penales ON' : 'Reglas',
            },
            {
              id: 'cedulas' as TournamentDetailTab,
              label: 'Cédulas Arbitrales',
              icon: FileCheck,
              badge: isReferee() ? 'Árbitro' : null,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm'
                    : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: EQUIPOS */}
      {activeTab === 'equipos' && (
        <div className="space-y-6">
          {/* Subheader: Search and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>Equipos Inscritos</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {tournamentTeams.length} en total
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Buscar equipo, capitán o siglas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors min-h-[40px]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Action button */}
              {canManageTeams() && (
                <button
                  onClick={() => setIsNewTeamModalOpen(true)}
                  disabled={isFull}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] ${
                    isFull
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow'
                  }`}
                >
                  {isFull ? (
                    <span>Cupo Completo</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Inscribir Equipo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Teams Grid / Empty State */}
          {tournamentTeams.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No hay equipos inscritos todavía
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Registra los clubes deportivos participantes para generar posteriormente el rol de juegos y la tabla general.
              </p>
              <button
                onClick={() => setIsNewTeamModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Inscribir Primer Equipo
              </button>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No se encontraron equipos con "{searchTerm}"
              </h3>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredTeams.map((team) => {
                const teamColor = team.color || '#10B981';
                const teamPlayers = players.filter((p) => p.teamId === team.id);
                const teamFinance = teamFinances.find((f) => f.teamId === team.id);
                const totalFee = teamFinance?.totalTeamFee ?? 4200;
                const collected = teamPlayers.reduce((sum, p) => sum + (p.feePaid || 0), 0);
                const isFullyPaid = collected >= totalFee && totalFee > 0;
                const feeProgress = Math.min(100, Math.round((collected / (totalFee || 1)) * 100));

                return (
                  <div
                    key={team.id}
                    className="group rounded-2xl p-5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-card-dark transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top color indicator accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-all"
                      style={{ backgroundColor: teamColor }}
                    />

                    <div>
                      {/* Top Team Header with Badge */}
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-sm transition-transform group-hover:scale-105 shrink-0"
                            style={{
                              backgroundColor: teamColor,
                              boxShadow: `0 4px 12px ${teamColor}35`,
                            }}
                          >
                            {team.shortName || team.name.slice(0, 3).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {team.name}
                            </h3>
                            <span
                              className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase"
                              style={{
                                backgroundColor: `${teamColor}15`,
                                color: teamColor,
                                border: `1px solid ${teamColor}30`,
                              }}
                            >
                              {team.shortName || 'OFICIAL'}
                            </span>
                          </div>
                        </div>

                        {/* Delete button (Only for organizers) */}
                        {canManageTeams() && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Deseas desvincular al equipo "${team.name}" de este torneo?`)) {
                                onDeleteTeam(team.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition-all shrink-0"
                            title="Eliminar equipo"
                            aria-label={`Eliminar equipo ${team.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Team Details Box */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F]/70 border border-slate-200/80 dark:border-slate-800/60 space-y-2 text-xs">
                        {/* Representative */}
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-500 dark:text-slate-400">Capitán:</span>
                          <span className="font-semibold truncate">{team.representative}</span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-slate-500 dark:text-slate-400">Contacto:</span>
                          <a
                            href={team.phone.startsWith('+') ? `tel:${team.phone}` : undefined}
                            className="font-medium truncate hover:text-emerald-500 transition-colors"
                          >
                            {team.phone}
                          </a>
                        </div>

                        {/* 1. Live player count */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            Plantilla:
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {teamPlayers.length} {teamPlayers.length === 1 ? 'Jugador' : 'Jugadores'}
                          </span>
                        </div>

                        {/* 2. Team payment status bar */}
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Inscripción:</span>
                            {isFullyPaid ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Sin Adeudo / Al Día
                              </span>
                            ) : (
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10.5px]">
                                Recaudado: ${collected.toLocaleString('es-MX')} / ${totalFee.toLocaleString('es-MX')} MXN
                              </span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFullyPaid 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                              }`}
                              style={{ width: `${feeProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Action buttons: La Tribuna + Gestionar Plantilla */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTeamForCommunity(team)}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30 active:scale-98 cursor-pointer shadow-xs"
                          title="Entrar a La Tribuna / Red Social del Club"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>La Tribuna</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTeamForRoster(team)}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700 active:scale-98 cursor-pointer shadow-xs truncate"
                          title={canManageRoster(team.id) ? 'Gestionar Plantilla' : 'Ver Plantilla'}
                        >
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span className="truncate">{canManageRoster(team.id) ? 'Plantilla' : 'Ver Roster'}</span>
                        </button>
                      </div>

                      {/* Card Footer: Alta Date */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Alta: {formatDate(team.createdAt)}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                          Habilitado
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ROL DE JUEGOS (CON CAPTURA DE MARCADOR) */}
      {activeTab === 'rol' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subheader: Jornadas Horizontal Tabs + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <span>Programación de Jornadas</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {tournamentMatchdays.length} {tournamentMatchdays.length === 1 ? 'Jornada' : 'Jornadas'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {canManageSchedules() && (
                <>
                  <button
                    onClick={() => {
                      onAddMatchday(tournament.id);
                      const nextNumber = tournamentMatchdays.length > 0 
                        ? Math.max(...tournamentMatchdays.map((m) => m.number)) + 1 
                        : 1;
                      setSelectedMatchdayNumber(nextNumber);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all min-h-[38px]"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    <span>+ Nueva Jornada</span>
                  </button>

                  <button
                    onClick={() => setIsNewMatchModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all min-h-[38px]"
                  >
                    <Swords className="w-4 h-4 stroke-[2.5]" />
                    <span>+ Programar Partido</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interactive Jornadas Tab Selector */}
          {tournamentMatchdays.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Aún no hay jornadas registradas para este torneo.</span>
              </div>
              {canManageSchedules() && (
                <button
                  onClick={() => {
                    onAddMatchday(tournament.id);
                    setSelectedMatchdayNumber(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  Crear Jornada 1
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tournamentMatchdays.map((md) => {
                const isSelected = md.number === effectiveMatchdayNumber;
                const matchesCount = tournamentMatches.filter((m) => m.matchdayNumber === md.number).length;

                return (
                  <button
                    key={md.id}
                    onClick={() => setSelectedMatchdayNumber(md.number)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{md.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {matchesCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Current Matchday Banner & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/70 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Jornada {effectiveMatchdayNumber}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {currentMatchdayMatches.length}{' '}
                  {currentMatchdayMatches.length === 1 ? 'partido programado' : 'partidos programados'}
                </span>
              </h3>
            </div>

            {canManageSchedules() && (
              <button
                onClick={() => setIsNewMatchModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Programar otro partido en esta jornada</span>
              </button>
            )}
          </div>

          {/* Matches List Grid */}
          {currentMatchdayMatches.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <Swords className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No hay partidos programados para la Jornada {effectiveMatchdayNumber}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Selecciona dos clubes de la liga, define la fecha, hora y cancha para armar el fixture oficial.
              </p>
              <button
                onClick={() => setIsNewMatchModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Programar Primer Partido</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {currentMatchdayMatches.map((match) => {
                const homeTeam = teams.find((t) => t.id === match.homeTeamId);
                const awayTeam = teams.find((t) => t.id === match.awayTeamId);

                const homeColor = homeTeam?.color || '#10B981';
                const awayColor = awayTeam?.color || '#2563EB';

                const isFinished = match.status === 'Finalizado' && match.homeScore !== undefined && match.awayScore !== undefined;
                const isLive = match.status === 'En Vivo';

                return (
                  <div
                    key={match.id}
                    className="group rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-card-dark transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Status accent side bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                        isFinished
                          ? 'bg-gradient-to-b from-slate-400 to-slate-500'
                          : isLive
                          ? 'bg-gradient-to-b from-amber-500 to-red-500 animate-pulse'
                          : 'bg-gradient-to-b from-emerald-500 to-teal-500'
                      }`}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                      {/* Left: Home Team */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-wider shadow-sm shrink-0"
                          style={{
                            backgroundColor: homeColor,
                            boxShadow: `0 4px 12px ${homeColor}30`,
                          }}
                        >
                          {homeTeam?.shortName || 'LOC'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                            Local
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {homeTeam?.name || 'Equipo Local'}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            Cap: {homeTeam?.representative || 'Por definir'}
                          </span>
                        </div>
                      </div>

                      {/* Center: Match Details & Scores */}
                      <div className="flex flex-col items-center justify-center py-2.5 px-3 sm:px-6 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/70 border border-slate-200/80 dark:border-slate-800/60 shrink-0 text-center min-w-[200px]">
                        {/* Stage Badge if Playoffs */}
                        {match.stage && match.stage !== 'Fase Regular' && (
                          <div className="mb-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              🏆 {match.stage}
                            </span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="mb-1.5">
                          {isFinished ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Finalizado
                            </span>
                          ) : isLive ? (
                            <LiveTimerBadge 
                              match={match} 
                              halfDurationMinutes={tournament.rules?.halfDurationMinutes ?? 35} 
                              size="md"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Programado
                            </span>
                          )}
                        </div>

                        {/* Big Score or Time Display */}
                        {isFinished || isLive ? (
                          <div className="flex items-center gap-3 my-0.5">
                            <span className={`text-2xl sm:text-3xl font-black ${
                              (match.homeScore ?? 0) > (match.awayScore ?? 0)
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {match.homeScore ?? 0}
                            </span>
                            <span className="text-base font-bold text-slate-400 select-none">-</span>
                            <span className={`text-2xl sm:text-3xl font-black ${
                              (match.awayScore ?? 0) > (match.homeScore ?? 0)
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {match.awayScore ?? 0}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 my-0.5">
                            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                              {match.time} hrs
                            </span>
                          </div>
                        )}

                        {/* Date and Field */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatMatchDate(match.date)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            {match.field}
                          </span>
                        </div>

                        {/* Attendance Roll Call Action Button */}
                        {(() => {
                          const att = attendances[match.id];
                          const totalInBench = (att?.homePresentPlayerIds?.length || 0) + (att?.awayPresentPlayerIds?.length || 0);

                          return (
                            <div className="mt-2.5 flex flex-col items-center gap-1 w-full">
                              <button
                                onClick={() => {
                                  setSelectedMatchForAttendance(match);
                                  setIsAttendanceModalOpen(true);
                                }}
                                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                  att?.isLocked
                                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                                }`}
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{canEditScores() ? '📋 Pasar Lista / Bancas' : '👥 Alineaciones Verificadas'}</span>
                              </button>

                              {att?.isLocked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Bancas Verificadas ({totalInBench} presentes)</span>
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Score Capture / Edit Action Button */}
                        {canEditScores() ? (
                          <button
                            onClick={() => {
                              setSelectedMatchForScore(match);
                              setIsScoreModalOpen(true);
                            }}
                            className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isFinished
                                ? 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#0B0F17] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
                                : isLive
                                ? 'text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-red-500/20 shadow-sm'
                                : 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 shadow-sm'
                            }`}
                          >
                            {isFinished ? (
                              <>
                                <Edit3 className="w-3 h-3" />
                                <span>Editar Marcador</span>
                              </>
                            ) : isLive ? (
                              <>
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                <span>⚡ Minuto a Minuto</span>
                              </>
                            ) : (
                              <>
                                <Trophy className="w-3 h-3 stroke-[2.5]" />
                                <span>+ Marcador / Iniciar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span
                            title="Solo Árbitros y Administradores pueden capturar o editar marcadores"
                            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                            <span>{isFinished ? 'Marcador Oficial' : 'Pendiente por Árbitro'}</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Away Team */}
                      <div className="flex items-center justify-start md:justify-end gap-3 flex-1 min-w-0 md:text-right">
                        <div className="min-w-0 order-2 md:order-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                            Visitante
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {awayTeam?.name || 'Equipo Visitante'}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            Cap: {awayTeam?.representative || 'Por definir'}
                          </span>
                        </div>

                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-wider shadow-sm shrink-0 order-1 md:order-2"
                          style={{
                            backgroundColor: awayColor,
                            boxShadow: `0 4px 12px ${awayColor}30`,
                          }}
                        >
                          {awayTeam?.shortName || 'VIS'}
                        </div>

                        {/* Delete Match Button */}
                        {canManageSchedules() && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Deseas eliminar el partido entre ${homeTeam?.name} y ${awayTeam?.name}?`)) {
                                onDeleteMatch(match.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition-all shrink-0 ml-2 order-3"
                            title="Eliminar partido"
                            aria-label="Eliminar partido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CREDENCIAL DIGITAL (JUGADOR) */}
      {activeTab === 'credencial' && currentUser && (
        <PlayerProfileView
          currentUser={currentUser}
          tournament={tournament}
          teams={tournamentTeams}
          matches={tournamentMatches}
          players={players}
          teamFinances={teamFinances}
        />
      )}

      {/* TAB CONTENT 3: TABLA DE POSICIONES (DINÁMICA Y AUTOMÁTICA SEGÚN REGLAMENTO) */}
      {activeTab === 'tabla' && (
        <StandingsTable
          teams={tournamentTeams}
          matches={tournamentMatches}
          tournamentName={tournament.name}
          tournamentId={tournament.id}
          rules={tournament.rules}
        />
      )}

      {/* TAB CONTENT 4: REGLAMENTO Y CONFIGURACIÓN DE PUNTUACIÓN */}
      {activeTab === 'reglas' && (
        <TournamentRulesConfig
          initialRules={tournament.rules}
          tournamentName={tournament.name}
          sport={tournament.sport}
          readOnly={!canManageRules()}
          onSave={(newRules) => {
            if (onUpdateTournamentRules) {
              onUpdateTournamentRules(tournament.id, newRules);
            }
          }}
        />
      )}

      {/* TAB CONTENT 5: CÉDULAS ARBITRALES (PLACEHOLDER SOBRIO) */}
      {activeTab === 'cedulas' && (
        <div className="rounded-2xl p-6 sm:p-10 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Control de partidos y arbitraje
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Módulo digital para captura en vivo de actas de juego, goles, tarjetas amarillas/rojas, incidentes y firma digital de los árbitros colegiados.
            </p>
          </div>

          {/* Visual Mockup Preview */}
          <div className="max-w-2xl mx-auto pt-2 opacity-75 pointer-events-none select-none">
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-[#070A0F]/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Cédula Oficial Electrónica</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Próxima Versión
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Amonestaciones</span>
                  <span className="font-bold text-amber-500">Control Tarjetas</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Goleo Individual</span>
                  <span className="font-bold text-emerald-500">Minuto a Minuto</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Validación</span>
                  <span className="font-bold text-blue-500">Firma Árbitro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Team Modal */}
      <NewTeamModal
        isOpen={isNewTeamModalOpen}
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        onClose={() => setIsNewTeamModalOpen(false)}
        onSave={(data) => {
          onAddTeam(data);
          setIsNewTeamModalOpen(false);
        }}
      />

      {/* New Match Modal */}
      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        tournamentId={tournament.id}
        tournamentVenue={tournament.venue}
        matchdayNumber={effectiveMatchdayNumber}
        teams={tournamentTeams}
        existingMatches={tournamentMatches}
        onSave={(matchData) => {
          onAddMatch(matchData);
          setIsNewMatchModalOpen(false);
        }}
      />

      {/* Score Modal */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        match={selectedMatchForScore}
        homeTeam={teams.find((t) => t.id === selectedMatchForScore?.homeTeamId)}
        awayTeam={teams.find((t) => t.id === selectedMatchForScore?.awayTeamId)}
        rules={tournament.rules}
        players={players}
        tournament={tournament}
        allMatches={tournamentMatches}
        allAttendances={attendances}
        onClose={() => {
          setIsScoreModalOpen(false);
          setSelectedMatchForScore(null);
        }}
        onSave={(matchId, homeScore, awayScore, status, homePenalties, awayPenalties, penaltyWinnerId, liveMinute, liveStage, timerData) => {
          onUpdateScore(matchId, homeScore, awayScore, status, homePenalties, awayPenalties, penaltyWinnerId, liveMinute, liveStage, timerData);
          setIsScoreModalOpen(false);
          setSelectedMatchForScore(null);
        }}
      />

      {/* Attendance and Bench Photo Roll Call Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        match={selectedMatchForAttendance}
        tournament={tournament}
        homeTeam={teams.find((t) => t.id === selectedMatchForAttendance?.homeTeamId)}
        awayTeam={teams.find((t) => t.id === selectedMatchForAttendance?.awayTeamId)}
        players={players}
        allMatches={tournamentMatches}
        allAttendances={attendances}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedMatchForAttendance(null);
        }}
        onSaveAttendance={(newAttendance) => {
          handleSaveAttendance(newAttendance);
        }}
      />
    </div>
  );
};
