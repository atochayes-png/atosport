import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  HelpCircle, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Check 
} from 'lucide-react';
import { TournamentRules, DEFAULT_TOURNAMENT_RULES, TieBreakerCriterion } from '../types/tournament';

interface TournamentRulesConfigProps {
  initialRules?: TournamentRules;
  tournamentName: string;
  sport: string;
  onSave: (rules: TournamentRules) => void;
}

export const TournamentRulesConfig: React.FC<TournamentRulesConfigProps> = ({
  initialRules,
  tournamentName,
  sport,
  onSave,
}) => {
  const [rules, setRules] = useState<TournamentRules>(() => {
    return initialRules ? { ...initialRules } : { ...DEFAULT_TOURNAMENT_RULES };
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialRules) {
      setRules({ ...initialRules });
    }
  }, [initialRules]);

  const updateRule = <K extends keyof TournamentRules>(key: K, value: TournamentRules[K]) => {
    setRules((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const applyPreset = (preset: 'fifa' | 'futbol7' | 'tradicional') => {
    if (preset === 'fifa') {
      setRules({
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        penaltiesEnabled: false,
        pointsPenaltiesWin: 2,
        pointsPenaltiesLoss: 1,
        tieBreakerPriority: 'Diferencia de Goles',
      });
    } else if (preset === 'futbol7') {
      setRules({
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        penaltiesEnabled: true,
        pointsPenaltiesWin: 2,
        pointsPenaltiesLoss: 1,
        tieBreakerPriority: 'Diferencia de Goles',
      });
    } else if (preset === 'tradicional') {
      setRules({
        pointsWin: 2,
        pointsDraw: 1,
        pointsLoss: 0,
        penaltiesEnabled: false,
        pointsPenaltiesWin: 2,
        pointsPenaltiesLoss: 1,
        tieBreakerPriority: 'Goles a Favor',
      });
    }
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(rules);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setRules({ ...DEFAULT_TOURNAMENT_RULES });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {sport}
                </span>
                <span className="text-xs text-slate-400">• {tournamentName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Reglamento y Sistema de Puntuación
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Configura los puntos otorgados por partido y los criterios oficiales de desempate en la tabla de posiciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                hasChanges
                  ? 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-emerald-glow'
                  : 'text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 cursor-default'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>¡Reglamento Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Reglamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Presets Shortcuts */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Formatos Rápidos:
        </span>
        <button
          type="button"
          onClick={() => applyPreset('fifa')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all hover:border-emerald-500/40 shadow-xs"
        >
          FIFA Estándar (3 / 1 / 0)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('futbol7')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 transition-all hover:border-emerald-500/40 shadow-xs"
        >
          Fútbol 7 con Penales (3 Vic / 2 Pen / 1 Perd / 0 Der)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('tradicional')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all hover:border-emerald-500/40 shadow-xs"
        >
          Formato Tradicional (2 / 1 / 0)
        </button>
      </div>

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Regular Time Points */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Puntos en Tiempo Regular */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Puntuación en Tiempo Regular
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Fase Regular</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Victoria Regular */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Victoria (Regular)
                  </label>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rules.pointsWin}
                    onChange={(e) => updateRule('pointsWin', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Puntos asignados al equipo ganador al silbatazo final.
                </p>
              </div>

              {/* Empate Regular */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Empate (Regular)
                  </label>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={rules.pointsDraw}
                    onChange={(e) => updateRule('pointsDraw', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Puntos para cada club en caso de igualdad sin penales.
                </p>
              </div>

              {/* Derrota Regular */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Derrota (Regular)
                  </label>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={rules.pointsLoss}
                    onChange={(e) => updateRule('pointsLoss', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Puntos asignados al equipo perdedor en tiempo regular.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Desempate por Penales */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Desempate por Penales en caso de Empate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Disputa de punto extra tras finalizar empatados en tiempo regular
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rules.penaltiesEnabled}
                  onChange={(e) => updateRule('penaltiesEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                <span className="ml-2.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  {rules.penaltiesEnabled ? 'Activado' : 'Desactivado'}
                </span>
              </label>
            </div>

            {rules.penaltiesEnabled ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Puntos al Ganador de Penales
                    </label>
                    <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                      Punto Extra
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={rules.pointsPenaltiesWin}
                      onChange={(e) => updateRule('pointsPenaltiesWin', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-emerald-500/40 text-center font-black text-xl text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-400">PTS</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Suma total otorgada al club vencedor en la tanda desde el punto penal (sugerido: 2 pts).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Puntos al Perdedor de Penales
                    </label>
                    <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                      Consolación
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={rules.pointsPenaltiesLoss}
                      onChange={(e) => updateRule('pointsPenaltiesLoss', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-amber-500/40 text-center font-black text-xl text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-400">PTS</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Puntos reconocidos al club derrotado en penales tras empatar en regular (sugerido: 1 pt).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                <span>
                  Al desactivar los penales, cualquier empate se registrará como empate definitivo otorgando{' '}
                  <strong className="text-slate-900 dark:text-white">{rules.pointsDraw} puntos</strong> a cada equipo sin tanda de penales.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tie-Breakers & Live Preview */}
        <div className="space-y-6">
          {/* Card: Criterio de Desempate en Tabla */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Criterio de Desempate
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Selecciona la prioridad número uno para desempatar a dos o más clubes con la misma cantidad de puntos (PTS) en la tabla general:
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'Diferencia de Goles' as TieBreakerCriterion,
                  title: 'Diferencia de Goles (DIF)',
                  desc: 'Goles anotados menos goles recibidos (Fórmula oficial FIFA).',
                  badge: 'Recomendado',
                },
                {
                  id: 'Goles a Favor' as TieBreakerCriterion,
                  title: 'Goles a Favor (GF)',
                  desc: 'Premia a los clubes con mayor volumen ofensivo anotador.',
                  badge: 'Ofensivo',
                },
                {
                  id: 'Enfrentamiento Directo' as TieBreakerCriterion,
                  title: 'Enfrentamiento Directo',
                  desc: 'Resultado del partido previo disputado entre ambos equipos empatados.',
                  badge: 'Head to Head',
                },
              ].map((item) => {
                const isSelected = rules.tieBreakerPriority === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => updateRule('tieBreakerPriority', item.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#070A0F] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{item.title}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Simulator Summary Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/5 dark:from-[#070A0F] dark:via-slate-900/60 dark:to-emerald-950/20 border border-emerald-500/20 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Resumen del Motor de Puntuación
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Victoria Regular:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">+{rules.pointsWin} Puntos</strong>
              </div>

              {rules.penaltiesEnabled ? (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Empate + Victoria en Penales:</span>
                    <strong className="text-emerald-500 font-extrabold">+{rules.pointsPenaltiesWin} Puntos</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">Empate + Derrota en Penales:</span>
                    <strong className="text-amber-500 font-extrabold">+{rules.pointsPenaltiesLoss} Punto</strong>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">Empate Regular:</span>
                  <strong className="text-blue-500 font-extrabold">+{rules.pointsDraw} Puntos</strong>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Derrota Regular:</span>
                <strong className="text-slate-400 font-extrabold">+{rules.pointsLoss} Puntos</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Desempate ordenado por: <strong className="text-slate-900 dark:text-white">{rules.tieBreakerPriority}</strong>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
