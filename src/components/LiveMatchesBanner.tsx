import React from 'react';
import { Clock, MapPin, Edit3 } from 'lucide-react';
import { Match } from '../types/match';
import { Team } from '../types/team';
import { Tournament } from '../types/tournament';
import { useAuth } from '../context/AuthContext';

interface LiveMatchesBannerProps {
  matches: Match[];
  teams: Team[];
  tournaments?: Tournament[];
  onOpenMatchScore?: (match: Match) => void;
  className?: string;
}

export const LiveMatchesBanner: React.FC<LiveMatchesBannerProps> = ({
  matches,
  teams,
  tournaments,
  onOpenMatchScore,
  className = '',
}) => {
  const { canEditScores } = useAuth();
  const liveMatches = matches.filter((m) => m.status === 'En Vivo');

  if (liveMatches.length === 0) return null;

  return (
    <section 
      aria-label="Partidos en Vivo en Directo"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/40 via-[#0B0F17] to-red-950/30 border border-red-500/40 shadow-xl shadow-red-500/5 p-4 sm:p-5 backdrop-blur-md animate-in fade-in duration-300 ${className}`}
    >
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-red-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-red-500/20 mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
          </span>

          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black tracking-wider text-red-500 dark:text-red-400 uppercase flex items-center gap-1.5">
              <span>🔴 {liveMatches.length} {liveMatches.length === 1 ? 'PARTIDO EN VIVO AHORA' : 'PARTIDOS EN VIVO AHORA'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse hidden xs:inline-flex">
              Minuto a Minuto
            </span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span>Marcadores actualizados en tiempo real</span>
        </div>
      </div>

      {/* Live matches cards list / carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {liveMatches.map((match) => {
          const homeTeam = teams.find((t) => t.id === match.homeTeamId);
          const awayTeam = teams.find((t) => t.id === match.awayTeamId);
          const tournament = tournaments?.find((t) => t.id === match.tournamentId);

          const homeColor = homeTeam?.color || '#10B981';
          const awayColor = awayTeam?.color || '#3B82F6';

          const timeDisplay = match.liveMinute 
            ? `${match.liveStage ? `${match.liveStage} • ` : ''}${match.liveMinute}`
            : (match.liveStage || 'En Juego');

          return (
            <div
              key={match.id}
              className="group relative rounded-2xl bg-white dark:bg-[#070A0F] border border-red-500/20 hover:border-red-500/50 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              {/* Card Header: Tournament / Field + Live Pill */}
              <div className="flex items-center justify-between text-[11px] gap-2">
                <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title={tournament?.name}>
                  {tournament ? tournament.name : `Jornada ${match.matchdayNumber}`}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>{timeDisplay}</span>
                </span>
              </div>

              {/* Scoreboard display */}
              <div className="grid grid-cols-7 items-center gap-2 py-1">
                {/* Home Team */}
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                    style={{ backgroundColor: homeColor }}
                  >
                    {homeTeam?.shortName || 'LOC'}
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {homeTeam?.name || 'Local'}
                  </span>
                </div>

                {/* Score numbers */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wider">
                    <span>{match.homeScore ?? 0}</span>
                    <span className="text-red-500 animate-pulse text-xs font-bold">:</span>
                    <span>{match.awayScore ?? 0}</span>
                  </div>
                </div>

                {/* Away Team */}
                <div className="col-span-3 flex items-center justify-end gap-2 min-w-0 text-right">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {awayTeam?.name || 'Visita'}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                    style={{ backgroundColor: awayColor }}
                  >
                    {awayTeam?.shortName || 'VIS'}
                  </div>
                </div>
              </div>

              {/* Card Footer: Field + Action Button */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                  {match.field}
                </span>

                {canEditScores() && onOpenMatchScore && (
                  <button
                    onClick={() => onOpenMatchScore(match)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-red-600 dark:text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 transition-all shadow-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Capturar Minuto</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
