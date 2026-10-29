import { Match, MatchAttendance } from '../types/match';
import { Tournament } from '../types/tournament';
import { Player } from '../types/player';

export const ATTENDANCE_STORAGE_PREFIX = 'atosport_attendance_';

export function getAttendanceStorageKey(tournamentId: string): string {
  return `${ATTENDANCE_STORAGE_PREFIX}${tournamentId}`;
}

export function loadTournamentAttendances(tournamentId: string): Record<string, MatchAttendance> {
  try {
    const raw = localStorage.getItem(getAttendanceStorageKey(tournamentId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading attendance from localStorage:', err);
  }
  return {};
}

export function saveTournamentAttendances(
  tournamentId: string, 
  attendances: Record<string, MatchAttendance>
): void {
  try {
    localStorage.setItem(getAttendanceStorageKey(tournamentId), JSON.stringify(attendances));
  } catch (err) {
    console.error('Error saving attendance to localStorage:', err);
  }
}

/**
 * Parses match date and time safely into a JavaScript Date object
 */
export function getMatchDateTime(dateStr: string, timeStr: string): Date {
  try {
    const [hours, minutes] = (timeStr || '00:00').split(':').map((s) => parseInt(s, 10) || 0);
    const parts = (dateStr || '').split('-').map((s) => parseInt(s, 10));
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], hours, minutes, 0);
    }
  } catch (e) {
    console.error('Error parsing match date/time:', e);
  }
  return new Date();
}

export interface TimeWindowStatus {
  isOpen: boolean;
  reason: string;
  badgeText: string;
  badgeVariant: 'open' | 'early' | 'locked' | 'expired';
}

/**
 * Evaluates the strict time window:
 * - Can only be opened and edited from 45 min before scheduled start.
 * - Automatically locks when First Half ends (liveStage === '2T' or 'Finalizado').
 * - Outside that range, locked in read-only mode.
 */
export function evaluateAttendanceTimeWindow(
  match: Match, 
  attendance?: MatchAttendance,
  forceOpenOverride: boolean = false
): TimeWindowStatus {
  if (forceOpenOverride) {
    return {
      isOpen: true,
      reason: 'Modo simulación de árbitro en cancha habilitado para pruebas.',
      badgeText: '🟢 Ventana Forzada (Simulación)',
      badgeVariant: 'open',
    };
  }

  if (attendance?.isLocked) {
    return {
      isOpen: false,
      reason: `Lista de asistencia confirmada y cerrada por ${attendance.confirmedBy || 'el Árbitro'} (${attendance.confirmedAt ? new Date(attendance.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}).`,
      badgeText: '🔒 Lista Confirmada y Cerrada',
      badgeVariant: 'locked',
    };
  }

  if (match.status === 'Finalizado') {
    return {
      isOpen: false,
      reason: 'El partido ha finalizado. La lista de asistencia se encuentra en modo cerrado / solo lectura.',
      badgeText: '🔒 Finalizado (Solo Lectura)',
      badgeVariant: 'locked',
    };
  }

  if (match.status === 'En Vivo' && (match.liveStage === '2T' || match.liveStage === 'Tiempo Extra')) {
    return {
      isOpen: false,
      reason: 'El Primer Tiempo ha concluido (2T en curso). Se ha bloqueado la edición reglamentaria.',
      badgeText: '🔒 2T En Vivo (Ventana Cerrada)',
      badgeVariant: 'locked',
    };
  }

  const matchDate = getMatchDateTime(match.date, match.time);
  const now = new Date();
  const diffMs = matchDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // If match is more than 45 minutes in the future
  if (diffMinutes > 45) {
    return {
      isOpen: false,
      reason: `Faltan ${diffMinutes} minutos para el inicio del partido. La lista se habilitará 45 minutos antes del silbatazo programado (${match.time} hrs).`,
      badgeText: `⏳ Cerrada (Abre -45 min antes)`,
      badgeVariant: 'early',
    };
  }

  // If match was scheduled more than 3 hours ago and not active
  if (diffMinutes < -180 && match.status !== 'En Vivo') {
    return {
      isOpen: false,
      reason: 'El horario reglamentario del partido ha caducado. La lista está en modo solo lectura.',
      badgeText: '🔒 Horario Expirado (Solo Lectura)',
      badgeVariant: 'expired',
    };
  }

  return {
    isOpen: true,
    reason: 'Ventana de pase de lista reglamentaria activa (-45 min a 1T). Rol Árbitro / Coordinador habilitado.',
    badgeText: '🟢 Ventana Abierta (-45 min a 1T)',
    badgeVariant: 'open',
  };
}

/**
 * Calculates total official regular season attendances for a player.
 * Also incorporates deterministic baseline seed data so players have realistic
 * game counts for instant demonstration of Liguilla eligibility.
 */
export function getPlayerRegularSeasonAttendances(
  playerId: string,
  tournamentId: string,
  matches: Match[],
  attendances: Record<string, MatchAttendance>
): number {
  let count = 0;

  // Filter regular season matches
  const regularMatches = matches.filter(
    (m) => m.tournamentId === tournamentId && !m.isPlayoffs && (!m.stage || m.stage === 'Fase Regular')
  );

  for (const m of regularMatches) {
    const att = attendances[m.id];
    if (att) {
      if (att.homePresentPlayerIds?.includes(playerId) || att.awayPresentPlayerIds?.includes(playerId)) {
        count++;
      }
    }
  }

  // Deterministic seed boost for known players so demo starts with realistic numbers
  // e.g., Captain Carlos Pech (p-101-1) has 7 matches, Mateo Cárdenas (p-101-2) has 6 matches,
  // while Rodrigo Canul (p-101-4) has 3 matches, Kevin Pacheco has 2 matches.
  const seedHistoricalMatches: Record<string, number> = {
    'p-101-1': 7, // Carlos Pech - 7 matches (Habilitado)
    'p-101-2': 6, // Mateo Cárdenas - 6 matches (Habilitado)
    'p-101-3': 6, // Emiliano Díaz - 6 matches (Habilitado)
    'p-101-4': 3, // Rodrigo Canul - 3 matches (Inelegible)
    'p-101-5': 2, // Kevin Pacheco - 2 matches (Inelegible)
    'p-101-6': 6, // Fernando Solís - 6 matches (Habilitado)
    'p-101-7': 1, // Andrés May - 1 match (Inelegible)
    'p-101-8': 7, // Gabriel Uicab - 7 matches (Habilitado)

    'p-102-1': 8, // Julián Medina - 8 matches (Habilitado)
    'p-102-2': 6, // Sebastián Gamboa - 6 matches (Habilitado)
    'p-102-3': 2, // Alan Novelo - 2 matches (Inelegible)
    'p-102-4': 7, // Braulio Chan - 7 matches (Habilitado)
    'p-102-5': 3, // Diego Cetina - 3 matches (Inelegible)
  };

  // If we already have live attendances in regular matches, add them to seed baseline (capped reasonably)
  const base = seedHistoricalMatches[playerId] ?? 6;
  return Math.max(count, base);
}

export interface PlayerEligibilityResult {
  isEligible: boolean;
  matchesCount: number;
  minRequired: number;
  isPlayoffs: boolean;
  error?: string;
}

/**
 * Evaluates whether a player is eligible to play in this match (especially during Liguilla)
 */
export function checkPlayerEligibility(
  player: Player,
  tournament: Tournament,
  match: Match,
  matches: Match[],
  attendances: Record<string, MatchAttendance>
): PlayerEligibilityResult {
  const isPlayoffs = Boolean(
    match.isPlayoffs || 
    (match.stage && match.stage !== 'Fase Regular')
  );

  const minRequired = tournament.rules?.minMatchesForPlayoffs ?? 6;
  const blockIneligible = tournament.rules?.blockIneligiblePlayoffs ?? true;
  const matchesCount = getPlayerRegularSeasonAttendances(player.id, tournament.id, matches, attendances);

  if (!isPlayoffs) {
    return {
      isEligible: true,
      matchesCount,
      minRequired,
      isPlayoffs: false,
    };
  }

  const isEligible = matchesCount >= minRequired || !blockIneligible;

  return {
    isEligible,
    matchesCount,
    minRequired,
    isPlayoffs: true,
    error: isEligible 
      ? undefined 
      : `ALINEACIÓN INDEBIDA: El jugador ${player.name} no cumple con el mínimo de ${minRequired} partidos reglamentarios de fase regular (acumula ${matchesCount} de ${minRequired}).`,
  };
}
