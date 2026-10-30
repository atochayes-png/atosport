import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { StatsCards } from './components/StatsCards';
import { TournamentsView } from './components/TournamentsView';
import { TournamentDetailView } from './components/TournamentDetailView';
import { LiveScoresView } from './components/LiveScoresView';
import { NewTournamentModal } from './components/NewTournamentModal';
import { Tournament, TournamentStatus, TournamentRules, DEFAULT_TOURNAMENT_RULES } from './types/tournament';
import { Team } from './types/team';
import { Match, Matchday, MatchStatus } from './types/match';
import { Player, TeamFinance } from './types/player';
import { INITIAL_TEAMS } from './data/initialTeams';
import { INITIAL_MATCHDAYS, INITIAL_MATCHES } from './data/initialMatches';
import { INITIAL_PLAYERS, INITIAL_TEAM_FINANCES } from './data/initialPlayers';
import { CheckCircle2, Shield } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { LiveMatchesBanner } from './components/LiveMatchesBanner';
import { ScoreModal } from './components/ScoreModal';
import { ClubCommunityView } from './components/community/ClubCommunityView';
import { MasterControlPanel } from './components/MasterControlPanel';
import { useRealtimeLiveMatches, broadcastMatchLiveUpdate, MatchLiveUpdatePayload } from './services/realtimeMatchService';

const STORAGE_KEY = 'atosport_tournaments';
const TEAMS_STORAGE_KEY = 'atosport_teams';
const MATCHDAYS_STORAGE_KEY = 'atosport_matchdays';
const MATCHES_STORAGE_KEY = 'atosport_matches';
const PLAYERS_STORAGE_KEY = 'atosport_players';
const FINANCES_STORAGE_KEY = 'atosport_team_finances';

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: 'Liga Premier Nocturna 2026',
    sport: 'Fútbol 7',
    venue: 'Complejo Deportivo El Retiro - Cancha 1',
    season: 'Apertura 2026',
    status: 'Activo',
    teamsCount: 14,
    maxTeams: 16,
    rules: {
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      penaltiesEnabled: true,
      pointsPenaltiesWin: 2,
      pointsPenaltiesLoss: 1,
      tieBreakerPriority: 'Diferencia de Goles',
      minMatchesForPlayoffs: 6,
      blockIneligiblePlayoffs: true,
      halfDurationMinutes: 35,
      totalPeriods: 2,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 't-2',
    name: 'Copa Metropolitana Élite',
    sport: 'Fútbol 11',
    venue: 'Estadio Olímpico Municipal',
    season: 'Clausura 2026',
    status: 'En Inscripciones',
    teamsCount: 8,
    maxTeams: 20,
    rules: { ...DEFAULT_TOURNAMENT_RULES },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 't-3',
    name: 'Torneo Intercolegial de Futsal',
    sport: 'Futsal',
    venue: 'Polideportivo Norte - Sala A',
    season: 'Verano 2026',
    status: 'Próximo',
    teamsCount: 6,
    maxTeams: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 't-4',
    name: 'Circuito Regional de Básquetbol',
    sport: 'Básquetbol',
    venue: 'Gimnasio Techado Municipal',
    season: 'Temporada Regular 2026',
    status: 'Activo',
    teamsCount: 10,
    maxTeams: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

type AppTab = 'dashboard' | 'tournaments' | 'scores' | 'community' | 'master';

const getInitialTab = (): AppTab => {
  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('master') || hash.includes('master')) return 'master';
    if (path.includes('tribuna') || hash.includes('tribuna') || path.includes('community') || hash.includes('community')) return 'community';
    if (path.includes('scores') || hash.includes('scores') || path.includes('marcadores') || hash.includes('marcadores')) return 'scores';
    if (path.includes('tournaments') || hash.includes('tournaments') || path.includes('torneos') || hash.includes('torneos')) return 'tournaments';
    if (path.includes('panel') || hash.includes('panel')) return 'dashboard';
  } catch {
    // fallback
  }
  return 'dashboard';
};

function AppContent() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<AppTab>(getInitialTab);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedCommunityTeamId, setSelectedCommunityTeamId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatchForScore, setActiveMatchForScore] = useState<Match | null>(null);

  // Sincronizar rutas del navegador (ej: /master, /panel, /tribuna, etc.)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentTab(getInitialTab());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);
  
  // Load initial tournaments with localStorage synchronization
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading tournaments from localStorage, using defaults:', e);
    }
    return INITIAL_TOURNAMENTS;
  });

  // Load teams with localStorage synchronization
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading teams from localStorage, using defaults:', e);
    }
    return INITIAL_TEAMS;
  });

  // Load matchdays with localStorage synchronization
  const [matchdays, setMatchdays] = useState<Matchday[]>(() => {
    try {
      const saved = localStorage.getItem(MATCHDAYS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading matchdays from localStorage, using defaults:', e);
    }
    return INITIAL_MATCHDAYS;
  });

  // Load matches with localStorage synchronization
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(MATCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading matches from localStorage, using defaults:', e);
    }
    return INITIAL_MATCHES;
  });

  // Load players with localStorage synchronization
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(PLAYERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading players from localStorage, using defaults:', e);
    }
    return INITIAL_PLAYERS;
  });

  // Load team finances with localStorage synchronization
  const [teamFinances, setTeamFinances] = useState<TeamFinance[]>(() => {
    try {
      const saved = localStorage.getItem(FINANCES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading team finances from localStorage, using defaults:', e);
    }
    return INITIAL_TEAM_FINANCES;
  });

  // Sync players with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
    } catch (e) {
      console.error('Error saving players to localStorage:', e);
    }
  }, [players]);

  // Sync team finances with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FINANCES_STORAGE_KEY, JSON.stringify(teamFinances));
    } catch (e) {
      console.error('Error saving team finances to localStorage:', e);
    }
  }, [teamFinances]);

  const [notification, setNotification] = useState<string | null>(null);

  // Sync tournaments with localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
    } catch (e) {
      console.error('Error saving tournaments to localStorage:', e);
    }
  }, [tournaments]);

  // Sync teams with localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } catch (e) {
      console.error('Error saving teams to localStorage:', e);
    }
  }, [teams]);

  // Sync matchdays with localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(MATCHDAYS_STORAGE_KEY, JSON.stringify(matchdays));
    } catch (e) {
      console.error('Error saving matchdays to localStorage:', e);
    }
  }, [matchdays]);

  // Sync matches with localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
    } catch (e) {
      console.error('Error saving matches to localStorage:', e);
    }
  }, [matches]);

  // Sincronización en Tiempo Real Multidispositivo con Supabase Realtime
  useRealtimeLiveMatches((payload: MatchLiveUpdatePayload) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === payload.matchId
          ? {
              ...m,
              homeScore: payload.homeScore,
              awayScore: payload.awayScore,
              status: payload.status,
              period: payload.period,
              startedAt: payload.startedAt,
              secondHalfStartedAt: payload.secondHalfStartedAt,
              firstHalfDurationSeconds: payload.firstHalfDurationSeconds,
              isTimerRunning: payload.isTimerRunning,
              liveMinute: payload.liveMinute,
              liveStage: payload.liveStage,
              homePenalties: payload.homePenalties,
              awayPenalties: payload.awayPenalties,
              penaltyWinnerId: payload.penaltyWinnerId,
            }
          : m
      )
    );

    const target = matches.find((m) => m.id === payload.matchId);
    if (target) {
      const home = teams.find((t) => t.id === target.homeTeamId)?.name || 'Local';
      const away = teams.find((t) => t.id === target.awayTeamId)?.name || 'Visitante';
      setNotification(`⚡ [Realtime] En vivo: ${home} ${payload.homeScore} - ${payload.awayScore} ${away}`);
      setTimeout(() => setNotification(null), 3000);
    }
  });

  // Synchronize registered teams count with tournament stats
  useEffect(() => {
    setTournaments((prev) =>
      prev.map((t) => {
        const count = teams.filter((team) => team.tournamentId === t.id).length;
        if (t.teamsCount !== count) {
          return { ...t, teamsCount: count };
        }
        return t;
      })
    );
  }, [teams]);

  const handleCreateTournament = (
    data: Omit<Tournament, 'id' | 'createdAt'>
  ) => {
    const newTournament: Tournament = {
      ...data,
      id: `t-${Date.now()}`,
      teamsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setTournaments((prev) => {
      const updated = [newTournament, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving new tournament to localStorage:', e);
      }
      return updated;
    });

    // Create default Jornada 1 for the new tournament
    const defaultMatchday: Matchday = {
      id: `md-${newTournament.id}-1`,
      tournamentId: newTournament.id,
      number: 1,
      name: 'Jornada 1',
      createdAt: new Date().toISOString(),
    };
    setMatchdays((prev) => [...prev, defaultMatchday]);

    // Close modal, show toast, and select the newly created tournament directly
    setIsModalOpen(false);
    setSelectedTournamentId(newTournament.id);
    setCurrentTab('tournaments');
    setNotification(`¡Torneo "${data.name}" creado con éxito! Puedes inscribir equipos y programar jornadas.`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleDeleteTournament = (id: string) => {
    setTournaments((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating localStorage after tournament delete:', e);
      }
      return updated;
    });

    // Also remove any teams linked to this tournament
    setTeams((prev) => {
      const updated = prev.filter((team) => team.tournamentId !== id);
      try {
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error deleting tournament teams from localStorage:', e);
      }
      return updated;
    });

    // Also remove matchdays and matches
    setMatchdays((prev) => prev.filter((md) => md.tournamentId !== id));
    setMatches((prev) => prev.filter((m) => m.tournamentId !== id));

    if (selectedTournamentId === id) {
      setSelectedTournamentId(null);
    }

    setNotification('Torneo eliminado del registro.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateTournamentStatus = (tournamentId: string, newStatus: TournamentStatus) => {
    setTournaments((prev) => {
      const updated = prev.map((t) => (t.id === tournamentId ? { ...t, status: newStatus } : t));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving updated tournament status to localStorage:', e);
      }
      return updated;
    });

    const displayLabel = newStatus === 'Activo' ? 'Activo / En Curso' : newStatus;
    setNotification(`Estado del torneo actualizado a "${displayLabel}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTeams((prev) => [newTeam, ...prev]);

    setNotification(`¡Equipo "${teamData.name}" inscrito exitosamente!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteTeam = (teamId: string) => {
    const teamToRemove = teams.find((t) => t.id === teamId);
    if (!teamToRemove) return;

    setTeams((prev) => prev.filter((t) => t.id !== teamId));

    // Also remove matches where this team played
    setMatches((prev) => prev.filter((m) => m.homeTeamId !== teamId && m.awayTeamId !== teamId));

    setNotification(`Equipo "${teamToRemove.name}" eliminado del torneo.`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add a new matchday
  const handleAddMatchday = (tournamentId: string) => {
    const existingForTournament = matchdays.filter((md) => md.tournamentId === tournamentId);
    const nextNumber = existingForTournament.length > 0 
      ? Math.max(...existingForTournament.map((md) => md.number)) + 1 
      : 1;

    const newMatchday: Matchday = {
      id: `md-${tournamentId}-${nextNumber}`,
      tournamentId,
      number: nextNumber,
      name: `Jornada ${nextNumber}`,
      createdAt: new Date().toISOString(),
    };

    setMatchdays((prev) => [...prev, newMatchday]);
    setNotification(`¡Jornada ${nextNumber} agregada al rol de juegos!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add a new scheduled match
  const handleAddMatch = (matchData: Omit<Match, 'id' | 'createdAt'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `m-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setMatches((prev) => [newMatch, ...prev]);

    const home = teams.find((t) => t.id === matchData.homeTeamId)?.name || 'Local';
    const away = teams.find((t) => t.id === matchData.awayTeamId)?.name || 'Visita';
    setNotification(`¡Partido programado: ${home} vs ${away}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Delete a scheduled match
  const handleDeleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setNotification('Partido eliminado de la jornada.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Update match score and status (including penalty shootouts)
  const handleUpdateScore = (
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
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { 
              ...m, 
              homeScore, 
              awayScore, 
              status,
              homePenalties,
              awayPenalties,
              penaltyWinnerId,
              liveMinute,
              liveStage,
              ...(timerData || {})
            }
          : m
      )
    );

    const targetMatch = matches.find((m) => m.id === matchId);
    const home = teams.find((t) => t.id === targetMatch?.homeTeamId)?.name || 'Local';
    const away = teams.find((t) => t.id === targetMatch?.awayTeamId)?.name || 'Visitante';

    // Emisión en tiempo real vía Supabase Realtime para espectadores y dispositivos remotos
    broadcastMatchLiveUpdate({
      matchId,
      tournamentId: targetMatch?.tournamentId || '',
      status,
      period: timerData?.period,
      homeScore,
      awayScore,
      startedAt: timerData?.startedAt,
      secondHalfStartedAt: timerData?.secondHalfStartedAt,
      firstHalfDurationSeconds: timerData?.firstHalfDurationSeconds,
      isTimerRunning: timerData?.isTimerRunning,
      liveMinute,
      liveStage,
      homePenalties,
      awayPenalties,
      penaltyWinnerId,
      updatedAt: Date.now(),
    });

    if (status === 'En Vivo') {
      const timeStr = liveMinute ? `${liveStage ? `${liveStage} ` : ''}${liveMinute}` : (liveStage || 'En Vivo');
      setNotification(`🔴 ¡Partido en vivo: ${home} ${homeScore} - ${awayScore} ${away} (${timeStr})!`);
    } else if (homePenalties !== undefined && awayPenalties !== undefined) {
      const winnerName = penaltyWinnerId === targetMatch?.homeTeamId ? home : away;
      setNotification(`¡Marcador oficial: ${home} ${homeScore} (${homePenalties}) - (${awayPenalties}) ${awayScore} ${away}! Gana ${winnerName} en penales.`);
    } else {
      setNotification(`🏁 ¡Marcador final registrado: ${home} ${homeScore} - ${awayScore} ${away}!`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Update tournament scoring rules and tiebreaker settings
  const handleUpdateTournamentRules = (tournamentId: string, rules: TournamentRules) => {
    setTournaments((prev) => {
      const updated = prev.map((t) => (t.id === tournamentId ? { ...t, rules } : t));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving updated tournament rules to localStorage:', e);
      }
      return updated;
    });

    setNotification('¡Reglamento y sistema de puntuación actualizados!');
    setTimeout(() => setNotification(null), 3500);
  };

  // Player roster and finance management handlers
  const handleAddPlayer = (playerData: Omit<Player, 'id' | 'createdAt'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlayers((prev) => [newPlayer, ...prev]);
    setNotification(`¡Jugador #${newPlayer.number} "${newPlayer.name}" registrado en la plantilla!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdatePlayer = (playerId: string, updatedFields: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, ...updatedFields } : p))
    );
    const target = players.find((p) => p.id === playerId);
    setNotification(`Ficha del jugador "${target?.name || ''}" actualizada.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeletePlayer = (playerId: string) => {
    const target = players.find((p) => p.id === playerId);
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setNotification(`Jugador "${target?.name || ''}" dado de baja de la plantilla.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateFinance = (teamId: string, financeData: Partial<TeamFinance>) => {
    setTeamFinances((prev) => {
      const exists = prev.some((f) => f.teamId === teamId);
      if (exists) {
        return prev.map((f) => (f.teamId === teamId ? { ...f, ...financeData } : f));
      } else {
        return [
          ...prev,
          {
            teamId,
            tournamentId: financeData.tournamentId || '',
            totalTeamFee: financeData.totalTeamFee ?? 4200,
            suggestedPlayerFee: financeData.suggestedPlayerFee ?? 350,
          },
        ];
      }
    });
    setNotification('Parámetros financieros del equipo actualizados.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNavigate = (tab: AppTab) => {
    setSelectedTournamentId(null);
    setCurrentTab(tab);
    try {
      const targetPath = tab === 'dashboard' ? '/panel' : tab === 'community' ? '/tribuna' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If no user is authenticated, render the dedicated Login / Registration screen
  if (!currentUser) {
    return <LoginView />;
  }

  // Find currently active tournament for detail view
  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A0F] text-slate-900 dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-500 pb-20 md:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/50 text-slate-900 dark:text-white shadow-xl dark:shadow-emerald-glow animate-in slide-in-from-bottom duration-300 max-w-[90vw]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold truncate">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenNewTournament={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedTournament ? (
          <TournamentDetailView
            tournament={selectedTournament}
            teams={teams}
            matchdays={matchdays}
            matches={matches}
            players={players}
            teamFinances={teamFinances}
            onBack={() => {
              setSelectedTournamentId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
            onAddMatchday={handleAddMatchday}
            onAddMatch={handleAddMatch}
            onDeleteMatch={handleDeleteMatch}
            onUpdateScore={handleUpdateScore}
            onUpdateStatus={handleUpdateTournamentStatus}
            onUpdateTournamentRules={handleUpdateTournamentRules}
            onAddPlayer={handleAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
            onUpdateFinance={handleUpdateFinance}
            onDeleteTournament={handleDeleteTournament}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                  <LiveMatchesBanner
                    matches={matches}
                    teams={teams}
                    tournaments={tournaments}
                    onOpenMatchScore={(m) => setActiveMatchForScore(m)}
                  />
                </div>
                <Hero
                  onOpenNewTournament={() => setIsModalOpen(true)}
                  onExploreTournaments={() => {
                    setSelectedTournamentId(null);
                    setCurrentTab('tournaments');
                  }}
                />
                <StatsCards tournaments={tournaments} />
                <TournamentsView
                  tournaments={tournaments}
                  onOpenNewTournament={() => setIsModalOpen(true)}
                  onDeleteTournament={handleDeleteTournament}
                  onSelectTournament={(t) => {
                    setSelectedTournamentId(t.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {currentTab === 'tournaments' && (
              <TournamentsView
                tournaments={tournaments}
                onOpenNewTournament={() => setIsModalOpen(true)}
                onDeleteTournament={handleDeleteTournament}
                onSelectTournament={(t) => {
                  setSelectedTournamentId(t.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'scores' && (
              <LiveScoresView
                matches={matches}
                teams={teams}
                tournaments={tournaments}
                onOpenMatchScore={(m) => setActiveMatchForScore(m)}
              />
            )}

            {currentTab === 'community' && (() => {
              const activeCommunityTeam = 
                (selectedCommunityTeamId && teams.find((t) => t.id === selectedCommunityTeamId)) ||
                (currentUser?.teamId && teams.find((t) => t.id === currentUser.teamId)) ||
                teams[0];

              if (!activeCommunityTeam) {
                return (
                  <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
                    <Shield className="w-12 h-12 text-slate-400 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      No hay clubes registrados todavía
                    </h3>
                    <p className="text-xs text-slate-400">
                      Inscribe un equipo en un torneo para activar su comunidad privada.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Selector rápido de Clubes para navegación multitenant */}
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">Comunidad de:</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {teams.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedCommunityTeamId(t.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                              activeCommunityTeam.id === t.id
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: t.color || '#10B981' }}
                            />
                            <span className="truncate max-w-[120px]">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ClubCommunityView
                    team={activeCommunityTeam}
                    players={players.filter((p) => p.teamId === activeCommunityTeam.id)}
                    tournamentName={tournaments.find((t) => t.id === activeCommunityTeam.tournamentId)?.name}
                    onBack={() => handleNavigate('dashboard')}
                  />
                </div>
              );
            })()}

            {currentTab === 'master' && (
              <MasterControlPanel
                tournaments={tournaments}
                teams={teams}
                matches={matches}
                players={players}
                onOpenNewTournament={() => setIsModalOpen(true)}
                onSelectTournament={(t) => {
                  setSelectedTournamentId(t.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDeleteTournament={handleDeleteTournament}
                onNavigateTab={handleNavigate}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070A0F] py-6 sm:py-8 mt-12 sm:mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/logo-atosport.png" alt="ATOSPORT" className="w-5 h-5 object-contain rounded drop-shadow-sm shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">ATOSPORT SaaS</span>
            <span className="hidden sm:inline">— Plataforma Deportiva Profesional</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} ATOSPORT. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenNewTournament={() => setIsModalOpen(true)}
      />

      {/* Responsive New Tournament Modal */}
      <NewTournamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTournament}
      />

      {/* Quick Score Modal from Live Matches Banner */}
      {activeMatchForScore && (
        <ScoreModal
          isOpen={Boolean(activeMatchForScore)}
          match={activeMatchForScore}
          homeTeam={teams.find((t) => t.id === activeMatchForScore.homeTeamId)}
          awayTeam={teams.find((t) => t.id === activeMatchForScore.awayTeamId)}
          rules={tournaments.find((t) => t.id === activeMatchForScore.tournamentId)?.rules}
          players={players}
          tournament={tournaments.find((t) => t.id === activeMatchForScore.tournamentId)}
          allMatches={matches}
          onClose={() => setActiveMatchForScore(null)}
          onSave={(matchId, homeScore, awayScore, status, homePenalties, awayPenalties, penaltyWinnerId, liveMinute, liveStage, timerData) => {
            handleUpdateScore(matchId, homeScore, awayScore, status, homePenalties, awayPenalties, penaltyWinnerId, liveMinute, liveStage, timerData);
            setActiveMatchForScore(null);
          }}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
