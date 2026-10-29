import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Shield,
  Scale,
  Radio
} from 'lucide-react';
import { Team } from '../types/team';
import { Match } from '../types/match';
import { TournamentRules, DEFAULT_TOURNAMENT_RULES } from '../types/tournament';

interface StandingsTableProps {
  teams: Team[];
  matches: Match[];
  tournamentName: string;
  rules?: TournamentRules;
}

export interface TeamStanding {
  team: Team;
  played: number; // JJ
  won: number;    // JG
  drawn: number;  // JE
  lost: number;   // JP
  penaltiesWon: number; // PGP (Penales Ganados)
  penaltiesLost: number; // PPP (Penales Perdidos)
  goalsFor: number; // GF
  goalsAgainst: number; // GC
  goalDifference: number; // DIF
  points: number; // PTS
}

function computeStandingsList(
  teams: Team[],
  targetMatches: Match[],
  rules: TournamentRules
): TeamStanding[] {
  const standings: TeamStanding[] = teams.map((team) => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let penaltiesWon = 0;
    let penaltiesLost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let points = 0;

    targetMatches.forEach((m) => {
      const isHome = m.homeTeamId === team.id;
      const isAway = m.awayTeamId === team.id;

      if (!isHome && !isAway) return;

      const hScore = m.homeScore ?? 0;
      const aScore = m.awayScore ?? 0;

      played += 1;

      if (isHome) {
        goalsFor += hScore;
        goalsAgainst += aScore;
        if (hScore > aScore) {
          won += 1;
          points += rules.pointsWin;
        } else if (hScore < aScore) {
          lost += 1;
          points += rules.pointsLoss;
        } else {
          drawn += 1;
          if (rules.penaltiesEnabled) {
            if (m.penaltyWinnerId === team.id) {
              penaltiesWon += 1;
              points += rules.pointsPenaltiesWin;
            } else if (m.penaltyWinnerId) {
              penaltiesLost += 1;
              points += rules.pointsPenaltiesLoss;
            } else {
              points += rules.pointsDraw;
            }
          } else {
            points += rules.pointsDraw;
          }
        }
      } else {
        goalsFor += aScore;
        goalsAgainst += hScore;
        if (aScore > hScore) {
          won += 1;
          points += rules.pointsWin;
        } else if (aScore < hScore) {
          lost += 1;
          points += rules.pointsLoss;
        } else {
          drawn += 1;
          if (rules.penaltiesEnabled) {
            if (m.penaltyWinnerId === team.id) {
              penaltiesWon += 1;
              points += rules.pointsPenaltiesWin;
            } else if (m.penaltyWinnerId) {
              penaltiesLost += 1;
              points += rules.pointsPenaltiesLoss;
            } else {
              points += rules.pointsDraw;
            }
          } else {
            points += rules.pointsDraw;
          }
        }
      }
    });

    const goalDifference = goalsFor - goalsAgainst;

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
      points,
    };
  });

  const getHeadToHeadDiff = (teamAId: string, teamBId: string) => {
    let aPoints = 0;
    let bPoints = 0;

    targetMatches.forEach((m) => {
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
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    }

    return a.team.name.localeCompare(b.team.name);
  });

  return standings;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  tournamentName,
  rules,
}) => {
  const effectiveRules: TournamentRules = rules || DEFAULT_TOURNAMENT_RULES;
  const [tableMode, setTableMode] = useState<'oficial' | 'en_vivo'>('oficial');

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

  // Virtual matches: Finished + In-Progress
  const virtualMatches = useMemo(
    () => matches.filter((m) => m.status === 'Finalizado' || m.status === 'En Vivo'),
    [matches]
  );

  // Calculate official standings
  const officialStandings = useMemo(() => {
    return computeStandingsList(teams, finishedMatches, effectiveRules);
  }, [teams, finishedMatches, effectiveRules]);

  // Calculate virtual standings (with live matches)
  const virtualStandings = useMemo(() => {
    return computeStandingsList(teams, virtualMatches, effectiveRules);
  }, [teams, virtualMatches, effectiveRules]);

  // Map of teamId -> Official position (1-indexed)
  const officialRanks = useMemo(() => {
    const map = new Map<string, number>();
    officialStandings.forEach((item, index) => {
      map.set(item.team.id, index + 1);
    });
    return map;
  }, [officialStandings]);

  // Select current active standings array
  const standings = tableMode === 'en_vivo' ? virtualStandings : officialStandings;
  const currentComputedMatches = tableMode === 'en_vivo' ? virtualMatches : finishedMatches;

  const totalGoals = currentComputedMatches.reduce(
    (acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0
  );

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
        {/* Table Title, Toggle and Qualification Legend */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Torneo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tournamentName}</span> • Desempate: <strong className="text-slate-700 dark:text-slate-300">{effectiveRules.tieBreakerPriority}</strong>
              </p>
            </div>
          </div>

          {/* Mode Switcher Toggle + Legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>1° al 4° Liguilla</span>
            </div>
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
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[660px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#070A0F]/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">Pos</th>
                  {tableMode === 'en_vivo' && (
                    <th className="py-3.5 px-2 text-center w-14 text-red-600 dark:text-red-400" title="Tendencia respecto a la tabla oficial">
                      Tend
                    </th>
                  )}
                  <th className="py-3.5 px-4 min-w-[190px]">Club / Equipo</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Jugados / Computados">JJ</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Ganados">JG</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Empatados">JE</th>
                  {effectiveRules.penaltiesEnabled && (
                    <>
                      <th className="py-3.5 px-2.5 text-center text-amber-600 dark:text-amber-400 font-black" title="Ganados en Penales (Punto Extra)">
                        GP
                      </th>
                      <th className="py-3.5 px-2.5 text-center text-slate-500 dark:text-slate-400" title="Perdidos en Penales">
                        PP
                      </th>
                    </>
                  )}
                  <th className="py-3.5 px-3 text-center" title="Partidos Perdidos">JP</th>
                  <th className="py-3.5 px-3 text-center" title="Goles a Favor">GF</th>
                  <th className="py-3.5 px-3 text-center" title="Goles en Contra">GC</th>
                  <th className="py-3.5 px-3 text-center font-bold" title="Diferencia de Goles">DIF</th>
                  <th className={`py-3.5 px-4 text-center font-black text-xs sm:text-sm ${
                    tableMode === 'en_vivo'
                      ? 'text-red-600 dark:text-red-400 bg-red-500/5'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  }`} title="Puntos Totales">
                    PTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {standings.map((row, index) => {
                  const pos = index + 1;
                  const isTopFour = pos <= 4;
                  const teamColor = row.team.color || '#10B981';

                  // Trend calculation for live virtual mode
                  const officialPos = officialRanks.get(row.team.id) ?? pos;
                  const diff = officialPos - pos; // if officialPos = 4 and current pos = 2, diff = +2 (rose 2 spots)

                  return (
                    <tr
                      key={row.team.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Position */}
                      <td className="py-3.5 px-4 text-center">
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
                        <td className="py-3.5 px-2 text-center">
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
                      <td className="py-3.5 px-4">
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
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {row.team.shortName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* JJ */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.played}
                      </td>

                      {/* JG */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.won}
                      </td>

                      {/* JE */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.drawn}
                      </td>

                      {/* GP & PP if penalties enabled */}
                      {effectiveRules.penaltiesEnabled && (
                        <>
                          <td className="py-3.5 px-2.5 text-center font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5">
                            {row.penaltiesWon}
                          </td>
                          <td className="py-3.5 px-2.5 text-center font-medium text-slate-600 dark:text-slate-400">
                            {row.penaltiesLost}
                          </td>
                        </>
                      )}

                      {/* JP */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.lost}
                      </td>

                      {/* GF */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.goalsFor}
                      </td>

                      {/* GC */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {row.goalsAgainst}
                      </td>

                      {/* DIF */}
                      <td className="py-3.5 px-3 text-center font-bold">
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

                      {/* PTS */}
                      <td className={`py-3.5 px-4 text-center font-black text-sm sm:text-base ${
                        tableMode === 'en_vivo'
                          ? 'text-red-600 dark:text-red-400 bg-red-500/5'
                          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                      }`}>
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
