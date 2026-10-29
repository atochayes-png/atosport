import React from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  MapPin, 
  QrCode
} from 'lucide-react';
import { Team } from '../types/team';
import { Tournament } from '../types/tournament';
import { Match } from '../types/match';
import { Player, TeamFinance } from '../types/player';
import { User } from '../types/auth';

interface PlayerProfileViewProps {
  currentUser: User;
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  players: Player[];
  teamFinances: TeamFinance[];
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  currentUser,
  tournament,
  teams,
  matches,
  players,
  teamFinances,
}) => {
  // Find player's team and player record
  const playerTeam = teams.find((t) => t.id === currentUser.teamId) || teams[0];
  const playerRecord = players.find((p) => p.id === currentUser.playerId || p.teamId === playerTeam?.id) || {
    id: 'p-1',
    teamId: playerTeam?.id || 'team-1',
    name: currentUser.displayName || 'Carlos Méndez',
    number: 10,
    position: 'Delantero',
    phone: '+52 55 4123 9876',
    feePaid: 350,
    createdAt: new Date().toISOString(),
  };

  const teamFinance = teamFinances.find((f) => f.teamId === playerTeam?.id);
  const suggestedFee = teamFinance?.suggestedPlayerFee ?? 350;
  const isPaid = (playerRecord.feePaid || 0) >= suggestedFee;

  // Filter player team's matches
  const teamMatches = matches
    .filter((m) => m.homeTeamId === playerTeam?.id || m.awayTeamId === playerTeam?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const finishedMatches = teamMatches.filter((m) => m.status === 'Finalizado');

  const teamColor = playerTeam?.color || '#10B981';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
          <span>
            Estás en el <strong>Portal del Jugador Federado</strong>. Consulta tu credencial oficial, calendario y estadísticas en modo solo lectura.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/20 text-teal-700 dark:text-teal-300">
          Modo Jugador
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Digital Credential Pass */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Credencial Digital Oficial</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Vigencia 2026
            </span>
          </div>

          {/* Premium Digital Badge Card */}
          <div className="relative rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-2 border-emerald-500/40 shadow-2xl overflow-hidden space-y-5">
            {/* Top decorative gradient band */}
            <div
              className="absolute top-0 left-0 right-0 h-2 shadow-sm"
              style={{ backgroundColor: teamColor }}
            />
            {/* Watermark Logo */}
            <img
              src="/logo-atosport.png"
              alt="Logo Watermark"
              className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 pointer-events-none"
            />

            {/* Header of Badge */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-atosport.png"
                  alt="ATOSPORT"
                  className="w-7 h-7 object-contain rounded-lg shadow-xs"
                />
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-300 block">
                    ATOSPORT PASAPORTE
                  </span>
                  <span className="text-[9px] text-slate-400">Federación Deportiva</span>
                </div>
              </div>

              <div
                className="px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider text-white shadow-xs"
                style={{ backgroundColor: teamColor }}
              >
                {playerTeam?.shortName || 'OFICIAL'}
              </div>
            </div>

            {/* Player Avatar & Large Number */}
            <div className="flex items-center gap-4 pt-1">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20"
                  style={{
                    backgroundColor: teamColor,
                    boxShadow: `0 8px 24px ${teamColor}50`,
                  }}
                >
                  #{playerRecord.number || 10}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {playerRecord.position || 'Delantero'}
                </span>
                <h4 className="font-black text-lg text-white truncate leading-snug">
                  {playerRecord.name}
                </h4>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {playerTeam?.name || 'Club'}
                </p>
              </div>
            </div>

            {/* Tournament Details Box */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Competición:</span>
                <strong className="text-white truncate max-w-[160px]">{tournament.name}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Sede Oficial:</span>
                <span className="text-slate-300 truncate max-w-[160px]">{tournament.venue}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Temporada:</span>
                <span className="text-slate-300">{tournament.season}</span>
              </div>
            </div>

            {/* Payment Status & Simulated QR */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Estado de Cuota:</span>
                {isPaid ? (
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Al Día / Sin Adeudo
                  </span>
                ) : (
                  <span className="text-xs font-black text-amber-400">
                    Pendiente (${(suggestedFee - (playerRecord.feePaid || 0)).toLocaleString('es-MX')} MXN)
                  </span>
                )}
              </div>

              <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-md p-1">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Stats & Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Individual Player Stats Cards */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Estadísticas de la Temporada</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Partidos
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {finishedMatches.length}
                </p>
                <span className="text-[10px] text-emerald-500 font-semibold">Jugados</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Goles
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {Math.round(finishedMatches.length * 0.8) || 3}
                </p>
                <span className="text-[10px] text-slate-400">Temporada</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Efectividad
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  85%
                </p>
                <span className="text-[10px] text-blue-500 font-semibold">Minutos</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tarjetas
                </span>
                <p className="text-2xl font-black text-amber-500">
                  0
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">Juego Limpio</span>
              </div>
            </div>
          </div>

          {/* Player Team Schedule & Fixtures */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Calendario de Partidos de {playerTeam?.name || 'Tu Equipo'}</span>
            </h3>

            {teamMatches.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No hay partidos programados para tu club en las jornadas actuales.
              </div>
            ) : (
              <div className="space-y-2.5">
                {teamMatches.map((match) => {
                  const isHome = match.homeTeamId === playerTeam?.id;
                  const rivalTeam = teams.find((t) => t.id === (isHome ? match.awayTeamId : match.homeTeamId));
                  const isFinished = match.status === 'Finalizado';

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">
                          J{match.matchdayNumber}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {isHome ? 'Local vs ' : 'Visita vs '}
                            <strong className="text-slate-800 dark:text-slate-200">{rivalTeam?.name || 'Rival'}</strong>
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {match.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              {match.field}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {isFinished ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {match.homeScore} - {match.awayScore}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Final
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {match.time} hrs
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Programado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
