import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Share2, 
  Activity,
  Trash2,
  Sparkles,
  Crown
} from 'lucide-react';
import { Tournament, TournamentStatus } from '../types/tournament';
import { useAuth } from '../context/AuthContext';

interface TournamentsViewProps {
  tournaments: Tournament[];
  onOpenNewTournament: () => void;
  onDeleteTournament?: (id: string) => void;
  onSelectTournament?: (tournament: Tournament) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  onOpenNewTournament,
  onDeleteTournament,
  onSelectTournament,
}) => {
  const { isMaster } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sport.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case 'Activo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Activo
          </span>
        );
      case 'En Inscripciones':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            Inscripciones
          </span>
        );
      case 'Próximo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            Próximo
          </span>
        );
      case 'Finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 whitespace-nowrap">
            Finalizado
          </span>
        );
    }
  };

  const isRecent = (createdAt: string) => {
    try {
      const createdTime = new Date(createdAt).getTime();
      return Date.now() - createdTime < 1000 * 60 * 30; // within 30 mins
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 transition-colors duration-200">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gestión de Torneos</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {tournaments.length} {tournaments.length === 1 ? 'Torneo' : 'Torneos'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Administra ligas regulares, eliminatorias y cuadrangulares registrados en ATOSPORT.
          </p>
        </div>

        <button
          onClick={onOpenNewTournament}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all w-full sm:w-auto min-h-[44px]"
        >
          {isMaster() ? <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span>{isMaster() ? '+ Nuevo Torneo' : '+ Crear Torneo Demo'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar torneo, deporte o sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-colors min-h-[44px]"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-1 hidden sm:block shrink-0" />
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Activo', label: 'Activos' },
            { id: 'En Inscripciones', label: 'Inscripciones' },
            { id: 'Próximo', label: 'Próximos' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] sm:min-h-0 flex items-center ${
                statusFilter === item.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Torneos */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mx-auto flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No se encontraron torneos</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta cambiar los términos de búsqueda o filtros seleccionados.'
              : 'Aún no has registrado torneos. Comienza creando tu primer torneo oficial.'}
          </p>
          <button
            onClick={onOpenNewTournament}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Crear Torneo Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTournaments.map((tournament) => {
            const teamPercent = Math.min(
              100,
              Math.round((tournament.teamsCount / tournament.maxTeams) * 100)
            );
            const newlyCreated = isRecent(tournament.createdAt);

            return (
              <div
                key={tournament.id}
                onClick={() => onSelectTournament?.(tournament)}
                className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-card-dark transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:-translate-y-0.5"
              >
                {newlyCreated && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-400 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-bl-xl shadow-sm flex items-center gap-1 z-10">
                    <Sparkles className="w-3 h-3" />
                    <span>Nuevo</span>
                  </div>
                )}

                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                      <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {tournament.sport}
                    </span>
                    {getStatusBadge(tournament.status)}
                  </div>

                  {/* Title & Season */}
                  <div className="mt-3.5 sm:mt-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{tournament.season}</span>
                    </div>
                  </div>

                  {/* Sede Info */}
                  <div className="mt-3.5 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F]/70 border border-slate-200 dark:border-slate-800/60 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{tournament.venue}</span>
                  </div>

                  {/* Teams Progress */}
                  <div className="mt-4 sm:mt-5 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        Equipos Registrados
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {tournament.teamsCount} / {tournament.maxTeams}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${teamPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-200 dark:border-slate-800/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTournament?.(tournament);
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold py-1.5 group/btn min-h-[38px] transition-colors ${
                      isMaster()
                        ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                    }`}
                  >
                    {isMaster() && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{isMaster() ? 'Administrar Liga' : 'Ver Detalles y Tablas'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(window.location.href);
                        alert(`Enlace copiado al portapapeles para compartir el torneo: ${tournament.name}`);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Compartir enlace de torneo"
                      aria-label="Compartir enlace"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Exclusivo Master: Bote de basura para eliminación de torneos */}
                    {isMaster() && onDeleteTournament && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿ELIMINAR DEFINITIVAMENTE el torneo "${tournament.name}"? (Facultad exclusiva MASTER)`)) {
                            onDeleteTournament(tournament.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Eliminar torneo (Exclusivo Master)"
                        aria-label="Eliminar torneo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
