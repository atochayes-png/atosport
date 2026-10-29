import React from 'react';
import { Activity, Clock, ShieldCheck, Radio, Edit3, MapPin } from 'lucide-react';
import { Match as AppMatch } from '../types/match';
import { Team } from '../types/team';
import { Tournament } from '../types/tournament';
import { useAuth } from '../context/AuthContext';

interface LiveScoresViewProps {
  matches?: AppMatch[];
  teams?: Team[];
  tournaments?: Tournament[];
  onOpenMatchScore?: (match: AppMatch) => void;
}

export const LiveScoresView: React.FC<LiveScoresViewProps> = ({
  matches = [],
  teams = [],
  tournaments = [],
  onOpenMatchScore,
}) => {
  const { canEditScores } = useAuth();

  // Filter to show active matches or recently finished ones
  const activeMatches = matches.length > 0 
    ? [...matches].sort((a, b) => {
        // En Vivo first, then Finalizado, then Programado
        const order = { 'En Vivo': 0, 'Finalizado': 1, 'Programado': 2, 'Pospuesto': 3 };
        return order[a.status] - order[b.status];
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Marcadores y Minuto a Minuto
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Seguimiento de encuentros en vivo alimentados directamente por el colegio arbitral.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold shadow-xs">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Sincronización en Directo</span>
        </div>
      </div>

      {/* Matches Grid */}
      {activeMatches.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#0B0F17] rounded-3xl border border-slate-200 dark:border-slate-800">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No hay partidos registrados aún</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Programa partidos en las jornadas de los torneos para visualizarlos aquí en tiempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMatches.map((match) => {
            const home = teams.find((t) => t.id === match.homeTeamId);
            const away = teams.find((t) => t.id === match.awayTeamId);
            const tournament = tournaments.find((t) => t.id === match.tournamentId);

            const isLive = match.status === 'En Vivo';
            const isFinished = match.status === 'Finalizado';

            const homeColor = home?.color || '#10B981';
            const awayColor = away?.color || '#3B82F6';

            return (
              <div
                key={match.id}
                className={`p-6 rounded-3xl bg-white dark:bg-[#0B0F17] border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isLive
                    ? 'border-red-500/40 shadow-red-500/5 ring-1 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top match header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                    {tournament?.name || `Torneo`} • <strong className="text-slate-900 dark:text-white">J{match.matchdayNumber}</strong>
                  </span>

                  {isLive && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-black text-[11px] uppercase animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>EN VIVO {match.liveMinute ? `• ${match.liveStage ? `${match.liveStage} ` : ''}${match.liveMinute}` : (match.liveStage || '')}</span>
                    </div>
                  )}

                  {!isLive && !isFinished && (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[11px] font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{match.time} hrs</span>
                    </div>
                  )}

                  {isFinished && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                      Finalizado
                    </span>
                  )}
                </div>

                {/* Score section */}
                <div className="py-6 space-y-4">
                  {/* Home */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: homeColor }}
                      >
                        {home?.shortName || 'LOC'}
                      </div>
                      <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide truncate">
                        {home?.name || 'Local'}
                      </span>
                    </div>
                    <span className={`text-2xl sm:text-3xl font-black ${
                      isLive 
                        ? 'text-red-600 dark:text-red-400 font-mono'
                        : isFinished 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-slate-400'
                    }`}>
                      {isLive || isFinished ? (match.homeScore ?? 0) : '-'}
                    </span>
                  </div>

                  {/* Away */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: awayColor }}
                      >
                        {away?.shortName || 'VIS'}
                      </div>
                      <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide truncate">
                        {away?.name || 'Visitante'}
                      </span>
                    </div>
                    <span className={`text-2xl sm:text-3xl font-black ${
                      isLive 
                        ? 'text-red-600 dark:text-red-400 font-mono'
                        : isFinished 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-slate-400'
                    }`}>
                      {isLive || isFinished ? (match.awayScore ?? 0) : '-'}
                    </span>
                  </div>
                </div>

                {/* Footer venue & referee status / Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{match.field}</span>
                  </span>

                  {canEditScores() && onOpenMatchScore ? (
                    <button
                      onClick={() => onOpenMatchScore(match)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isLive
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isLive ? 'Minuto a Minuto' : 'Capturar'}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 shrink-0 font-medium text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Cédula Oficial
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
