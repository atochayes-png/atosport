import React, { useState } from 'react';
import { 
  Crown, 
  Trophy, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  Activity, 
  Users, 
  FileCheck, 
  MapPin, 
  Calendar, 
  Lock, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Tournament } from '../types/tournament';
import { Team } from '../types/team';
import { Match } from '../types/match';
import { Player } from '../types/player';
import { useAuth } from '../context/AuthContext';
import { ROLE_CONFIGS } from '../types/auth';

interface MasterControlPanelProps {
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  players: Player[];
  onOpenNewTournament: () => void;
  onSelectTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'tournaments' | 'scores' | 'community' | 'master') => void;
}

export const MasterControlPanel: React.FC<MasterControlPanelProps> = ({
  tournaments,
  teams,
  matches,
  players,
  onOpenNewTournament,
  onSelectTournament,
  onDeleteTournament,
  onNavigateTab,
}) => {
  const { currentUser, users, switchUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const liveMatchesCount = matches.filter((m) => m.status === 'En Vivo').length;
  const sports = Array.from(new Set(tournaments.map((t) => t.sport)));

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || t.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner - Master Status & Inviolable Root Account */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e0720] via-[#0B0F17] to-[#071318] border-2 border-purple-500/40 p-6 sm:p-8 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-500/30 to-amber-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
                <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Master · MASTER</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bypass Total & Acceso Sin Restricciones</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Credenciales Inmutables: Master / Master1</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight flex items-center gap-3">
              <span>Centro de Mando Maestro ATOSPORT</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Facultades absolutas de superadministrador y cuenta fundadora. Tienes visibilidad global, edición ilimitada y gobernanza total sobre todas las ligas, torneos, clubes, cédulas arbitrales y usuarios de la plataforma.
            </p>
          </div>

          {/* Quick Primary Master Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenNewTournament}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all min-h-[46px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nuevo Torneo / Liga</span>
            </button>

            <button
              onClick={() => onNavigateTab('scores')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Ver Marcadores en Vivo ({liveMatchesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Torneos y Ligas</span>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {tournaments.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Bajo Control Master</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Clubes Registrados</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {teams.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Comunidades activas en La Tribuna
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Partidos & Cédulas</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {matches.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {liveMatchesCount > 0 ? `⚡ ${liveMatchesCount} en desarrollo` : 'Sin partidos en juego'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Jugadores & Fichas</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {players.length}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Credenciales digitales emitidas
          </div>
        </div>
      </div>

      {/* Direct Global Route Navigation Links */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Acceso Directo e Ilimitado a Rutas:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>/panel (Dashboard)</span>
          </button>

          <button
            onClick={() => onNavigateTab('tournaments')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-blue-500" />
            <span>/torneos (Directorio)</span>
          </button>

          <button
            onClick={() => onNavigateTab('scores')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>/marcadores (En Vivo)</span>
          </button>

          <button
            onClick={() => onNavigateTab('community')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>/tribuna (Comunidad)</span>
          </button>
        </div>
      </div>

      {/* Global Tournaments Registry with Total Governance */}
      <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <span>Gobernanza de Torneos y Ligas ({filteredTournaments.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control maestro para crear, editar, reconfigurar reglamento y eliminar cualquier liga.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar torneo o sede..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-60"
            />
            {sports.length > 1 && (
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todos los deportes</option>
                {sports.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTournaments.map((tournament) => {
            const tournamentTeams = teams.filter((t) => t.tournamentId === tournament.id);
            const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);
            return (
              <div
                key={tournament.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {tournament.sport}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {tournament.status}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {tournament.name}
                  </h3>

                  <div className="space-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{tournament.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{tournament.season}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 mt-3">
                    <span>{tournamentTeams.length} Clubes</span>
                    <span>{tournamentMatches.length} Partidos</span>
                    <span className="text-purple-500 font-bold">
                      {tournament.rules?.penaltiesEnabled ? 'Penales ON' : 'Reglas STD'}
                    </span>
                  </div>
                </div>

                {/* Master Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <button
                    onClick={() => onSelectTournament(tournament)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 transition-all shadow-xs"
                  >
                    <span>Administrar Liga</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿ELIMINAR DEFINITIVAMENTE el torneo "${tournament.name}" y todos sus clubes/partidos vinculados?`)) {
                        onDeleteTournament(tournament.id);
                      }
                    }}
                    title="Eliminar torneo (Facultad Master)"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users & Role Security Lock Registry */}
      <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <span>Registro de Usuarios y Candados de Seguridad ({users.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              La cuenta 'Master' es única, fundadora e inmutable. Nadie puede registrarse con este nombre ni con el rol MASTER.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30">
            Candado Estricto Activo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Estado de Candado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((u) => {
                const isMasterAcc = u.role === 'MASTER' || u.username.toLowerCase() === 'master';
                const roleCfg = ROLE_CONFIGS[u.role];
                return (
                  <tr key={u.id} className={isMasterAcc ? 'bg-purple-500/5' : ''}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isMasterAcc && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span>{u.username}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {u.displayName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${roleCfg?.badgeClass || ''}`}>
                        {roleCfg?.badgeLabel || u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isMasterAcc ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <Lock className="w-3 h-3" />
                          Cuenta Raíz Blindada
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Cuenta Estándar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                        >
                          Probar Rol
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
