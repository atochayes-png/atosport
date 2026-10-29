import React, { useState, useRef, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Crown,
  Whistle,
  Users,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ROLE_CONFIGS, UserRole } from '../types/auth';
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
  const { currentUser, users, logout, switchUser, canManageTournaments } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleMobileNav = (tab: 'dashboard' | 'tournaments' | 'scores') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleMobileCreate = () => {
    onOpenNewTournament();
    setMobileMenuOpen(false);
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'MASTER':
        return Crown;
      case 'ADMIN_LIGA':
        return Trophy;
      case 'REPRESENTANTE':
        return ShieldCheck;
      case 'ARBITRO':
        return Whistle;
      case 'JUGADOR':
        return Users;
      default:
        return UserIcon;
    }
  };

  const currentRoleConfig = currentUser ? ROLE_CONFIGS[currentUser.role] : null;
  const RoleIcon = getRoleIcon(currentUser?.role);

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
              <img
                src="/logo-atosport.png"
                alt="Logo ATOSPORT"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
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

          {/* Right Action Buttons & Session Control */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Session Badge & Dropdown */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B0F17] dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95"
                  title="Menú de usuario y cambio de rol"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <RoleIcon className="w-3.5 h-3.5" />
                  </div>

                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate block max-w-[120px]">
                      {currentUser.username}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${currentRoleConfig?.badgeClass}`}>
                    {currentRoleConfig?.badgeLabel}
                  </span>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    {/* User Info Header */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-100 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {currentUser.displayName}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${currentRoleConfig?.badgeClass}`}>
                          {currentRoleConfig?.badgeLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Usuario: <strong className="text-slate-700 dark:text-slate-300">{currentUser.username}</strong>
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-tight pt-1">
                        {currentRoleConfig?.permissionsSummary}
                      </p>
                    </div>

                    {/* Quick Role Switcher */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                        Cambio Rápido de Rol (Demo)
                      </span>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {users.map((u) => {
                          const isCurrent = u.id === currentUser.id;
                          const uCfg = ROLE_CONFIGS[u.role];
                          const UIcon = getRoleIcon(u.role);
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                switchUser(u.id);
                                setUserDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                                isCurrent
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <UIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{u.username}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded ${uCfg.badgeClass}`}>
                                  {uCfg.badgeLabel}
                                </span>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Logout Option */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* Desktop / Tablet Create Tournament Button (Only for MASTER and ADMIN_LIGA) */}
            {canManageTournaments() && (
              <button
                onClick={onOpenNewTournament}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-sm dark:shadow-emerald-glow transition-all duration-200 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Crear Torneo</span>
              </button>
            )}

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
            {/* User Profile summary in mobile menu */}
            {currentUser && (
              <div className="mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {currentUser.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400">@{currentUser.username}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${currentRoleConfig?.badgeClass}`}>
                  {currentRoleConfig?.badgeLabel}
                </span>
              </div>
            )}

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

            {/* Mobile Menu Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2.5">
              <InstallPwaButton isMobileMenu={true} />

              {canManageTournaments() && (
                <button
                  onClick={handleMobileCreate}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Crear Nuevo Torneo</span>
                </button>
              )}

              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
