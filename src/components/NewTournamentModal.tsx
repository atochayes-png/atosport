import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Crear Nuevo Torneo</h2>
              <p className="text-xs text-slate-400">Registra los datos oficiales de la competencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Nombre del Torneo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre Oficial del Torneo *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ej. Liga Premier Nocturna 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Deporte y Estado en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Deporte / Modalidad
              </label>
              <div className="relative">
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as SportType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  {AVAILABLE_SPORTS.map((s) => (
                    <option key={s} value={s} className="bg-[#0B0F17] text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <Activity className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estado Inicial
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  {AVAILABLE_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-[#0B0F17] text-white">
                      {st}
                    </option>
                  ))}
                </select>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sede */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sede Principal de Encuentros *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ej. Deportivo Centenario, Cancha 1 y 2"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Temporada y Cupo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Temporada / Edición
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Apertura 2026"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cupo Máximo de Equipos
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="64"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070A0F] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-emerald-glow transition-all"
            >
              Registrar Torneo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
