import React from 'react';
import { Trophy, Plus, Shield, Zap, FileSpreadsheet, Users, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenNewTournament: () => void;
  onExploreTournaments: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenNewTournament,
  onExploreTournaments,
}) => {
  return (
    <div className="relative overflow-hidden py-8 sm:py-12 lg:py-16 transition-colors duration-200">
      {/* Decorative gradient glow in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[200px] sm:h-[300px] bg-emerald-500/10 blur-[100px] sm:blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <span>Plataforma Oficial para Ligas y Organizadores</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Control total de tus{' '}
              <span className="emerald-gradient-text">torneos y ligas</span> en tiempo real
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Diseñado exclusivamente para directores deportivos, colegios arbitrales y ligas amateurs o profesionales. Gestiona inscripciones, calendarios, cédulas digitales y tablas de posiciones con precisión de nivel élite.
            </p>

            {/* Quick Actions (Full-width friendly on mobile) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={onOpenNewTournament}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-glow transition-all duration-200 min-h-[48px]"
              >
                <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                <span>Crea tu Torneo Demo</span>
              </button>

              <button
                onClick={onExploreTournaments}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B0F17] hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm transition-all duration-200 min-h-[48px]"
              >
                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ver Torneos y Marcadores</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800/60 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Cédulas Digitales</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Arbitraje Ágil</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Sin Límite de Equipos</span>
              </div>
            </div>
          </div>

          {/* Quick Access Featured Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-5 sm:p-8 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-card-dark overflow-hidden group hover:border-emerald-500/40 dark:hover:border-slate-700 transition-all duration-300">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all pointer-events-none" />

              <div className="relative z-10 space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Simulador Demo Libre</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Sin límite artificial de 5 equipos</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60">
                    Abierto
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200 dark:border-slate-800/80 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Simulación en Navegador:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Flexible</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Configura tu torneo de prueba con el número de clubes que requieras (8, 16, 32 o más). Prueba las reglas oficiales, fixture y tabla de posiciones sin restricciones.
                  </p>
                </div>

                <button
                  onClick={onOpenNewTournament}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-slate-900 hover:text-slate-950 bg-slate-100 hover:bg-emerald-400 dark:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 dark:hover:text-slate-950 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-all duration-200 shadow-sm min-h-[44px]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Configurar Torneo Demo Libre</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
