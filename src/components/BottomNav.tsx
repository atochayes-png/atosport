import React from 'react';
import { Trophy, Activity, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentTab: 'dashboard' | 'tournaments' | 'scores';
  onNavigate: (tab: 'dashboard' | 'tournaments' | 'scores') => void;
  onOpenNewTournament: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenNewTournament,
}) => {
  const { canManageTournaments } = useAuth();
  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070A0F]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/90 px-3 py-1.5 shadow-lg transition-colors duration-200"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {currentTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Dashboard</span>
        </button>

        {/* Tab Torneos */}
        <button
          onClick={() => onNavigate('tournaments')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
            currentTab === 'tournaments'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Trophy className="w-5 h-5" />
            {currentTab === 'tournaments' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Torneos</span>
        </button>

        {/* Central Action Button (+ Crear) - Only for tournament managers */}
        {canManageTournaments() && (
          <div className="flex-1 flex justify-center -mt-4">
            <button
              onClick={onOpenNewTournament}
              aria-label="Crear nuevo torneo"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-md dark:shadow-emerald-glow active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        )}

        {/* Tab Marcadores */}
        <button
          onClick={() => onNavigate('scores')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
            currentTab === 'scores'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5" />
            {currentTab === 'scores' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Marcadores</span>
        </button>
      </div>
    </nav>
  );
};
