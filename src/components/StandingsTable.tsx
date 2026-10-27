import React from 'react';
import { 
  Table as TableIcon, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  HelpCircle,
  Shield
} from 'lucide-react';
import { Team } from '../types/team';
import { Match } from '../types/match';

interface StandingsTableProps {
  teams: Team[];
  matches: Match[];
  tournamentName: string;
}

export interface TeamStanding {
  team: Team;
  played: number; // JJ
  won: number;    // JG
  drawn: number;  // JE
  lost: number;   // JP
  goalsFor: number; // GF
  goalsAgainst: number; // GC
  goalDifference: number; // DIF
  points: number; // PTS
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  tournamentName,
}) => {
  // Only finished matches compute for standings
  const finishedMatches = matches.filter((m) => m.status === 'Finalizado');

  // Compute standings for each registered team
  const standings: TeamStanding[] = teams.map((team) => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

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
        if (hScore > aScore) won += 1;
        else if (hScore === aScore) drawn += 1;
        else lost += 1;
      } else {
        goalsFor += aScore;
        goalsAgainst += hScore;
        if (aScore > hScore) won += 1;
        else if (aScore === hScore) drawn += 1;
        else lost += 1;
      }
    });

    const goalDifference = goalsFor - goalsAgainst;
    const points = won * 3 + drawn * 1;

    return {
      team,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
    };
  });

  // Sort criteria:
  // 1. Points desc
  // 2. Goal Difference desc
  // 3. Goals For desc
  // 4. Team Name asc
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
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
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Tabla General de Posiciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Torneo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tournamentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>1° al 4° Clasificación a Liguilla</span>
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
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#070A0F]/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">Pos</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Club / Equipo</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Jugados">JJ</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Ganados">JG</th>
                  <th className="py-3.5 px-3 text-center" title="Partidos Empatados">JE</th>
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
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>JJ:</strong> Jugados • <strong>JG:</strong> Ganados • <strong>JE:</strong> Empatados • <strong>JP:</strong> Perdidos • <strong>GF:</strong> Goles Favor • <strong>GC:</strong> Goles Contra • <strong>DIF:</strong> Diferencia • <strong>PTS:</strong> Puntos (3 por JG, 1 por JE)
            </span>
          </div>

          <div>
            <span>Criterio: Puntos &gt; Diferencia de Goles &gt; Goles a Favor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
