import React, { useState } from 'react';
import { Trophy, Plus, Activity, Calendar, ShieldCheck, Sun, Moon, Menu, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { InstallPwaButton } from './InstallPwaButton';

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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (tab: 'dashboard' | 'tournaments' | 'scores') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleMobileCreate = () => {
    onOpenNewTournament();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#070A0F]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group transition-all"
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white dark:bg-[#070A0F] rounded-[10px] flex items-center justify-center transition-colors">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-[#E2E8F0] flex items-center gap-1.5 sm:gap-2">
                  ATOSPORT
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    SaaS
                  </span>
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  Gestión Deportiva
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('tournaments')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'tournaments'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-slate-800/80 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Torneos
              </button>

              <button
                onClick={() => onNavigate('scores')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'scores'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-slate-800/80 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40'
                }`}
              >
                <Activity className="w-4 h-4" />
                Marcadores
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-slate-800/80 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Dashboard
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Organizer Status Pill (Tablets and Desktops) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Modo</span> Organizador
            </div>

            {/* Install PWA Button (Desktop & Tablet) */}
            <InstallPwaButton />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12" />
              )}
            </button>

            {/* Desktop / Tablet Create Tournament Button */}
            <button
              onClick={onOpenNewTournament}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-sm dark:shadow-emerald-glow transition-all duration-200 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Crear Torneo</span>
            </button>

            {/* Mobile / Tablet Menu Button Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-800 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile / Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1 pb-3">
              <button
                onClick={() => handleMobileNav('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  Dashboard Principal
                </span>
                {currentTab === 'dashboard' && <Sparkles className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleMobileNav('tournaments')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'tournaments'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Trophy className="w-4 h-4" />
                  Gestión de Torneos
                </span>
                {currentTab === 'tournaments' && <Sparkles className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleMobileNav('scores')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'scores'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Activity className="w-4 h-4" />
                  Marcadores en Vivo
                </span>
                {currentTab === 'scores' && <Sparkles className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Mobile Menu Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2.5">
              <InstallPwaButton isMobileMenu={true} />

              <button
                onClick={handleMobileCreate}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Crear Nuevo Torneo</span>
              </button>

              <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Panel Oficial de Organizador de Torneos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
