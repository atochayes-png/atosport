export type UserRole = 'MASTER' | 'ADMIN_LIGA' | 'REPRESENTANTE' | 'ARBITRO' | 'JUGADOR';

export interface User {
  id: string;
  username: string; // Min 6 chars, >= 1 uppercase letter, NO email
  password?: string;
  displayName: string;
  role: UserRole;
  teamId?: string; // Linked team for REPRESENTANTE or JUGADOR
  playerId?: string; // Linked player profile for JUGADOR
  tournamentId?: string;
  createdAt: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  badgeLabel: string;
  badgeClass: string;
  dotClass: string;
  description: string;
  permissionsSummary: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  MASTER: {
    role: 'MASTER',
    label: 'Master Fundador',
    badgeLabel: 'MASTER',
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/40 ring-1 ring-purple-500/20 shadow-xs',
    dotClass: 'bg-purple-500 animate-pulse',
    description: 'Control absoluto del sistema ATOSPORT, torneos, clubes, arbitraje y usuarios.',
    permissionsSummary: 'Acceso Total · Bypass Fundador Activo',
  },
  ADMIN_LIGA: {
    role: 'ADMIN_LIGA',
    label: 'Dueño / Admin de Liga',
    badgeLabel: 'ADMIN LIGA',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-500',
    description: 'Gestor de torneos, aprobación de clubes, programación de jornadas y reglamento.',
    permissionsSummary: 'Gestión de ligas y fixture',
  },
  REPRESENTANTE: {
    role: 'REPRESENTANTE',
    label: 'Capitán / Representante',
    badgeLabel: 'CAPITÁN',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    description: 'Gestión exclusiva de la plantilla de su club y control financiero de cuotas.',
    permissionsSummary: 'Gestión de club y plantilla',
  },
  ARBITRO: {
    role: 'ARBITRO',
    label: 'Árbitro Oficial',
    badgeLabel: 'ÁRBITRO',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
    description: 'Captura y validación de marcadores oficiales, actas de juego y tandas de penales.',
    permissionsSummary: 'Captura oficial de resultados',
  },
  JUGADOR: {
    role: 'JUGADOR',
    label: 'Jugador Federado',
    badgeLabel: 'JUGADOR',
    badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
    dotClass: 'bg-teal-500',
    description: 'Consulta de credencial digital, calendario de partidos, tabla y estado de cuota.',
    permissionsSummary: 'Consulta y credencial digital',
  },
};

export const MASTER_USER: User = {
  id: 'u-master',
  username: 'Master',
  password: 'Master1',
  displayName: 'Master',
  role: 'MASTER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const INITIAL_USERS: User[] = [
  MASTER_USER,
  {
    id: 'u-admin-liga',
    username: 'AdminLiga',
    password: 'Liga123',
    displayName: 'Roberto Liga',
    role: 'ADMIN_LIGA',
    tournamentId: 't-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-capitan',
    username: 'Capitan1',
    password: 'Capitan123',
    displayName: 'Carlos Pech',
    role: 'REPRESENTANTE',
    teamId: 'team-101',
    tournamentId: 't-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-arbitro',
    username: 'Arbitro1',
    password: 'Arbitro123',
    displayName: 'Colegiado Gabriel Ortiz',
    role: 'ARBITRO',
    tournamentId: 't-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-jugador',
    username: 'Jugador1',
    password: 'Jugador123',
    displayName: 'Carlos Méndez #10',
    role: 'JUGADOR',
    teamId: 'team-101',
    playerId: 'p-1',
    tournamentId: 't-1',
    createdAt: new Date().toISOString(),
  },
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  if (username.length < 6) {
    errors.push('Mínimo 6 caracteres');
  }
  if (!/[A-Z]/.test(username)) {
    errors.push('Al menos 1 letra mayúscula (ej. Carlos)');
  }
  if (username.includes('@')) {
    errors.push('No uses formato de correo electrónico');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isReservedMasterUsername(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return normalized === 'master' || normalized === 'master1';
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  if (password.length < 6) {
    errors.push('Mínimo 6 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos 1 letra mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos 1 número (ej. Carlos1)');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
