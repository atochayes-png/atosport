import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Table as TableIcon, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Shield, 
  Scale, 
  Radio, 
  Settings2, 
  SlidersHorizontal, 
  History
} from 'lucide-react';
import { Team } from '../types/team';
import { Match } from '../types/match';
import { TournamentRules, InitialTeamStats, DEFAULT_TOURNAMENT_RULES } from '../types/tournament';
import { useAuth } from '../context/AuthContext';
import { InitialStandingsModal } from './InitialStandingsModal';

interface StandingsTableProps {
  teams: Team[];
  matches: Match[];
  tournamentName: string;
  tournamentId?: string;
  rules?: TournamentRules;
}

export type MatchResultForm = 'G' | 'E' | 'P';

export interface TeamStanding {
  team: Team;
  played: number;        // JJ
  won: number;           // JG
  drawn: number;         // JE
  lost: number;          // JP
  penaltiesWon: number;  // GP / PE
  penaltiesLost: number; // PP
  goalsFor: number;      // GF
  goalsAgainst: number;  // GC
  goalDifference: number;// DIF (GF - GC)
  penaltyPoints: number; // PEN (Puntos de penalización / descuento)
  points: number;        // PTS calculados
  yellowCards: number;   // TA
  redCards: number;      // TR
  form: MatchResultForm[];// FORMA (últimos 5 resultados)
  hasInitialData?: boolean;
}

interface ColumnVisibility {
  penalties: boolean;      // GP / PP
  penaltyPoints: boolean;  // PEN
  cards: boolean;          // TA / TR
  form: boolean;           // FORMA
}

function computeHybridStandings(
  teams: Team[],
  targetMatches: Match[],
  rules: TournamentRules,
  initialStatsMap: Record<string, InitialTeamStats>
): TeamStanding[] {
  // Sort matches chronologically for form streak computation
  const sortedMatches = [...targetMatches].sort(
    (a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
  );

  const standings: TeamStanding[] = teams.map((team) => {
    const initial = initialStatsMap[team.id] || {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      penaltiesWon: 0,
      penaltiesLost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      penaltyPoints: 0,
      yellowCards: 0,
      redCards: 0,
    };

    let matchPlayed = 0;
    let matchWon = 0;
    let matchDrawn = 0;
    let matchLost = 0;
    let matchPenWon = 0;
    let matchPenLost = 0;
    let matchGf = 0;
    let matchGc = 0;

    const matchHistory: MatchResultForm[] = [];

    sortedMatches.forEach((m) => {
      const isHome = m.homeTeamId === team.id;
      const isAway = m.awayTeamId === team.id;

      if (!isHome && !isAway) return;

      const hScore = m.homeScore ?? 0;
      const aScore = m.awayScore ?? 0;

      matchPlayed += 1;

      if (isHome) {
        matchGf += hScore;
        matchGc += aScore;
        if (hScore > aScore) {
          matchWon += 1;
          matchHistory.push('G');
        } else if (hScore < aScore) {
          matchLost += 1;
          matchHistory.push('P');
        } else {
          matchDrawn += 1;
          if (rules.penaltiesEnabled && m.penaltyWinnerId) {
            if (m.penaltyWinnerId === team.id) {
              matchPenWon += 1;
              matchHistory.push('G');
            } else {
              matchPenLost += 1;
              matchHistory.push('P');
            }
          } else {
            matchHistory.push('E');
          }
        }
      } else {
        matchGf += aScore;
        matchGc += hScore;
        if (aScore > hScore) {
          matchWon += 1;
          matchHistory.push('G');
        } else if (aScore < hScore) {
          matchLost += 1;
          matchHistory.push('P');
        } else {
          matchDrawn += 1;
          if (rules.penaltiesEnabled && m.penaltyWinnerId) {
            if (m.penaltyWinnerId === team.id) {
              matchPenWon += 1;
              matchHistory.push('G');
            } else {
              matchPenLost += 1;
              matchHistory.push('P');
            }
          } else {
            matchHistory.push('E');
          }
        }
      }
    });

    // Form: last 5 matches
    const form = matchHistory.slice(-5);

    // Hybrid calculation: Initial Base + Matches Played on Platform
    const played = (initial.played || 0) + matchPlayed;
    const won = (initial.won || 0) + matchWon;
    const drawn = (initial.drawn || 0) + matchDrawn;
    const lost = (initial.lost || 0) + matchLost;
    const penaltiesWon = (initial.penaltiesWon || 0) + matchPenWon;
    const penaltiesLost = (initial.penaltiesLost || 0) + matchPenLost;
    const goalsFor = (initial.goalsFor || 0) + matchGf;
    const goalsAgainst = (initial.goalsAgainst || 0) + matchGc;
    const penaltyPoints = initial.penaltyPoints || 0;
    const yellowCards = initial.yellowCards || 0;
    const redCards = initial.redCards || 0;

    const goalDifference = goalsFor - goalsAgainst;

    // Calculate Points with tournament scoring rules and penalties
    let points = 0;
    points += won * rules.pointsWin;
    points += lost * rules.pointsLoss;

    if (rules.penaltiesEnabled) {
      points += penaltiesWon * rules.pointsPenaltiesWin;
      points += penaltiesLost * rules.pointsPenaltiesLoss;
      const remainingDraws = Math.max(0, drawn - penaltiesWon - penaltiesLost);
      points += remainingDraws * rules.pointsDraw;
    } else {
      points += drawn * rules.pointsDraw;
    }

    // Deduct penalty points (sanctions)
    points -= penaltyPoints;
    points = Math.max(0, points);

    const hasInitialData = Boolean(
      initial.played || initial.won || initial.drawn || initial.lost ||
      initial.goalsFor || initial.goalsAgainst || initial.penaltyPoints ||
      initial.yellowCards || initial.redCards
    );

    return {
      team,
      played,
      won,
      drawn,
      lost,
      penaltiesWon,
      penaltiesLost,
      goalsFor,
      goalsAgainst,
      goalDifference,
      penaltyPoints,
      points,
      yellowCards,
      redCards,
      form,
      hasInitialData,
    };
  });

  // Head to head resolver for tied teams
  const getHeadToHeadDiff = (teamAId: string, teamBId: string) => {
    let aPoints = 0;
    let bPoints = 0;

    sortedMatches.forEach((m) => {
      const matchInvolvesBoth =
        (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId);

      if (!matchInvolvesBoth) return;

      const aScore = m.homeTeamId === teamAId ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const bScore = m.homeTeamId === teamAId ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

      if (aScore > bScore) {
        aPoints += rules.pointsWin;
        bPoints += rules.pointsLoss;
      } else if (bScore > aScore) {
        bPoints += rules.pointsWin;
        aPoints += rules.pointsLoss;
      } else {
        if (rules.penaltiesEnabled && m.penaltyWinnerId) {
          if (m.penaltyWinnerId === teamAId) {
            aPoints += rules.pointsPenaltiesWin;
            bPoints += rules.pointsPenaltiesLoss;
          } else {
            bPoints += rules.pointsPenaltiesWin;
            aPoints += rules.pointsPenaltiesLoss;
          }
        } else {
          aPoints += rules.pointsDraw;
          bPoints += rules.pointsDraw;
        }
      }
    });

    return bPoints - aPoints;
  };

  // Standings sort criteria:
  // 1. Points desc
  // 2. Tiebreaker Priority
  // 3. Fair Play (cards asc)
  // 4. Alphabetical
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    if (rules.tieBreakerPriority === 'Goles a Favor') {
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    } else if (rules.tieBreakerPriority === 'Enfrentamiento Directo') {
      const h2h = getHeadToHeadDiff(a.team.id, b.team.id);
      if (h2h !== 0) return h2h;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    } else {
      // Default: Diferencia de Goles
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    }

    // Fair play tie-break: fewest red cards, then yellow cards
    if (a.redCards !== b.redCards) return a.redCards - b.redCards;
    if (a.yellowCards !== b.yellowCards) return a.yellowCards - b.yellowCards;

    return a.team.name.localeCompare(b.team.name);
  });

  return standings;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  tournamentName,
  tournamentId = 't-default',
  rules,
}) => {
  const effectiveRules: TournamentRules = rules || DEFAULT_TOURNAMENT_RULES;
  const { canManageTournaments, canManageRules } = useAuth();
  const canEditInitial = canManageTournaments() || canManageRules();

  const [tableMode, setTableMode] = useState<'oficial' | 'en_vivo'>('oficial');
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(false);
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef<HTMLDivElement>(null);

  // Column visibility state
  const [columns, setColumns] = useState<ColumnVisibility>({
    penalties: Boolean(effectiveRules.penaltiesEnabled),
    penaltyPoints: true,
    cards: true,
    form: true,
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setIsColumnsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize column penalties with tournament rules
  useEffect(() => {
    if (effectiveRules.penaltiesEnabled) {
      setColumns((prev) => ({ ...prev, penalties: true }));
    }
  }, [effectiveRules.penaltiesEnabled]);

  // Load initial historical stats from localStorage
  const storageKey = `atosport_tournament_initial_stats_${tournamentId}`;
  const [initialStatsMap, setInitialStatsMap] = useState<Record<string, InitialTeamStats>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading initial stats from localStorage:', e);
    }
    return {};
  });

  const handleSaveInitialStats = (newMap: Record<string, InitialTeamStats>) => {
    setInitialStatsMap(newMap);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving initial stats:', e);
    }
  };

  const hasAnyInitialStats = useMemo(() => {
    return Object.values(initialStatsMap).some(
      (s) => (s.played || 0) > 0 || (s.goalsFor || 0) > 0 || (s.penaltyPoints || 0) > 0
    );
  }, [initialStatsMap]);

  // Finished matches (Official table)
  const finishedMatches = useMemo(
    () => matches.filter((m) => m.status === 'Finalizado'),
    [matches]
  );

  // Live matches
  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === 'En Vivo'),
    [matches]
  );
  const hasLiveMatches = liveMatches.length > 0;

  // Virtual matches: Finished + Live In-Progress
  const virtualMatches = useMemo(
    () => matches.filter((m) => m.status === 'Finalizado' || m.status === 'En Vivo'),
    [matches]
  );

  // Compute Official Standings (Hybrid: Initial + Finished)
  const officialStandings = useMemo(() => {
    return computeHybridStandings(teams, finishedMatches, effectiveRules, initialStatsMap);
  }, [teams, finishedMatches, effectiveRules, initialStatsMap]);

  // Compute Virtual Standings (Hybrid: Initial + Finished + Live)
  const virtualStandings = useMemo(() => {
    return computeHybridStandings(teams, virtualMatches, effectiveRules, initialStatsMap);
  }, [teams, virtualMatches, effectiveRules, initialStatsMap]);

  // Map of teamId -> Official position (1-indexed)
  const officialRanks = useMemo(() => {
    const map = new Map<string, number>();
    officialStandings.forEach((item, index) => {
      map.set(item.team.id, index + 1);
    });
    return map;
  }, [officialStandings]);

  // Select active standings based on toggle
  const standings = tableMode === 'en_vivo' ? virtualStandings : officialStandings;
  const currentComputedMatches = tableMode === 'en_vivo' ? virtualMatches : finishedMatches;

  const totalGoals = currentComputedMatches.reduce(
    (acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0
  );

  const toggleColumn = (key: keyof ColumnVisibility) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Standings Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Disputed Matches */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {tableMode === 'en_vivo' ? 'Partidos Computados' : 'Partidos Jugados'}
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {currentComputedMatches.length}{' '}
              <span className="text-xs font-semibold text-slate-400">/ {matches.length} programados</span>
            </p>
          </div>
        </div>

        {/* Goals Scored */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Goles {tableMode === 'en_vivo' ? 'al Momento' : 'Oficiales'}
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {totalGoals} <span className="text-xs font-semibold text-slate-400">goles totales</span>
            </p>
          </div>
        </div>

        {/* Leader Club */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Líder {tableMode === 'en_vivo' ? 'Virtual' : 'General'}
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {standings[0]?.team.name || 'Sin definir'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Standings Table Container */}
      <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Title, Action Controls, and Mode Switcher */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              tableMode === 'en_vivo'
                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {tableMode === 'en_vivo' ? <Radio className="w-5 h-5 animate-pulse" /> : <TableIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {tableMode === 'en_vivo' ? 'Tabla de Posiciones Virtual (En Vivo)' : 'Tabla General de Posiciones (Oficial)'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Scale className="w-3 h-3 text-emerald-500" />
                  {effectiveRules.pointsWin}-{effectiveRules.pointsDraw}-{effectiveRules.pointsLoss} pts
                  {effectiveRules.penaltiesEnabled && ` (Pen: +${effectiveRules.pointsPenaltiesWin}/+${effectiveRules.pointsPenaltiesLoss})`}
                </span>
                {hasAnyInitialStats && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    <History className="w-3 h-3 text-amber-500" />
                    Base Histórica Activa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Torneo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tournamentName}</span> • Desempate: <strong className="text-slate-700 dark:text-slate-300">{effectiveRules.tieBreakerPriority}</strong>
              </p>
            </div>
          </div>

          {/* Action Toolbar: Toggle Official/Live, Column Visibility, and Initial Standings Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle: Oficial vs En Vivo */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
              <button
                type="button"
                onClick={() => setTableMode('oficial')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tableMode === 'oficial'
                    ? 'bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Oficial
              </button>

              <button
                type="button"
                onClick={() => setTableMode('en_vivo')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tableMode === 'en_vivo'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                {hasLiveMatches && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
                <span>En Vivo / Virtual</span>
                {hasLiveMatches && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    tableMode === 'en_vivo' ? 'bg-red-800/80 text-white' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {liveMatches.length}
                  </span>
                )}
              </button>
            </div>

            {/* Column Visibility Selector Dropdown */}
            <div className="relative" ref={columnsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsColumnsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all shadow-xs"
                title="Configurar visibilidad de columnas"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columnas</span>
              </button>

              {isColumnsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2.5 py-1 block tracking-wider">
                    Columnas Visibles
                  </span>

                  <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer">
                    <span>Penales (GP / PP)</span>
                    <input
                      type="checkbox"
                      checked={columns.penalties}
                      onChange={() => toggleColumn('penalties')}
                      className="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer">
                    <span>Sanciones (PEN)</span>
                    <input
                      type="checkbox"
                      checked={columns.penaltyPoints}
                      onChange={() => toggleColumn('penaltyPoints')}
                      className="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer">
                    <span>Tarjetas (TA / TR)</span>
                    <input
                      type="checkbox"
                      checked={columns.cards}
                      onChange={() => toggleColumn('cards')}
                      className="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer">
                    <span>Forma Reciente</span>
                    <input
                      type="checkbox"
                      checked={columns.form}
                      onChange={() => toggleColumn('form')}
                      className="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Initial Historical Table Capture Button (For Admins and Master) */}
            {canEditInitial && (
              <button
                type="button"
                onClick={() => setIsInitialModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all shadow-xs"
                title="Cargar o ajustar tabla inicial previa para torneos ya iniciados"
              >
                <Settings2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>⚙️ Cargar Tabla Inicial / Histórico</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Virtual Mode Info Notice Banner */}
        {tableMode === 'en_vivo' && (
          <div className="px-5 py-2.5 bg-red-500/10 border-b border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
              <span>
                <strong>Modo Tabla Virtual en Directo:</strong> Computa {finishedMatches.length} partidos finalizados + los marcadores parciales de {liveMatches.length} partidos en disputa.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span>▲</span> Subió puesto
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <span>▼</span> Bajó puesto
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span>=</span> Sin cambio
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {teams.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No hay clubes registrados para este torneo
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Inscribe clubes en la pestaña Equipos para generar automáticamente la tabla de posiciones.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#070A0F]/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-3 text-center w-12">Pos</th>
                  {tableMode === 'en_vivo' && (
                    <th className="py-3.5 px-2 text-center w-14 text-red-600 dark:text-red-400" title="Tendencia respecto a la tabla oficial">
                      Tend
                    </th>
                  )}
                  <th className="py-3.5 px-4 min-w-[200px]">Club / Equipo</th>
                  <th className="py-3.5 px-2.5 text-center" title="Juegos Jugados">JJ</th>
                  <th className="py-3.5 px-2.5 text-center" title="Juegos Ganados">JG</th>
                  <th className="py-3.5 px-2.5 text-center" title="Juegos Empatados">JE</th>
                  <th className="py-3.5 px-2.5 text-center" title="Juegos Perdidos">JP</th>

                  {/* GP & PP if enabled */}
                  {columns.penalties && (
                    <>
                      <th className="py-3.5 px-2 text-center text-amber-600 dark:text-amber-400 font-black" title="Ganados en Penales (Punto Extra)">
                        GP
                      </th>
                      <th className="py-3.5 px-2 text-center text-slate-500 dark:text-slate-400" title="Perdidos en Penales">
                        PP
                      </th>
                    </>
                  )}

                  <th className="py-3.5 px-2.5 text-center" title="Goles a Favor">GF</th>
                  <th className="py-3.5 px-2.5 text-center" title="Goles en Contra">GC</th>
                  <th className="py-3.5 px-2.5 text-center font-bold" title="Diferencia de Goles">DIF</th>

                  {/* PEN (Puntos de Descuento/Sanción) */}
                  {columns.penaltyPoints && (
                    <th className="py-3.5 px-2 text-center text-red-500 font-bold" title="Puntos de Sanción / Descuento">
                      PEN
                    </th>
                  )}

                  {/* PTS */}
                  <th className={`py-3.5 px-3.5 text-center font-black text-xs sm:text-sm ${
                    tableMode === 'en_vivo'
                      ? 'text-red-600 dark:text-red-400 bg-red-500/5'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  }`} title="Puntos Totales Calculados">
                    PTS
                  </th>

                  {/* Tarjetas Fair Play (TA / TR) */}
                  {columns.cards && (
                    <>
                      <th className="py-3.5 px-2 text-center text-amber-500 font-bold" title="Tarjetas Amarillas (Fair Play)">
                        TA
                      </th>
                      <th className="py-3.5 px-2 text-center text-red-500 font-bold" title="Tarjetas Rojas (Fair Play)">
                        TR
                      </th>
                    </>
                  )}

                  {/* FORMA (Últimos 5 partidos) */}
                  {columns.form && (
                    <th className="py-3.5 px-3 text-center min-w-[110px]" title="Forma y Racha de Últimos Partidos">
                      Forma
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {standings.map((row, index) => {
                  const pos = index + 1;
                  const isTopFour = pos <= 4;
                  const teamColor = row.team.color || '#10B981';

                  // Trend calculation for live virtual mode
                  const officialPos = officialRanks.get(row.team.id) ?? pos;
                  const diff = officialPos - pos;

                  return (
                    <tr
                      key={row.team.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Position */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                              isTopFour
                                ? tableMode === 'en_vivo'
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-extrabold'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-extrabold'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {pos}
                          </span>
                        </div>
                      </td>

                      {/* Trend column (Virtual live mode only) */}
                      {tableMode === 'en_vivo' && (
                        <td className="py-3 px-2 text-center">
                          {diff > 0 ? (
                            <span 
                              title={`Subió ${diff} ${diff === 1 ? 'lugar' : 'lugares'} respecto a la tabla oficial (#${officialPos})`}
                              className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs"
                            >
                              <span>▲</span>
                              <span>+{diff}</span>
                            </span>
                          ) : diff < 0 ? (
                            <span 
                              title={`Bajó ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'lugar' : 'lugares'} respecto a la tabla oficial (#${officialPos})`}
                              className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shadow-2xs"
                            >
                              <span>▼</span>
                              <span>{Math.abs(diff)}</span>
                            </span>
                          ) : (
                            <span 
                              title={`Conserva su posición oficial (#${officialPos})`}
                              className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-slate-400 dark:text-slate-500"
                            >
                              =
                            </span>
                          )}
                        </td>
                      )}

                      {/* Team Name and Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-sm shrink-0"
                            style={{
                              backgroundColor: teamColor,
                            }}
                          >
                            {row.team.shortName || row.team.name.slice(0, 3).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {row.team.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                              <span>{row.team.shortName}</span>
                              {row.hasInitialData && (
                                <span className="text-[9px] lowercase font-normal px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  +acumulado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* JJ */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.played}
                      </td>

                      {/* JG */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.won}
                      </td>

                      {/* JE */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.drawn}
                      </td>

                      {/* JP */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.lost}
                      </td>

                      {/* GP & PP */}
                      {columns.penalties && (
                        <>
                          <td className="py-3 px-2 text-center font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5">
                            {row.penaltiesWon}
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-600 dark:text-slate-400">
                            {row.penaltiesLost}
                          </td>
                        </>
                      )}

                      {/* GF */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.goalsFor}
                      </td>

                      {/* GC */}
                      <td className="py-3 px-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.goalsAgainst}
                      </td>

                      {/* DIF */}
                      <td className="py-3 px-2.5 text-center font-bold">
                        <span
                          className={
                            row.goalDifference > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : row.goalDifference < 0
                              ? 'text-red-500'
                              : 'text-slate-500'
                          }
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </span>
                      </td>

                      {/* PEN */}
                      {columns.penaltyPoints && (
                        <td className="py-3 px-2 text-center font-bold text-red-500">
                          {row.penaltyPoints > 0 ? `-${row.penaltyPoints}` : '0'}
                        </td>
                      )}

                      {/* PTS */}
                      <td className={`py-3 px-3.5 text-center font-black text-sm sm:text-base ${
                        tableMode === 'en_vivo'
                          ? 'text-red-600 dark:text-red-400 bg-red-500/5'
                          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                      }`}>
                        {row.points}
                      </td>

                      {/* Tarjetas Fair Play (TA / TR) */}
                      {columns.cards && (
                        <>
                          <td className="py-3 px-2 text-center font-medium text-amber-500">
                            {row.yellowCards}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-red-500">
                            {row.redCards}
                          </td>
                        </>
                      )}

                      {/* FORMA (Racha reciente) */}
                      {columns.form && (
                        <td className="py-3 px-3 text-center">
                          {row.form.length === 0 ? (
                            <span className="text-slate-400 text-xs">-</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {row.form.map((res, i) => (
                                <span
                                  key={i}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black leading-none shadow-2xs ${
                                    res === 'G'
                                      ? 'bg-emerald-500 text-slate-950 font-black'
                                      : res === 'E'
                                      ? 'bg-amber-400 text-slate-950 font-black'
                                      : 'bg-red-500 text-white font-black'
                                  }`}
                                  title={res === 'G' ? 'Victoria' : res === 'E' ? 'Empate' : 'Derrota'}
                                >
                                  {res}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spreadsheet Modal for Historical Standings Capture */}
      <InitialStandingsModal
        isOpen={isInitialModalOpen}
        onClose={() => setIsInitialModalOpen(false)}
        teams={teams}
        tournamentId={tournamentId}
        tournamentName={tournamentName}
        rules={effectiveRules}
        initialStatsMap={initialStatsMap}
        onSave={handleSaveInitialStats}
      />
    </div>
  );
};
