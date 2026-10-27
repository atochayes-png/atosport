import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  CheckCircle2, 
  Minus, 
  Plus, 
  Swords,
  Activity
} from 'lucide-react';
import { Team } from '../types/team';
import { Match, MatchStatus } from '../types/match';

interface ScoreModalProps {
  isOpen: boolean;
  match: Match | null;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  onClose: () => void;
  onSave: (matchId: string, homeScore: number, awayScore: number, status: MatchStatus) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  match,
  homeTeam,
  awayTeam,
  onClose,
  onSave,
}) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>('Finalizado');

  useEffect(() => {
    if (isOpen && match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setStatus(match.status === 'Programado' ? 'Finalizado' : match.status);
    }
  }, [isOpen, match]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !match) return null;

  const homeColor = homeTeam?.color || '#10B981';
  const awayColor = awayTeam?.color || '#2563EB';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(match.id, Math.max(0, homeScore), Math.max(0, awayScore), status);
  };

  const isHomeWinner = homeScore > awayScore;
  const isDraw = homeScore === awayScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Capturar Marcador Oficial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jornada {match.matchdayNumber} • {match.field}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Teams and Scoreboard Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200 dark:border-slate-800/80">
            <div className="grid grid-cols-5 items-center gap-2 sm:gap-4">
              {/* Home Team Column */}
              <div className="col-span-2 flex flex-col items-center text-center space-y-2.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md transition-transform"
                  style={{
                    backgroundColor: homeColor,
                    boxShadow: `0 6px 16px ${homeColor}35`,
                  }}
                >
                  {homeTeam?.shortName || 'LOC'}
                </div>
                <div className="w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                    Local
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {homeTeam?.name || 'Local'}
                  </p>
                </div>

                {/* Home Score Stepper */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHomeScore((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Restar gol local"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 h-10 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setHomeScore((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 font-bold transition-all shadow-sm"
                    aria-label="Sumar gol local"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center VS & Result Indicator */}
              <div className="col-span-1 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black text-slate-300 dark:text-slate-600 select-none">
                  :
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isDraw ? 'Empate' : isHomeWinner ? 'Gana Local' : 'Gana Visita'}
                </span>
              </div>

              {/* Away Team Column */}
              <div className="col-span-2 flex flex-col items-center text-center space-y-2.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md transition-transform"
                  style={{
                    backgroundColor: awayColor,
                    boxShadow: `0 6px 16px ${awayColor}35`,
                  }}
                >
                  {awayTeam?.shortName || 'VIS'}
                </div>
                <div className="w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                    Visitante
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {awayTeam?.name || 'Visitante'}
                  </p>
                </div>

                {/* Away Score Stepper */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAwayScore((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Restar gol visitante"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 h-10 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setAwayScore((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 font-bold transition-all shadow-sm"
                    aria-label="Sumar gol visitante"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Match Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Estado del Encuentro
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Finalizado' as MatchStatus, label: 'Finalizado', icon: CheckCircle2, desc: 'Computa a tabla' },
                { id: 'En Vivo' as MatchStatus, label: 'En Vivo', icon: Activity, desc: 'En disputa' },
                { id: 'Programado' as MatchStatus, label: 'Programado', icon: Swords, desc: 'Pendiente' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? item.id === 'Finalizado'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : item.id === 'En Vivo'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'bg-white dark:bg-[#070A0F] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                    <span className="text-[9px] font-normal opacity-75">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notice on Standings Table sync */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>
              Al marcar como <strong>Finalizado</strong>, los puntos y goles se actualizarán automáticamente en la <strong>Tabla de Posiciones</strong>.
            </span>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Marcador Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
