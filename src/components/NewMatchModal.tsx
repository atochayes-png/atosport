import React, { useState, useEffect } from 'react';
import { 
  X, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Shield, 
  Sparkles, 
  AlertCircle,
  Swords
} from 'lucide-react';
import { Team } from '../types/team';
import { Match } from '../types/match';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentVenue: string;
  matchdayNumber: number;
  teams: Team[];
  onSave: (data: Omit<Match, 'id' | 'createdAt'>) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  tournamentId,
  tournamentVenue,
  matchdayNumber,
  teams,
  onSave,
}) => {
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [field, setField] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or preset values when modal opens
  useEffect(() => {
    if (isOpen) {
      // Pick first two teams if available
      if (teams.length >= 2) {
        setHomeTeamId(teams[0].id);
        setAwayTeamId(teams[1].id);
      } else if (teams.length === 1) {
        setHomeTeamId(teams[0].id);
        setAwayTeamId('');
      } else {
        setHomeTeamId('');
        setAwayTeamId('');
      }

      // Default date to tomorrow in YYYY-MM-DD
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);

      setTime('19:00');
      setField(tournamentVenue || 'Cancha 1');
      setErrors({});
    }
  }, [isOpen, teams, tournamentVenue]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const homeTeam = teams.find((t) => t.id === homeTeamId);
  const awayTeam = teams.find((t) => t.id === awayTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!homeTeamId) {
      newErrors.homeTeam = 'Selecciona el equipo local.';
    }
    if (!awayTeamId) {
      newErrors.awayTeam = 'Selecciona el equipo visitante.';
    }
    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      newErrors.awayTeam = 'Un equipo no puede jugar contra sí mismo.';
    }
    if (!date) {
      newErrors.date = 'Indica la fecha del partido.';
    }
    if (!time) {
      newErrors.time = 'Indica la hora del partido.';
    }
    if (!field.trim()) {
      newErrors.field = 'Indica la cancha o campo del encuentro.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      tournamentId,
      matchdayNumber,
      homeTeamId,
      awayTeamId,
      date,
      time,
      field: field.trim(),
      status: 'Programado',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Programar Partido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jornada {matchdayNumber} • Rol Oficial de Juegos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Match Preview */}
        <div className="px-5 sm:px-6 pt-4 pb-3 bg-slate-50/70 dark:bg-[#070A0F]/70 border-b border-slate-200 dark:border-slate-800/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Vista previa del partido
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 sm:gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm transition-colors"
                style={{
                  backgroundColor: homeTeam?.color || '#10B981',
                }}
              >
                {homeTeam?.shortName || 'LOC'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Local</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {homeTeam?.name || 'Selecciona Local'}
                </p>
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center shrink-0 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-[11px] border border-slate-200 dark:border-slate-700">
                VS
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                {time || '19:00'}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Visitante</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {awayTeam?.name || 'Selecciona Visita'}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm transition-colors"
                style={{
                  backgroundColor: awayTeam?.color || '#2563EB',
                }}
              >
                {awayTeam?.shortName || 'VIS'}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {teams.length < 2 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Este torneo cuenta con pocos equipos inscritos. Inscribe más clubes en la pestaña <strong>Equipos</strong> para armar el rol.
              </span>
            </div>
          )}

          {/* Teams Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Team */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Equipo Local <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={homeTeamId}
                  onChange={(e) => {
                    setHomeTeamId(e.target.value);
                    if (errors.homeTeam) {
                      setErrors((prev) => ({ ...prev, homeTeam: '' }));
                    }
                  }}
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
                    errors.homeTeam
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                >
                  <option value="" disabled>Selecciona equipo local...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.shortName})
                    </option>
                  ))}
                </select>
                <Shield className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.homeTeam && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.homeTeam}
                </p>
              )}
            </div>

            {/* Away Team */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Equipo Visitante <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={awayTeamId}
                  onChange={(e) => {
                    setAwayTeamId(e.target.value);
                    if (errors.awayTeam) {
                      setErrors((prev) => ({ ...prev, awayTeam: '' }));
                    }
                  }}
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
                    errors.awayTeam
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                >
                  <option value="" disabled>Selecciona equipo visitante...</option>
                  {teams.map((team) => (
                    <option 
                      key={team.id} 
                      value={team.id}
                      disabled={team.id === homeTeamId}
                    >
                      {team.name} ({team.shortName}) {team.id === homeTeamId ? '(Ya es local)' : ''}
                    </option>
                  ))}
                </select>
                <Shield className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.awayTeam && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.awayTeam}
                </p>
              )}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fecha del Encuentro <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${
                    errors.date
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
                <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Hora de Inicio <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${
                    errors.time
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.time && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          {/* Cancha / Campo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Cancha / Campo de Juego <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="ej. Cancha 1 (Sintético), Cancha 2, Estadio..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.field
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.field && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.field}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={teams.length < 2}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                teams.length < 2
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 dark:shadow-emerald-glow'
              }`}
            >
              <Swords className="w-4 h-4 stroke-[2.5]" />
              <span>Programar Encuentro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
