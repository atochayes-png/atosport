import React, { useState, useEffect } from 'react';
import { Match } from '../types/match';

/**
 * Formatea segundos en formato MM:SS
 * ej. 868 -> "14:28", 2100 -> "35:00"
 */
export function formatMMSS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formatea segundos agregados en formato +M:SS
 * ej. 135 -> "+2:15"
 */
export function formatAddedTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `+${mins}:${String(secs).padStart(2, '0')}`;
}

export interface MatchTimerState {
  status: 'NOT_STARTED' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'FINISHED';
  period: number;
  isRunning: boolean;
  totalElapsedSeconds: number;
  nominalTargetSeconds: number;
  addedSeconds: number;
  isAddedTime: boolean;
  formattedTime: string;       // ej. "14:28", "35:00", "64:10"
  formattedAddedTime: string | null; // ej. "+2:15"
  clockDisplay: string;        // ej. "14:28", "35:00 +2:15", "64:10"
  badgeLabel: string;          // ej. "🔴 EN VIVO · 28:45", "🔴 2T · 64:10", "⏸ MEDIO TIEMPO"
  stageLabel: string;          // "Sin Iniciar" | "1T" | "Medio Tiempo" | "2T" | "Finalizado"
}

/**
 * Motor de cálculo de cronómetro por marcas de tiempo (Date.now())
 * Resiliente a recargas de página, bloqueos de pantalla y cierres de sesión.
 */
export function calculateMatchTime(
  match: Match | null | undefined,
  halfDurationMinutes: number = 35
): MatchTimerState {
  const durationMin = match?.halfDurationMinutes || halfDurationMinutes || 35;
  const firstHalfNominal = durationMin * 60;
  const fullMatchNominal = durationMin * 60 * 2;

  // Estado: Sin datos o Programado / No iniciado
  if (!match || match.status === 'Programado' || (!match.startedAt && match.status !== 'En Vivo' && match.status !== 'Finalizado')) {
    return {
      status: 'NOT_STARTED',
      period: 0,
      isRunning: false,
      totalElapsedSeconds: 0,
      nominalTargetSeconds: firstHalfNominal,
      addedSeconds: 0,
      isAddedTime: false,
      formattedTime: '00:00',
      formattedAddedTime: null,
      clockDisplay: '00:00',
      badgeLabel: 'Programado',
      stageLabel: 'Sin Iniciar',
    };
  }

  // Estado: Finalizado
  if (match.status === 'Finalizado') {
    return {
      status: 'FINISHED',
      period: 2,
      isRunning: false,
      totalElapsedSeconds: fullMatchNominal,
      nominalTargetSeconds: fullMatchNominal,
      addedSeconds: 0,
      isAddedTime: false,
      formattedTime: formatMMSS(fullMatchNominal),
      formattedAddedTime: null,
      clockDisplay: formatMMSS(fullMatchNominal),
      badgeLabel: 'Finalizado',
      stageLabel: 'Finalizado',
    };
  }

  const now = Date.now();

  // Estado: Medio Tiempo
  if (match.liveStage === 'Medio Tiempo') {
    const recorded1T = match.firstHalfDurationSeconds || firstHalfNominal;
    return {
      status: 'HALF_TIME',
      period: 1,
      isRunning: false,
      totalElapsedSeconds: recorded1T,
      nominalTargetSeconds: firstHalfNominal,
      addedSeconds: Math.max(0, recorded1T - firstHalfNominal),
      isAddedTime: recorded1T > firstHalfNominal,
      formattedTime: formatMMSS(firstHalfNominal),
      formattedAddedTime: null,
      clockDisplay: '⏸ MEDIO TIEMPO',
      badgeLabel: '⏸ MEDIO TIEMPO',
      stageLabel: 'Medio Tiempo',
    };
  }

  // Estado: Segundo Tiempo (2T)
  if (match.period === 2 || match.liveStage === '2T') {
    let elapsed2T = 0;
    if (match.secondHalfStartedAt) {
      if (match.isTimerRunning !== false) {
        elapsed2T = Math.max(0, Math.floor((now - match.secondHalfStartedAt) / 1000));
      } else {
        elapsed2T = 0;
      }
      const totalElapsed = firstHalfNominal + elapsed2T;

      if (totalElapsed <= fullMatchNominal) {
        const timeStr = formatMMSS(totalElapsed);
        return {
          status: 'SECOND_HALF',
          period: 2,
          isRunning: match.isTimerRunning !== false,
          totalElapsedSeconds: totalElapsed,
          nominalTargetSeconds: fullMatchNominal,
          addedSeconds: 0,
          isAddedTime: false,
          formattedTime: timeStr,
          formattedAddedTime: null,
          clockDisplay: timeStr,
          badgeLabel: `🔴 2T · ${timeStr}`,
          stageLabel: '2T',
        };
      } else {
        const added = totalElapsed - fullMatchNominal;
        const regStr = formatMMSS(fullMatchNominal);
        const addStr = formatAddedTime(added);
        return {
          status: 'SECOND_HALF',
          period: 2,
          isRunning: match.isTimerRunning !== false,
          totalElapsedSeconds: totalElapsed,
          nominalTargetSeconds: fullMatchNominal,
          addedSeconds: added,
          isAddedTime: true,
          formattedTime: regStr,
          formattedAddedTime: addStr,
          clockDisplay: `${regStr} ${addStr}`,
          badgeLabel: `🔴 2T · ${regStr} ${addStr}`,
          stageLabel: '2T',
        };
      }
    } else if (match.liveMinute) {
      // Compatibilidad con registros manuales previos
      return {
        status: 'SECOND_HALF',
        period: 2,
        isRunning: true,
        totalElapsedSeconds: fullMatchNominal,
        nominalTargetSeconds: fullMatchNominal,
        addedSeconds: 0,
        isAddedTime: false,
        formattedTime: match.liveMinute,
        formattedAddedTime: null,
        clockDisplay: match.liveMinute,
        badgeLabel: `🔴 2T · ${match.liveMinute}`,
        stageLabel: '2T',
      };
    }
  }

  // Estado: Primer Tiempo (1T)
  if (match.startedAt) {
    let elapsed1T = 0;
    if (match.isTimerRunning !== false) {
      elapsed1T = Math.max(0, Math.floor((now - match.startedAt) / 1000));
    } else {
      elapsed1T = match.firstHalfDurationSeconds || 0;
    }

    if (elapsed1T <= firstHalfNominal) {
      const timeStr = formatMMSS(elapsed1T);
      return {
        status: 'FIRST_HALF',
        period: 1,
        isRunning: match.isTimerRunning !== false,
        totalElapsedSeconds: elapsed1T,
        nominalTargetSeconds: firstHalfNominal,
        addedSeconds: 0,
        isAddedTime: false,
        formattedTime: timeStr,
        formattedAddedTime: null,
        clockDisplay: timeStr,
        badgeLabel: `🔴 EN VIVO · ${timeStr}`,
        stageLabel: '1T',
      };
    } else {
      const added = elapsed1T - firstHalfNominal;
      const regStr = formatMMSS(firstHalfNominal);
      const addStr = formatAddedTime(added);
      return {
        status: 'FIRST_HALF',
        period: 1,
        isRunning: match.isTimerRunning !== false,
        totalElapsedSeconds: elapsed1T,
        nominalTargetSeconds: firstHalfNominal,
        addedSeconds: added,
        isAddedTime: true,
        formattedTime: regStr,
        formattedAddedTime: addStr,
        clockDisplay: `${regStr} ${addStr}`,
        badgeLabel: `🔴 EN VIVO · ${regStr} ${addStr}`,
        stageLabel: '1T',
      };
    }
  }

  // Fallback para partidos en vivo sin timestamp aún
  if (match.liveMinute) {
    const stagePrefix = match.liveStage ? `${match.liveStage} · ` : '';
    return {
      status: 'FIRST_HALF',
      period: 1,
      isRunning: true,
      totalElapsedSeconds: 0,
      nominalTargetSeconds: firstHalfNominal,
      addedSeconds: 0,
      isAddedTime: false,
      formattedTime: match.liveMinute,
      formattedAddedTime: null,
      clockDisplay: match.liveMinute,
      badgeLabel: `🔴 ${stagePrefix}${match.liveMinute}`,
      stageLabel: match.liveStage || '1T',
    };
  }

  return {
    status: 'NOT_STARTED',
    period: 0,
    isRunning: false,
    totalElapsedSeconds: 0,
    nominalTargetSeconds: firstHalfNominal,
    addedSeconds: 0,
    isAddedTime: false,
    formattedTime: '00:00',
    formattedAddedTime: null,
    clockDisplay: '00:00',
    badgeLabel: '🔴 EN VIVO',
    stageLabel: '1T',
  };
}

/**
 * Hook reactivo de cronómetro que se actualiza cada segundo (1000ms)
 * cuando el partido está 'En Vivo' y corriendo.
 */
export function useMatchTimer(
  match: Match | null | undefined,
  halfDurationMinutes: number = 35
): MatchTimerState {
  const [timerState, setTimerState] = useState<MatchTimerState>(() =>
    calculateMatchTime(match, halfDurationMinutes)
  );

  useEffect(() => {
    // Actualización inmediata al cambiar el match o los minutos de reglamento
    setTimerState(calculateMatchTime(match, halfDurationMinutes));

    if (!match || match.status !== 'En Vivo' || match.isTimerRunning === false) {
      return;
    }

    const interval = setInterval(() => {
      setTimerState(calculateMatchTime(match, halfDurationMinutes));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    match?.id,
    match?.status,
    match?.period,
    match?.startedAt,
    match?.secondHalfStartedAt,
    match?.firstHalfDurationSeconds,
    match?.isTimerRunning,
    match?.liveStage,
    match?.liveMinute,
    halfDurationMinutes,
  ]);

  return timerState;
}

interface LiveTimerBadgeProps {
  match: Match | null | undefined;
  halfDurationMinutes?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente visual de Badge Pulsante en Tiempo Real
 * Muestra:
 * - 🔴 EN VIVO · 28:45
 * - 🔴 2T · 64:10
 * - 🔴 1T · 35:00 +2:15 (con tiempo agregado destacado en ámbar)
 * - ⏸ MEDIO TIEMPO
 */
export const LiveTimerBadge: React.FC<LiveTimerBadgeProps> = ({
  match,
  halfDurationMinutes = 35,
  className = '',
  size = 'md',
}) => {
  const timer = useMatchTimer(match, halfDurationMinutes);

  if (!match) return null;

  if (match.status === 'Finalizado') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
        Finalizado
      </span>
    );
  }

  if (match.status === 'Programado' && !timer.isRunning && timer.period === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Programado
      </span>
    );
  }

  // Medio Tiempo: ⏸ MEDIO TIEMPO
  if (timer.status === 'HALF_TIME' || match.liveStage === 'Medio Tiempo') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black tracking-wide uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs ${
        size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs px-3 py-1' : 'text-[10px]'
      } ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <span>⏸ MEDIO TIEMPO</span>
      </span>
    );
  }

  // En Vivo (1T o 2T)
  const isPeriod2 = timer.period === 2 || match.liveStage === '2T';
  const prefix = isPeriod2 ? '2T' : 'EN VIVO';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black tracking-wide uppercase bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shadow-xs ${
      size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs px-3 py-1' : 'text-[10px]'
    } ${className}`}>
      {/* Pulsing Red Dot Indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>

      <span>🔴 {prefix} · {timer.formattedTime}</span>

      {/* Added Extra Time (ej. +2:15 en ámbar) */}
      {timer.isAddedTime && timer.formattedAddedTime && (
        <span className="ml-0.5 text-amber-500 dark:text-amber-400 font-extrabold animate-pulse bg-amber-500/10 px-1 py-0.2 rounded">
          {timer.formattedAddedTime}
        </span>
      )}
    </span>
  );
};
