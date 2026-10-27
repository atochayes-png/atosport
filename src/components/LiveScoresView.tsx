import React from 'react';
import { Activity, Clock, ShieldCheck, Flame } from 'lucide-react';

interface Match {
  id: string;
  tournament: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
  venue: string;
}

const SAMPLE_MATCHES: Match[] = [
  {
    id: 'm-1',
    tournament: 'Liga Premier Nocturna',
    sport: 'Fútbol 7',
    homeTeam: 'Real Azteca FC',
    awayTeam: 'Deportivo Gladiadores',
    homeScore: 3,
    awayScore: 2,
    minute: "38'",
    status: 'LIVE',
    venue: 'Cancha Central Sintética',
  },
  {
    id: 'm-2',
    tournament: 'Copa Élite Metropolitana',
    sport: 'Fútbol 11',
    homeTeam: 'Atlético San Jerónimo',
    awayTeam: 'Inter Universitario',
    homeScore: 1,
    awayScore: 1,
    minute: "62'",
    status: 'LIVE',
    venue: 'Estadio Olímpico Municipal',
  },
  {
    id: 'm-3',
    tournament: 'Torneo Apertura Futsal Pro',
    sport: 'Futsal',
    homeTeam: 'Halcones Dorados',
    awayTeam: 'Club Titanes',
    homeScore: 5,
    awayScore: 4,
    minute: "Final",
    status: 'FINISHED',
    venue: 'Gimnasio Techado Sala A',
  },
  {
    id: 'm-4',
    tournament: 'Liga Premier Nocturna',
    sport: 'Fútbol 7',
    homeTeam: 'Leones de la Sierra',
    awayTeam: 'Dragones del Valle',
    homeScore: 0,
    awayScore: 0,
    minute: '21:00 hrs',
    status: 'SCHEDULED',
    venue: 'Cancha 2 El Cedro',
  },
];

export const LiveScoresView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Marcadores en Tiempo Real
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Seguimiento de encuentros en vivo alimentados directamente por la cédula digital arbitral.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Sincronización en Directo</span>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_MATCHES.map((match) => (
          <div
            key={match.id}
            className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-all shadow-card-dark"
          >
            {/* Top match header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs">
              <span className="font-semibold text-slate-300">
                {match.tournament} · <span className="text-emerald-400">{match.sport}</span>
              </span>

              {match.status === 'LIVE' && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[11px] animate-pulse">
                  <Flame className="w-3 h-3" />
                  <span>EN VIVO {match.minute}</span>
                </div>
              )}

              {match.status === 'SCHEDULED' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{match.minute}</span>
                </div>
              )}

              {match.status === 'FINISHED' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-semibold">
                  Finalizado
                </span>
              )}
            </div>

            {/* Score section */}
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {match.homeTeam}
                </span>
                <span className={`text-2xl font-black ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {match.homeScore}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {match.awayTeam}
                </span>
                <span className={`text-2xl font-black ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {match.awayScore}
                </span>
              </div>
            </div>

            {/* Footer venue & referee status */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{match.venue}</span>
              <span className="flex items-center gap-1 text-slate-500 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Cédula Validada
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
