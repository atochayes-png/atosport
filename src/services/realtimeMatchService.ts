import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Match, MatchStatus } from '../types/match';

export const REALTIME_MATCH_CHANNEL = 'live-tournament';
export const REALTIME_MATCH_EVENT = 'MATCH_LIVE_UPDATE';

export interface MatchLiveUpdatePayload {
  matchId: string;
  tournamentId: string;
  status: MatchStatus;
  period?: number;
  homeScore: number;
  awayScore: number;
  startedAt?: number;
  secondHalfStartedAt?: number;
  firstHalfDurationSeconds?: number;
  isTimerRunning?: boolean;
  liveMinute?: string;
  liveStage?: '1T' | 'Medio Tiempo' | '2T' | 'Tiempo Extra';
  homePenalties?: number;
  awayPenalties?: number;
  penaltyWinnerId?: string;
  elapsedSeconds?: number;
  updatedAt: number;
}

/**
 * Emite la actualización del partido en vivo a través de Supabase Realtime Broadcast
 * y sincroniza de forma optimista con la base de datos si está disponible.
 */
export async function broadcastMatchLiveUpdate(payload: MatchLiveUpdatePayload): Promise<void> {
  try {
    const channel = supabase.channel(REALTIME_MATCH_CHANNEL);

    await channel.send({
      type: 'broadcast',
      event: REALTIME_MATCH_EVENT,
      payload,
    });

    // Intentar persistir en Supabase table si existe la tabla live_matches o matches
    if (isSupabaseConfigured()) {
      try {
        await Promise.resolve(
          supabase
            .from('live_matches')
            .upsert({
              id: payload.matchId,
              tournament_id: payload.tournamentId,
              status: payload.status,
              period: payload.period,
              home_score: payload.homeScore,
              away_score: payload.awayScore,
              started_at: payload.startedAt,
              second_half_started_at: payload.secondHalfStartedAt,
              first_half_duration_seconds: payload.firstHalfDurationSeconds,
              is_timer_running: payload.isTimerRunning,
              live_minute: payload.liveMinute,
              live_stage: payload.liveStage,
              updated_at: new Date(payload.updatedAt).toISOString(),
            })
        ).catch(() => {});
      } catch {
        // Silencioso si la tabla no está creada
      }
    }
  } catch (error) {
    console.warn('Supabase Realtime broadcast warning:', error);
  }
}

/**
 * Hook de suscripción en tiempo real a cambios de partidos en vivo.
 * Escucha eventos broadcast y cambios en base de datos PostgreSQL de Supabase.
 * Actualiza el estado reactivo sin recargar el navegador y limpia la suscripción al desmontar.
 */
export function useRealtimeLiveMatches(
  onMatchUpdate: (payload: MatchLiveUpdatePayload) => void,
  tournamentId?: string
) {
  const [isConnected, setIsConnected] = useState<boolean>(() => isSupabaseConfigured());
  const onUpdateRef = useRef(onMatchUpdate);

  useEffect(() => {
    onUpdateRef.current = onMatchUpdate;
  }, [onMatchUpdate]);

  useEffect(() => {
    const channel = supabase.channel(REALTIME_MATCH_CHANNEL, {
      config: {
        broadcast: { self: false }, // Evita duplicar el evento en el propio dispositivo que emite
      },
    });

    channel
      .on('broadcast', { event: REALTIME_MATCH_EVENT }, ({ payload }) => {
        if (!payload) return;
        const update = payload as MatchLiveUpdatePayload;
        if (tournamentId && update.tournamentId && update.tournamentId !== tournamentId) {
          return;
        }
        onUpdateRef.current(update);
      })
      // Escucha también cambios en PostgreSQL si la tabla matches o live_matches está configurada
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        (change) => {
          if (!change.new) return;
          const row = change.new as Record<string, unknown>;
          if (tournamentId && row.tournament_id && row.tournament_id !== tournamentId) {
            return;
          }

          onUpdateRef.current({
            matchId: String(row.id || ''),
            tournamentId: String(row.tournament_id || ''),
            status: (row.status as MatchStatus) || 'En Vivo',
            period: typeof row.period === 'number' ? row.period : undefined,
            homeScore: Number(row.home_score ?? 0),
            awayScore: Number(row.away_score ?? 0),
            startedAt: typeof row.started_at === 'number' ? row.started_at : undefined,
            secondHalfStartedAt: typeof row.second_half_started_at === 'number' ? row.second_half_started_at : undefined,
            firstHalfDurationSeconds: typeof row.first_half_duration_seconds === 'number' ? row.first_half_duration_seconds : undefined,
            isTimerRunning: Boolean(row.is_timer_running),
            liveMinute: typeof row.live_minute === 'string' ? row.live_minute : undefined,
            liveStage: row.live_stage as Match['liveStage'],
            updatedAt: Date.now(),
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  return { isConnected };
}
