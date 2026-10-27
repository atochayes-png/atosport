import React, { useState, useEffect } from 'react';
import { X, Trophy, MapPin, Calendar, Activity, Users } from 'lucide-react';
import { SportType, Tournament, TournamentStatus } from '../types/tournament';

interface NewTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tournament: Omit<Tournament, 'id' | 'createdAt'>) => void;
}

const AVAILABLE_SPORTS: SportType[] = [
  'Fútbol 11',
  'Fútbol 7',
  'Fútbol Rápido',
  'Futsal',
  'Básquetbol',
  'Voleibol',
];

const AVAILABLE_STATUSES: TournamentStatus[] = [
  'En Inscripciones',
  'Activo',
  'Próximo',
  'Finalizado',
];

export const NewTournamentModal: React.FC<NewTournamentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('Fútbol 11');
  const [venue, setVenue] = useState('');
  const [season, setSeason] = useState('Apertura 2026');
  const [status, setStatus] = useState<TournamentStatus>('En Inscripciones');
  const [maxTeams, setMaxTeams] = useState<number>(16);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !venue.trim()) return;

    onSave({
      name: name.trim(),
      sport,
      venue: venue.trim(),
      season: season.trim() || 'Temporada 2026',
      status,
      teamsCount: 0,
      maxTeams: Number(maxTeams) || 16,
    });

    // Reset and close
    setName('');
    setVenue('');
    setSeason('Apertura 2026');
    setStatus('En Inscripciones');
    setMaxTeams(16);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* 
        Modal Container:
        - Mobile: Bottom Sheet (slides up from bottom, rounded-t-3xl, max-h-[92vh])
        - Tablet/Desktop: Centered Modal (rounded-2xl, max-w-lg)
      */}
      <div 
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#0B0F17] border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect on desktop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none hidden sm:block" />

        {/* Mobile Pull-Down Indicator */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center items-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Crear Nuevo Torneo
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Registra los datos oficiales de la competencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          {/* Nombre del Torneo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre Oficial del Torneo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Liga Premier Nocturna 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors min-h-[44px]"
            />
          </div>

          {/* Deporte y Estado en 2 columnas (1 col en móvil pequeño, 2 en sm+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deporte / Modalidad
              </label>
              <div className="relative">
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as SportType)}
                  className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer min-h-[44px]"
                >
                  {AVAILABLE_SPORTS.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <Activity className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estado Inicial
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                  className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer min-h-[44px]"
                >
                  {AVAILABLE_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white">
                      {st}
                    </option>
                  ))}
                </select>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sede */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sede Principal de Encuentros *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ej. Deportivo Centenario, Cancha 1 y 2"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors min-h-[44px]"
              />
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Temporada y Cupo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Temporada / Edición
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Apertura 2026"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors min-h-[44px]"
                />
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cupo Máximo de Equipos
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="64"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors min-h-[44px]"
                />
                <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sticky/Fixed Footer Actions to prevent mobile virtual keyboard cutoff */}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#0B0F17]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all min-h-[44px] flex-1 sm:flex-initial"
            >
              Registrar Torneo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
