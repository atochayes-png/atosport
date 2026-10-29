import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Users, 
  Whistle, 
  Crown,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  UserRole, 
  ROLE_CONFIGS, 
  validateUsername, 
  validatePassword, 
  INITIAL_USERS 
} from '../types/auth';

export const LoginView: React.FC = () => {
  const { login, register, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('REPRESENTANTE');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Real-time validations
  const usernameValidation = validateUsername(username);
  const passwordValidation = validatePassword(password);

  // Rules checklist items
  const usernameLengthOk = username.length >= 6;
  const usernameUpperOk = /[A-Z]/.test(username);
  const usernameNoEmailOk = !username.includes('@');

  const passwordLengthOk = password.length >= 6;
  const passwordUpperOk = /[A-Z]/.test(password);
  const passwordNumberOk = /[0-9]/.test(password);

  const canSubmit = usernameValidation.isValid && passwordValidation.isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!canSubmit) {
      setSubmitError('Por favor cumple todos los requisitos de usuario y contraseña.');
      return;
    }

    if (mode === 'login') {
      const res = login(username, password);
      if (!res.success) {
        setSubmitError(res.error || 'Credenciales inválidas.');
      }
    } else {
      const res = register({
        username,
        password,
        displayName: displayName || username,
        role: selectedRole,
      });
      if (!res.success) {
        setSubmitError(res.error || 'Error al registrar usuario.');
      }
    }
  };

  const handleQuickLogin = (testUser: typeof INITIAL_USERS[0]) => {
    switchUser(testUser.id);
  };

  const getRoleIcon = (role: UserRole) => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-900 dark:text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* Brand Logo & Name */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xl mb-4">
          <img
            src="/logo-atosport.png"
            alt="ATOSPORT Logo"
            className="w-12 h-12 object-contain rounded-xl drop-shadow-md"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>ATOSPORT</span>
          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            SaaS
          </span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Control de Acceso y Gestión Deportiva Profesional
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 space-y-6">
        {/* Main Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          {/* Mode Switch Tabs (Login vs Register) */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSubmitError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setSubmitError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Crear Nueva Cuenta
            </button>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Display Name (Only in Register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nombre Completo o Razón Deportiva
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Role Selector (Only in Register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rol de Acceso en ATOSPORT
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((roleKey) => {
                    const cfg = ROLE_CONFIGS[roleKey];
                    const isSelected = selectedRole === roleKey;
                    const Icon = getRoleIcon(roleKey);
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => setSelectedRole(roleKey)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-[#070A0F] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${cfg.badgeClass}`}>
                            {cfg.badgeLabel}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold leading-tight truncate">
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Username Input with Strict Rules Checklist */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Usuario <span className="text-slate-400 font-normal">(sin correos electrónicos)</span>
                </label>
                <span className="text-[10px] text-slate-400">Ej. Carlos</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Escribe tu usuario (ej. Carlos)"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSubmitError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    username.length === 0
                      ? 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                      : usernameValidation.isValid
                      ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500'
                      : 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Real-time Username Checklist */}
              {username.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className={`flex items-center gap-1 font-semibold ${usernameLengthOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {usernameLengthOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Mínimo 6 caracteres
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${usernameUpperOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {usernameUpperOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Al menos 1 mayúscula
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${usernameNoEmailOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {usernameNoEmailOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Sin formato email
                  </span>
                </div>
              )}
            </div>

            {/* Password Input with Strict Rules Checklist */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <span className="text-[10px] text-slate-400">Ej. Carlos1</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Escribe tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSubmitError(null);
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                    password.length === 0
                      ? 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                      : passwordValidation.isValid
                      ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500'
                      : 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Checklist */}
              {password.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className={`flex items-center gap-1 font-semibold ${passwordLengthOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordLengthOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Mínimo 6 caracteres
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${passwordUpperOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordUpperOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    1 Mayúscula
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${passwordNumberOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordNumberOk ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    1 Número
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                canSubmit
                  ? 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-emerald-glow'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{mode === 'login' ? 'Ingresar a ATOSPORT' : 'Crear Cuenta y Acceder'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Quick Demo Access Bar (Instant 1-click test roles) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Cuentas de Prueba Rápidas (1 Clic)
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Semilla Local</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Haz clic en cualquiera de los roles para probar sus vistas y restricciones de inmediato:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {INITIAL_USERS.map((u) => {
              const cfg = ROLE_CONFIGS[u.role];
              const Icon = getRoleIcon(u.role);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#070A0F] dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {u.username}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${cfg.badgeClass}`}>
                      {cfg.badgeLabel}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="truncate">Pass: {u.password}</span>
                    <span className="text-emerald-500 font-bold group-hover:translate-x-0.5 transition-transform">
                      Entrar →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
