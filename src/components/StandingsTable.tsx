import React from 'react';
import { 
  Table as TableIcon, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  HelpCircle,
  Shield,
  Scale
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

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  tournamentName,
  rules,
}) => {
  const effectiveRules: TournamentRules = rules || DEFAULT_TOURNAMENT_RULES;

  // Only finished matches compute for standings
  const finishedMatches = matches.filter((m) => m.status === 'Finalizado');

  // Compute standings for each registered team
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

    finishedMatches.forEach((m) => {
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
          points += effectiveRules.pointsWin;
        } else if (hScore < aScore) {
          lost += 1;
          points += effectiveRules.pointsLoss;
        } else {
          drawn += 1;
          if (effectiveRules.penaltiesEnabled) {
            if (m.penaltyWinnerId === team.id) {
              penaltiesWon += 1;
              points += effectiveRules.pointsPenaltiesWin;
            } else if (m.penaltyWinnerId) {
              penaltiesLost += 1;
              points += effectiveRules.pointsPenaltiesLoss;
            } else {
              points += effectiveRules.pointsDraw;
            }
          } else {
            points += effectiveRules.pointsDraw;
          }
        }
      } else {
        goalsFor += aScore;
        goalsAgainst += hScore;
        if (aScore > hScore) {
          won += 1;
          points += effectiveRules.pointsWin;
        } else if (aScore < hScore) {
          lost += 1;
          points += effectiveRules.pointsLoss;
        } else {
          drawn += 1;
          if (effectiveRules.penaltiesEnabled) {
            if (m.penaltyWinnerId === team.id) {
              penaltiesWon += 1;
              points += effectiveRules.pointsPenaltiesWin;
            } else if (m.penaltyWinnerId) {
              penaltiesLost += 1;
              points += effectiveRules.pointsPenaltiesLoss;
            } else {
              points += effectiveRules.pointsDraw;
            }
          } else {
            points += effectiveRules.pointsDraw;
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

  // Head to head resolver for tied teams
  const getHeadToHeadDiff = (teamAId: string, teamBId: string) => {
    let aPoints = 0;
    let bPoints = 0;

    finishedMatches.forEach((m) => {
      const matchInvolvesBoth =
        (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId);

      if (!matchInvolvesBoth) return;

      const aScore = m.homeTeamId === teamAId ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const bScore = m.homeTeamId === teamAId ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

      if (aScore > bScore) {
        aPoints += effectiveRules.pointsWin;
        bPoints += effectiveRules.pointsLoss;
      } else if (bScore > aScore) {
        bPoints += effectiveRules.pointsWin;
        aPoints += effectiveRules.pointsLoss;
      } else {
        if (effectiveRules.penaltiesEnabled && m.penaltyWinnerId) {
          if (m.penaltyWinnerId === teamAId) {
            aPoints += effectiveRules.pointsPenaltiesWin;
            bPoints += effectiveRules.pointsPenaltiesLoss;
          } else {
            bPoints += effectiveRules.pointsPenaltiesWin;
            aPoints += effectiveRules.pointsPenaltiesLoss;
          }
        } else {
          aPoints += effectiveRules.pointsDraw;
          bPoints += effectiveRules.pointsDraw;
        }
      }
    });

    return bPoints - aPoints;
  };

  // Sort criteria based on tournament rules:
  // 1. Points desc
  // 2. Tiebreaker Priority:
  //    - 'Diferencia de Goles': DIF desc -> GF desc -> Name asc
  //    - 'Goles a Favor': GF desc -> DIF desc -> Name asc
  //    - 'Enfrentamiento Directo': Direct Match desc -> DIF desc -> GF desc -> Name asc
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    if (effectiveRules.tieBreakerPriority === 'Goles a Favor') {
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    } else if (effectiveRules.tieBreakerPriority === 'Enfrentamiento Directo') {
      const h2h = getHeadToHeadDiff(a.team.id, b.team.id);
      if (h2h !== 0) return h2h;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    } else {
      // Default: Diferencia de Goles
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    }

    return a.team.name.localeCompare(b.team.name);
  });

  const totalGoals = finishedMatches.reduce(
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
              Partidos Jugados
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {finishedMatches.length} <span className="text-xs font-semibold text-slate-400">/ {matches.length} programados</span>
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
              Goles Anotados
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
              Líder General
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {standings[0]?.team.name || 'Sin definir'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Standings Table Container */}
      <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Title and Qualification Legend */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Tabla General de Posiciones
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

          <div className="flex items-center gap-3 self-start lg:self-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>1° al 4° Liguilla / Clasificados</span>
            </div>
          </div>
        </div>

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
                  <th className="py-3.5 px-4 min-w-[190px]">Club / Equipo</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Jugados">JJ</th>
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
                  <th className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm bg-emerald-500/5" title="Puntos Totales">
                    PTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {standings.map((row, index) => {
                  const pos = index + 1;
                  const isTopFour = pos <= 4;
                  const teamColor = row.team.color || '#10B981';

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
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-extrabold'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {pos}
                          </span>
                        </div>
                      </td>

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
                              : 'text-slate-400'
                          }
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </span>
                      </td>

                      {/* PTS */}
                      <td className="py-3.5 px-4 text-center font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Explanations */}
        <div className="p-4 bg-slate-50/70 dark:bg-[#070A0F]/60 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>JJ:</strong> Jugados • <strong>JG:</strong> Ganados ({effectiveRules.pointsWin} pts) •{' '}
              {effectiveRules.penaltiesEnabled ? (
                <>
                  <strong>GP:</strong> Ganados Penales ({effectiveRules.pointsPenaltiesWin} pts) • <strong>PP:</strong> Perdidos Penales ({effectiveRules.pointsPenaltiesLoss} pt) •{' '}
                </>
              ) : (
                <>
                  <strong>JE:</strong> Empatados ({effectiveRules.pointsDraw} pt) •{' '}
                </>
              )}
              <strong>JP:</strong> Perdidos ({effectiveRules.pointsLoss} pts) • <strong>DIF:</strong> Diferencia • <strong>PTS:</strong> Puntos Oficiales
            </span>
          </div>

          <div>
            <span>
              Criterio de Desempate: <strong className="text-slate-800 dark:text-slate-200">{effectiveRules.tieBreakerPriority}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
