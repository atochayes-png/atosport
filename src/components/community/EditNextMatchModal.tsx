import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Shield, Save } from 'lucide-react';
import { NextMatchCall } from '../../types/community';
import { Team } from '../../types/team';

interface EditNextMatchModalProps {
  isOpen: boolean;
  team: Team;
  nextMatch: NextMatchCall | null;
  onClose: () => void;
  onSave: (updated: NextMatchCall) => void;
}

export const EditNextMatchModal: React.FC<EditNextMatchModalProps> = ({
  isOpen,
  team,
  nextMatch,
  onClose,
  onSave,
}) => {
  const [rivalName, setRivalName] = useState('');
  const [field, setField] = useState('Cancha 1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');

  useEffect(() => {
    if (isOpen && nextMatch) {
      setRivalName(nextMatch.rivalName);
      setField(nextMatch.field);
      setDate(nextMatch.date);
      setTime(nextMatch.time);
    } else if (isOpen) {
      const tomorrow = new Date(Date.now() + 86400000);
      const pad = (n: number) => String(n).padStart(2, '0');
      setDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`);
      setTime('20:30');
      setRivalName('');
      setField('Cancha 1 (Estadio Principal)');
    }
  }, [isOpen, nextMatch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rivalName.trim() || !date || !time) return;

    onSave({
      teamId: team.id,
      rivalName: rivalName.trim(),
      field: field.trim() || 'Cancha por asignar',
      date,
      time,
      confirmations: nextMatch?.confirmations || {},
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Editar Convocatoria de Partido
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Próximo encuentro de {team.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Equipo Rival</span>
            </label>
            <input
              type="text"
              value={rivalName}
              onChange={(e) => setRivalName(e.target.value)}
              placeholder="Ej. Cerveceros Sporting, Deportivo Montejo..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fecha</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Hora</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Cancha / Sede</span>
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="Ej. Cancha 1, Campo Deportivo Modelo..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Convocatoria</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
