import React from 'react';
import { Trophy, Plus, Activity, Calendar, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'tournaments' | 'scores';
  onNavigate: (tab: 'dashboard' | 'tournaments' | 'scores') => void;
  onOpenNewTournament: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenNewTournament,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070A0F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 text-left group transition-all"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 p-0.5 shadow-emerald-glow group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#070A0F] rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#E2E8F0] flex items-center gap-2">
                  ATOSPORT
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    SaaS
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  Gestión Deportiva
                </span>
              </div>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('tournaments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'tournaments'
                    ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Torneos
              </button>

              <button
                onClick={() => onNavigate('scores')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'scores'
                    ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Activity className="w-4 h-4" />
                Marcadores
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Dashboard
              </button>
            </nav>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 mr-2 py-1 px-2.5 rounded-md bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modo Organizador</span>
            </div>

            <button
              onClick={onOpenNewTournament}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-emerald-glow transition-all duration-200"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Crear Torneo</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav row */}
        <div className="flex md:hidden border-t border-slate-800/60 py-2 gap-2 overflow-x-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('tournaments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'tournaments'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Torneos
          </button>
          <button
            onClick={() => onNavigate('scores')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'scores'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Marcadores
          </button>
        </div>
      </div>
    </header>
  );
};
