import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import { ClubCommunityConfig } from '../../types/community';
import { Team } from '../../types/team';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  team: Team;
  config: ClubCommunityConfig;
  onClose: () => void;
  onSave: (newConfig: ClubCommunityConfig) => void;
}

export const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  isOpen,
  team,
  config,
  onClose,
  onSave,
}) => {
  const [funnyTitle, setFunnyTitle] = useState(config.funnySectionTitle || 'El Oso de la Jornada');
  const [historyTitle, setHistoryTitle] = useState(config.historySectionTitle || 'El Baúl Histórico');
  const [slogan, setSlogan] = useState(config.slogan || '');

  useEffect(() => {
    if (isOpen) {
      setFunnyTitle(config.funnySectionTitle || 'El Oso de la Jornada');
      setHistoryTitle(config.historySectionTitle || 'El Baúl Histórico');
      setSlogan(config.slogan || '');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      funnySectionTitle: funnyTitle.trim() || 'El Oso de la Jornada',
      historySectionTitle: historyTitle.trim() || 'El Baúl Histórico',
      slogan: slogan.trim(),
    });
    onClose();
  };

  const teamColor = team.color || '#10B981';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with team color accent */}
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: teamColor }} 
        />

        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-sm"
              style={{ backgroundColor: teamColor }}
            >
              {team.shortName || team.name.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Personalizar Comunidad</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Términos y señas de identidad de <strong className="text-slate-800 dark:text-slate-200">{team.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Slogan / Lema */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Lema Oficial del Club</span>
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ej. ¡Garra, Unión y Tradición Modelo!"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Se mostrará en la cabecera de la red social de tu club.
            </p>
          </div>

          {/* Funny Section Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Nombre de la Sección Chusca / Antirécord</span>
            </label>
            <input
              type="text"
              value={funnyTitle}
              onChange={(e) => setFunnyTitle(e.target.value)}
              placeholder="Ej. El Oso de la Jornada, La Vikingada, La Torada..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              Personaliza el término usado en el Tercer Tiempo para votar la jugada cómica o pifia del juego.
            </p>
          </div>

          {/* History Section Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Nombre del Archivo Histórico</span>
            </label>
            <input
              type="text"
              value={historyTitle}
              onChange={(e) => setHistoryTitle(e.target.value)}
              placeholder="Ej. El Baúl Histórico, La Vikingoteca, La Rayadoteca..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              Nombre de la pestaña que albergará las fotos de campeonatos pasados y convivencias.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
