export type PlayerPosition = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
export type PlayerPaymentStatus = 'Liquidado' | 'Pendiente';

export interface Player {
  id: string;
  teamId: string;
  tournamentId: string;
  name: string;
  number: number; // 1 - 99
  position: PlayerPosition;
  phone?: string;
  photoUrl?: string; // Base64 dataURL or image link
  feeAssigned: number; // Cuota asignada (ej. $350)
  feePaid: number; // Monto pagado
  paymentStatus: PlayerPaymentStatus;
  createdAt: string;
}

export interface TeamFinance {
  teamId: string;
  tournamentId: string;
  totalTeamFee: number; // Cuota total de inscripción asignada al equipo (ej. $4,500 MXN)
  suggestedPlayerFee: number; // Cuota sugerida por jugador (ej. $350 MXN)
}
