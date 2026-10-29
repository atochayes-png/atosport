import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  CheckCircle2, 
  Minus, 
  Plus, 
  Swords,
  Flame,
  AlertTriangle,
  Radio,
  Clock,
  Flag,
  Users
} from 'lucide-react';
import { Team } from '../types/team';
import { Match, MatchStatus, MatchAttendance } from '../types/match';
import { TournamentRules, Tournament } from '../types/tournament';
import { Player } from '../types/player';
import { checkPlayerEligibility } from '../utils/attendanceUtils';

interface ScoreModalProps {
  isOpen: boolean;
  match: Match | null;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  rules?: TournamentRules;
  players?: Player[];
  tournament?: Tournament;
  allMatches?: Match[];
  allAttendances?: Record<string, MatchAttendance>;
  onClose: () => void;
  onSave: (
    matchId: string, 
    homeScore: number, 
    awayScore: number, 
    status: MatchStatus,
    homePenalties?: number,
    awayPenalties?: number,
    penaltyWinnerId?: string,
    liveMinute?: string,
    liveStage?: '1T' | 'Medio Tiempo' | '2T' | 'Tiempo Extra'
  ) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  match,
  homeTeam,
  awayTeam,
  rules,
  players = [],
  tournament,
  allMatches = [],
  allAttendances = {},
  onClose,
  onSave,
}) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homePenalties, setHomePenalties] = useState<number>(0);
  const [awayPenalties, setAwayPenalties] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>('Finalizado');
  const [liveStage, setLiveStage] = useState<'1T' | 'Medio Tiempo' | '2T' | 'Tiempo Extra'>('1T');
  const [liveMinute, setLiveMinute] = useState<string>("10'");
  const [penaltyError, setPenaltyError] = useState<string | null>(null);

  // Ineligibility alert state for event registration
  const [ineligibilityAlert, setIneligibilityAlert] = useState<{
    show: boolean;
    playerName: string;
    minRequired: number;
    matchesCount: number;
  } | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'Gol' | 'Asistencia' | 'Tarjeta Amarilla' | 'Tarjeta Roja'>('Gol');
  const [eventSuccessMsg, setEventSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setHomePenalties(match.homePenalties ?? (match.penaltyWinnerId === match.homeTeamId ? 5 : 4));
      setAwayPenalties(match.awayPenalties ?? (match.penaltyWinnerId === match.awayTeamId ? 5 : 4));
      setStatus(match.status === 'Programado' ? 'Finalizado' : match.status);
      setLiveStage(match.liveStage || '1T');
      setLiveMinute(match.liveMinute || (match.status === 'En Vivo' ? "45'" : "10'"));
      setPenaltyError(null);
    }
  }, [isOpen, match]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !match) return null;

  const homeColor = homeTeam?.color || '#10B981';
  const awayColor = awayTeam?.color || '#2563EB';

  const isHomeWinner = homeScore > awayScore;
  const isDraw = homeScore === awayScore;
  const isPenaltiesActive = Boolean(rules?.penaltiesEnabled);
  const showPenaltiesBlock = status === 'Finalizado' && isDraw && isPenaltiesActive;

  const handleSubmit = (e?: React.FormEvent, forcedStatus?: MatchStatus) => {
    if (e) e.preventDefault();
    const effectiveStatus = forcedStatus || status;
    const safeHomeScore = Math.max(0, homeScore);
    const safeAwayScore = Math.max(0, awayScore);

    const isFinished = effectiveStatus === 'Finalizado';
    const checkPenalties = isFinished && isDraw && isPenaltiesActive;

    if (checkPenalties) {
      if (homePenalties === awayPenalties) {
        setPenaltyError('En la definición por penales debe haber un ganador para otorgar el punto extra.');
        setStatus('Finalizado');
        return;
      }
      const penaltyWinnerId = homePenalties > awayPenalties ? homeTeam?.id : awayTeam?.id;
      onSave(
        match.id,
        safeHomeScore,
        safeAwayScore,
        effectiveStatus,
        homePenalties,
        awayPenalties,
        penaltyWinnerId,
        undefined,
        undefined
      );
    } else {
      onSave(
        match.id, 
        safeHomeScore, 
        safeAwayScore, 
        effectiveStatus, 
        undefined, 
        undefined, 
        undefined,
        effectiveStatus === 'En Vivo' ? liveMinute : undefined,
        effectiveStatus === 'En Vivo' ? liveStage : undefined
      );
    }
  };

  const handleRegisterPlayerEvent = (player: Player, isHome: boolean) => {
    const isPlayoffs = Boolean(match.isPlayoffs || (match.stage && match.stage !== 'Fase Regular'));
    const blockIneligible = rules?.blockIneligiblePlayoffs ?? true;
    const minRequired = rules?.minMatchesForPlayoffs ?? 6;

    if (isPlayoffs && blockIneligible && tournament) {
      const eligibility = checkPlayerEligibility(player, tournament, match, allMatches, allAttendances);
      if (!eligibility.isEligible) {
        setIneligibilityAlert({
          show: true,
          playerName: player.name,
          minRequired,
          matchesCount: eligibility.matchesCount,
        });
        return;
      }
    }

    if (selectedEventType === 'Gol') {
      if (isHome) {
        setHomeScore((prev) => prev + 1);
      } else {
        setAwayScore((prev) => prev + 1);
      }
    }

    setEventSuccessMsg(`✓ ${selectedEventType} registrado a ${player.name} (#${player.number})`);
    setTimeout(() => setEventSuccessMsg(null), 3000);
  };

  const homePlayers = players.filter((p) => p.teamId === homeTeam?.id);
  const awayPlayers = players.filter((p) => p.teamId === awayTeam?.id);
  const isPlayoffs = Boolean(match.isPlayoffs || (match.stage && match.stage !== 'Fase Regular'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Capturar Marcador Oficial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jornada {match.matchdayNumber} • {match.field}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Teams and Scoreboard Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200 dark:border-slate-800/80">
            <div className="grid grid-cols-5 items-center gap-2 sm:gap-4">
              {/* Home Team Column */}
              <div className="col-span-2 flex flex-col items-center text-center space-y-2.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md transition-transform"
                  style={{
                    backgroundColor: homeColor,
                    boxShadow: `0 6px 16px ${homeColor}35`,
                  }}
                >
                  {homeTeam?.shortName || 'LOC'}
                </div>
                <div className="w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                    Local
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {homeTeam?.name || 'Local'}
                  </p>
                </div>

                {/* Home Score Stepper */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHomeScore((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Restar gol local"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 h-10 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setHomeScore((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 font-bold transition-all shadow-sm"
                    aria-label="Sumar gol local"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center VS & Result Indicator */}
              <div className="col-span-1 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black text-slate-300 dark:text-slate-600 select-none">
                  :
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isDraw ? 'Empate' : isHomeWinner ? 'Gana Local' : 'Gana Visita'}
                </span>
              </div>

              {/* Away Team Column */}
              <div className="col-span-2 flex flex-col items-center text-center space-y-2.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md transition-transform"
                  style={{
                    backgroundColor: awayColor,
                    boxShadow: `0 6px 16px ${awayColor}35`,
                  }}
                >
                  {awayTeam?.shortName || 'VIS'}
                </div>
                <div className="w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                    Visitante
                  </span>
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {awayTeam?.name || 'Visitante'}
                  </p>
                </div>

                {/* Away Score Stepper */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAwayScore((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Restar gol visitante"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 h-10 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-center font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setAwayScore((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 font-bold transition-all shadow-sm"
                    aria-label="Sumar gol visitante"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Penalty Shootout Block (Displayed only if tied and tournament has penalties enabled) */}
          {showPenaltiesBlock && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 shadow-sm space-y-3.5 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs sm:text-sm">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Definición por Penales (Punto Extra)</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  +{rules?.pointsPenaltiesWin ?? 2} pts ganador
                </span>
              </div>

              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-tight">
                El partido culminó en empate ({homeScore} - {awayScore}). Ingresa los goles de la tanda para determinar qué equipo se adjudica el punto extra.
              </p>

              {/* Penalty Steppers */}
              <div className="grid grid-cols-5 items-center gap-2 pt-1">
                {/* Home Penalties */}
                <div className="col-span-2 flex flex-col items-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-full">
                    {homeTeam?.name || 'Local'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setHomePenalties((prev) => Math.max(0, prev - 1));
                        setPenaltyError(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#0B0F17] border border-amber-300 dark:border-amber-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-amber-50 active:scale-95"
                      aria-label="Restar penal local"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={homePenalties}
                      onChange={(e) => {
                        setHomePenalties(Math.max(0, parseInt(e.target.value) || 0));
                        setPenaltyError(null);
                      }}
                      className="w-11 h-9 rounded-xl bg-white dark:bg-[#0B0F17] border border-amber-400 dark:border-amber-600 text-center font-black text-lg text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setHomePenalties((prev) => prev + 1);
                        setPenaltyError(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 active:scale-95 font-bold shadow-xs"
                      aria-label="Sumar penal local"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Shootout Separator & Winner Tag */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider">Penales</span>
                  <span className="text-lg font-black text-slate-400 dark:text-slate-500">:</span>
                </div>

                {/* Away Penalties */}
                <div className="col-span-2 flex flex-col items-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-full">
                    {awayTeam?.name || 'Visitante'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAwayPenalties((prev) => Math.max(0, prev - 1));
                        setPenaltyError(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#0B0F17] border border-amber-300 dark:border-amber-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-amber-50 active:scale-95"
                      aria-label="Restar penal visitante"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={awayPenalties}
                      onChange={(e) => {
                        setAwayPenalties(Math.max(0, parseInt(e.target.value) || 0));
                        setPenaltyError(null);
                      }}
                      className="w-11 h-9 rounded-xl bg-white dark:bg-[#0B0F17] border border-amber-400 dark:border-amber-600 text-center font-black text-lg text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAwayPenalties((prev) => prev + 1);
                        setPenaltyError(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 active:scale-95 font-bold shadow-xs"
                      aria-label="Sumar penal visitante"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Shootout Outcome Indicator */}
              <div className="pt-1 flex items-center justify-center text-center">
                {homePenalties > awayPenalties ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {homeTeam?.name || 'Local'} gana en penales ({homePenalties} - {awayPenalties}) • +{rules?.pointsPenaltiesWin ?? 2} PTS
                  </span>
                ) : awayPenalties > homePenalties ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {awayTeam?.name || 'Visitante'} gana en penales ({awayPenalties} - {homePenalties}) • +{rules?.pointsPenaltiesWin ?? 2} PTS
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Tanda empatada ({homePenalties} - {awayPenalties}). Debe registrarse un ganador de penales.
                  </span>
                )}
              </div>

              {penaltyError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{penaltyError}</span>
                </div>
              )}
            </div>
          )}

          {/* Match Status Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Estado del Encuentro
              </label>
              {status === 'En Vivo' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  🔴 En Vivo Ahora
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { 
                  id: 'En Vivo' as MatchStatus, 
                  label: 'EN VIVO', 
                  icon: Radio, 
                  desc: 'Minuto a minuto',
                  activeClass: 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 shadow-sm'
                },
                { 
                  id: 'Finalizado' as MatchStatus, 
                  label: 'Finalizado', 
                  icon: CheckCircle2, 
                  desc: 'Resultado oficial',
                  activeClass: 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                },
                { 
                  id: 'Programado' as MatchStatus, 
                  label: 'Programado', 
                  icon: Swords, 
                  desc: 'Por disputarse',
                  activeClass: 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? item.activeClass
                        : 'bg-white dark:bg-[#070A0F] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                    <span className="text-[9px] font-normal opacity-75">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Live Controls (Visible when match is 'En Vivo') */}
          {status === 'En Vivo' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent border border-red-500/30 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>Control de Tiempo de Juego</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-white dark:bg-[#0B0F17] border border-red-500/20">
                  {liveStage} • {liveMinute}
                </span>
              </div>

              {/* Match Stage Selector */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5 tracking-wider">
                  Etapa del Partido
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['1T', 'Medio Tiempo', '2T', 'Tiempo Extra'] as const).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setLiveStage(stage)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        liveStage === stage
                          ? 'bg-red-500 text-white border-red-500 shadow-xs'
                          : 'bg-white dark:bg-[#0B0F17] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Input & Quick Chips */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5 tracking-wider">
                  Minuto Transcurrido
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-28">
                    <input
                      type="text"
                      value={liveMinute}
                      onChange={(e) => setLiveMinute(e.target.value)}
                      placeholder="ej. 65'"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-red-400/50 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {["15'", "30'", "45'", "60'", "75'", "90'"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLiveMinute(preset)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                          liveMinute === preset
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 font-bold'
                            : 'bg-white dark:bg-[#0B0F17] border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registrar Incidencias / Eventos de Partido (Goles / Asistencias / Tarjetas) */}
          {players.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registrar Incidencias por Jugador
                  </label>
                </div>
                {isPlayoffs && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Liguilla: Filtro de Elegibilidad
                  </span>
                )}
              </div>

              {/* Event Type Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['Gol', 'Asistencia', 'Tarjeta Amarilla', 'Tarjeta Roja'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedEventType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedEventType === t
                        ? t === 'Gol'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : t === 'Tarjeta Amarilla'
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : t === 'Tarjeta Roja'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t === 'Gol' ? '⚽ Gol' : t === 'Asistencia' ? '🎯 Asistencia' : t === 'Tarjeta Amarilla' ? '🟨 Amarilla' : '🟥 Roja'}
                  </button>
                ))}
              </div>

              {eventSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {eventSuccessMsg}
                </div>
              )}

              {/* Quick Player Tag List */}
              <div className="grid grid-cols-2 gap-3 max-h-36 overflow-y-auto p-1">
                {/* Local Players */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block truncate">
                    {homeTeam?.name || 'Local'}
                  </span>
                  <div className="space-y-1">
                    {homePlayers.map((p) => {
                      const elig = tournament ? checkPlayerEligibility(p, tournament, match, allMatches, allAttendances) : { isEligible: true };
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleRegisterPlayerEvent(p, true)}
                          className={`w-full text-left p-1.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                            isPlayoffs && !elig.isEligible
                              ? 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10'
                              : 'bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                          }`}
                        >
                          <span className="truncate">#{p.number} {p.name}</span>
                          {isPlayoffs && (
                            <span className={`text-[9px] font-black uppercase px-1 rounded ${elig.isEligible ? 'text-emerald-500' : 'text-red-500 bg-red-500/15'}`}>
                              {elig.isEligible ? 'OK' : 'INELEGIBLE'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Away Players */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block truncate">
                    {awayTeam?.name || 'Visitante'}
                  </span>
                  <div className="space-y-1">
                    {awayPlayers.map((p) => {
                      const elig = tournament ? checkPlayerEligibility(p, tournament, match, allMatches, allAttendances) : { isEligible: true };
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleRegisterPlayerEvent(p, false)}
                          className={`w-full text-left p-1.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                            isPlayoffs && !elig.isEligible
                              ? 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10'
                              : 'bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500'
                          }`}
                        >
                          <span className="truncate">#{p.number} {p.name}</span>
                          {isPlayoffs && (
                            <span className={`text-[9px] font-black uppercase px-1 rounded ${elig.isEligible ? 'text-emerald-500' : 'text-red-500 bg-red-500/15'}`}>
                              {elig.isEligible ? 'OK' : 'INELEGIBLE'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notice on Standings Table sync */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F]/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2.5">
            {status === 'En Vivo' ? (
              <>
                <Radio className="w-4 h-4 shrink-0 text-red-500 animate-pulse" />
                <span>
                  Los marcadores de partidos <strong>EN VIVO</strong> impactan inmediatamente en la <strong>Tabla Virtual en Directo</strong>.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>
                  Al marcar como <strong>Finalizado</strong>, el resultado oficial computa definitivamente a la <strong>Tabla de Posiciones</strong>.
                </span>
              </>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div>
              {status === 'En Vivo' && (
                <button
                  type="button"
                  onClick={() => handleSubmit(undefined, 'Finalizado')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
                  title="Concluir el partido y registrar marcador oficial"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-500" />
                  <span>🏁 Silbatazo Final (Finalizar)</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold active:scale-95 shadow-md transition-all ${
                  status === 'En Vivo'
                    ? 'text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-red-500/20'
                    : 'text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {status === 'En Vivo' ? (
                  <>
                    <Radio className="w-4 h-4 animate-pulse stroke-[2.5]" />
                    <span>Guardar Minuto a Minuto</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Guardar Marcador Oficial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Blocking Red Ineligibility Modal Alert */}
      {ineligibilityAlert?.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div 
            onClick={() => setIneligibilityAlert(null)}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm animate-in fade-in" 
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F17] border-2 border-red-500 p-6 shadow-2xl z-20 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white">
                Bloqueo Reglamentario
              </span>
              <h3 className="text-lg font-black text-red-600 dark:text-red-400 mt-2">
                ALINEACIÓN INDEBIDA
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                El jugador <strong className="text-slate-950 dark:text-white underline">{ineligibilityAlert.playerName}</strong> no cumple con el mínimo de <strong className="text-red-500">{ineligibilityAlert.minRequired}</strong> partidos reglamentarios de fase regular.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 text-center">
              Acumula únicamente <strong>{ineligibilityAlert.matchesCount} de {ineligibilityAlert.minRequired} partidos jugados</strong>. Queda estrictamente inhabilitado para registrar eventos en este encuentro de Liguilla.
            </div>

            <button
              onClick={() => setIneligibilityAlert(null)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm transition-colors shadow-sm"
            >
              Entendido / Cerrar Advertencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
