import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Users, 
  Eye, 
  RotateCcw, 
  Sparkles,
  Info
} from 'lucide-react';
import { Match, MatchAttendance } from '../types/match';
import { Team } from '../types/team';
import { Player } from '../types/player';
import { Tournament } from '../types/tournament';
import { useAuth } from '../context/AuthContext';
import { 
  evaluateAttendanceTimeWindow, 
  checkPlayerEligibility,
  saveTournamentAttendances
} from '../utils/attendanceUtils';

interface AttendanceModalProps {
  isOpen: boolean;
  match: Match | null;
  tournament: Tournament;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  players: Player[];
  allMatches: Match[];
  allAttendances: Record<string, MatchAttendance>;
  onClose: () => void;
  onSaveAttendance: (attendance: MatchAttendance) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  match,
  tournament,
  homeTeam,
  awayTeam,
  players,
  allMatches,
  allAttendances,
  onClose,
  onSaveAttendance,
}) => {
  const { currentUser, isReferee, isCaptain, isMaster, canEditScores } = useAuth();
  const isArbitro = isReferee();
  const isDelegado = isCaptain();
  const isAdminOrMaster = isMaster() || canEditScores();
  
  // Active Tab: 'home' | 'away' | 'photos' | 'verified'
  const [activeTab, setActiveTab] = useState<'home' | 'away' | 'photos' | 'verified'>('home');
  
  // Local state for present player IDs
  const [homePresentIds, setHomePresentIds] = useState<string[]>([]);
  const [awayPresentIds, setAwayPresentIds] = useState<string[]>([]);

  // Bench Photos (base64 DataURLs)
  const [benchPhotoHome, setBenchPhotoHome] = useState<string>('');
  const [benchPhotoAway, setBenchPhotoAway] = useState<string>('');

  // Simulation mode to test time window anytime
  const [forceWindowOpen, setForceWindowOpen] = useState(false);

  // Ineligibility Alert Modal State
  const [blockingAlert, setBlockingAlert] = useState<{
    show: boolean;
    playerName: string;
    matchesCount: number;
    minRequired: number;
  } | null>(null);

  // Photo Inputs
  const homeFileInputRef = useRef<HTMLInputElement>(null);
  const awayFileInputRef = useRef<HTMLInputElement>(null);

  const existingAttendance = match ? allAttendances[match.id] : undefined;
  const isPlayoffs = Boolean(match?.isPlayoffs || (match?.stage && match.stage !== 'Fase Regular'));
  const minRequiredMatches = tournament.rules?.minMatchesForPlayoffs ?? 6;
  const blockIneligible = tournament.rules?.blockIneligiblePlayoffs ?? true;

  // Evaluate Time Window
  const timeWindow = match 
    ? evaluateAttendanceTimeWindow(match, existingAttendance, forceWindowOpen)
    : { isOpen: false, reason: '', badgeText: '', badgeVariant: 'locked' as const };

  const isConfirmedLocked = Boolean(existingAttendance?.isLocked);
  // Rol MASTER cuenta con bypass absoluto para editar y validar cédulas arbitrales
  const canEdit = isMaster() || (timeWindow.isOpen && !isConfirmedLocked && (isArbitro || isAdminOrMaster));

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && match) {
      const att = allAttendances[match.id];
      if (att) {
        setHomePresentIds(att.homePresentPlayerIds || []);
        setAwayPresentIds(att.awayPresentPlayerIds || []);
        setBenchPhotoHome(att.benchPhotoHome || '');
        setBenchPhotoAway(att.benchPhotoAway || '');
        // If already locked or user is Captain/Delegate, default to verification tab
        if (att.isLocked || isDelegado) {
          setActiveTab('verified');
        } else {
          setActiveTab('home');
        }
      } else {
        // Pre-select players who are eligible as initially present
        const homeList = players.filter((p) => p.teamId === match.homeTeamId);
        const awayList = players.filter((p) => p.teamId === match.awayTeamId);

        const initialHomeIds = homeList
          .filter((p) => {
            const elig = checkPlayerEligibility(p, tournament, match, allMatches, allAttendances);
            return elig.isEligible;
          })
          .map((p) => p.id);

        const initialAwayIds = awayList
          .filter((p) => {
            const elig = checkPlayerEligibility(p, tournament, match, allMatches, allAttendances);
            return elig.isEligible;
          })
          .map((p) => p.id);

        setHomePresentIds(initialHomeIds);
        setAwayPresentIds(initialAwayIds);
        setBenchPhotoHome('');
        setBenchPhotoAway('');
        setActiveTab('home');
      }
      setBlockingAlert(null);
    }
  }, [isOpen, match, allAttendances, isDelegado, players, tournament, allMatches]);

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

  const homePlayers = players.filter((p) => p.teamId === match.homeTeamId);
  const awayPlayers = players.filter((p) => p.teamId === match.awayTeamId);

  const homeColor = homeTeam?.color || '#10B981';
  const awayColor = awayTeam?.color || '#2563EB';

  // Toggle player presence with strict ineligibility lock
  const handleTogglePlayer = (player: Player, isHome: boolean) => {
    if (!canEdit) return;

    const currentList = isHome ? homePresentIds : awayPresentIds;
    const isCurrentlyPresent = currentList.includes(player.id);

    // If trying to mark as present in Liguilla, check eligibility
    if (!isCurrentlyPresent && isPlayoffs && blockIneligible) {
      const elig = checkPlayerEligibility(player, tournament, match, allMatches, allAttendances);
      if (!elig.isEligible) {
        setBlockingAlert({
          show: true,
          playerName: player.name,
          matchesCount: elig.matchesCount,
          minRequired: elig.minRequired,
        });
        return;
      }
    }

    if (isHome) {
      if (isCurrentlyPresent) {
        setHomePresentIds((prev) => prev.filter((id) => id !== player.id));
      } else {
        setHomePresentIds((prev) => [...prev, player.id]);
      }
    } else {
      if (isCurrentlyPresent) {
        setAwayPresentIds((prev) => prev.filter((id) => id !== player.id));
      } else {
        setAwayPresentIds((prev) => [...prev, player.id]);
      }
    }
  };

  // Convert uploaded photo file to base64 DataURL with timestamp
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isHome: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isHome) {
        setBenchPhotoHome(dataUrl);
      } else {
        setBenchPhotoAway(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate realistic simulated bench photo for fast testing without camera
  const handleGenerateSamplePhoto = (isHome: boolean) => {
    const teamName = isHome ? (homeTeam?.name || 'Local') : (awayTeam?.name || 'Visitante');
    const color = isHome ? homeColor : awayColor;
    
    // Create an HTML5 canvas and draw an official bench banner
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 400);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.5, '#1E293B');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      // Accent border
      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 620, 380);

      // Bench header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`BANCA OFICIAL: ${teamName.toUpperCase()}`, 320, 70);

      // Pitch icon / representation
      ctx.fillStyle = color;
      ctx.fillRect(80, 100, 480, 180);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`FOTO DE BANCA VERIFICADA`, 320, 175);
      ctx.font = 'normal 14px sans-serif';
      ctx.fillText(`Jugadores con uniforme completo presentes en zona técnica`, 320, 205);

      // Timestamp stamp overlay
      const now = new Date();
      ctx.fillStyle = '#10B981';
      ctx.fillRect(30, 320, 580, 45);
      ctx.fillStyle = '#020617';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`REGISTRO INMUTABLE: ${now.toLocaleDateString()} ${now.toLocaleTimeString()} | ID: ${match.id}`, 45, 348);

      const generated = canvas.toDataURL('image/jpeg', 0.85);
      if (isHome) {
        setBenchPhotoHome(generated);
      } else {
        setBenchPhotoAway(generated);
      }
    }
  };

  // Final Confirmation & Closing
  const handleConfirmAndLock = () => {
    if (!canEdit) return;

    if (!benchPhotoHome && !benchPhotoAway) {
      alert('📷 Es obligatorio tomar o subir la foto de evidencia de al menos una banca antes de confirmar y cerrar la lista.');
      setActiveTab('photos');
      return;
    }

    const attendanceRecord: MatchAttendance = {
      matchId: match.id,
      tournamentId: match.tournamentId,
      homePresentPlayerIds: homePresentIds,
      awayPresentPlayerIds: awayPresentIds,
      benchPhotoHome,
      benchPhotoAway,
      confirmedAt: new Date().toISOString(),
      confirmedBy: `${currentUser?.displayName || 'Árbitro Oficial'} (${currentUser?.role || 'ARBITRO'})`,
      confirmedByUserId: currentUser?.username || 'arbitro',
      isLocked: true,
    };

    onSaveAttendance(attendanceRecord);
    // Also save in localStorage for persistence
    const updated = {
      ...allAttendances,
      [match.id]: attendanceRecord,
    };
    saveTournamentAttendances(tournament.id, updated);

    alert('✅ ¡Pase de lista con foto de banca confirmado y cerrado con éxito! La cédula queda en modo oficial verificado.');
    setActiveTab('verified');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-6 flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient */}
        <div className={`h-1.5 w-full ${
          isPlayoffs 
            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-500' 
            : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
        }`} />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 shrink-0 bg-white dark:bg-[#0B0F17]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                isPlayoffs
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {isPlayoffs ? <ShieldAlert className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Jornada {match.matchdayNumber}
                  </span>
                  {isPlayoffs ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                      🏆 {match.stage || 'Liguilla / Fases Finales'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Fase Regular
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    • {match.field} • {match.time} hrs
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  Pase de Lista y Verificación de Bancas
                </h3>
              </div>
            </div>

            {/* Time Window Pill & Simulation Switch */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${
                  timeWindow.badgeVariant === 'open'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : timeWindow.badgeVariant === 'early'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}>
                  {timeWindow.badgeText}
                </span>

                {/* Simulation toggle button for testers */}
                {(isArbitro || isAdminOrMaster) && (
                  <button
                    type="button"
                    onClick={() => setForceWindowOpen((prev) => !prev)}
                    className="mt-1 text-[10px] font-bold text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    title="Alternar simulación de ventana para pruebas libres"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{forceWindowOpen ? 'Modo Normal' : 'Simular Cancha (-30m)'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Time Window Notification Warning if Closed */}
          {!timeWindow.isOpen && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{timeWindow.reason}</span>
            </div>
          )}

          {/* Tabs Bar */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border ${
                activeTab === 'home'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Local: {homeTeam?.name || 'Local'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'home' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {homePresentIds.length} / {homePlayers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('away')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border ${
                activeTab === 'away'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Visitante: {awayTeam?.name || 'Visitante'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'away' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {awayPresentIds.length} / {awayPlayers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border ${
                activeTab === 'photos'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-slate-100 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>📷 Evidencia de Bancas</span>
              {(benchPhotoHome || benchPhotoAway) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('verified')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border ${
                activeTab === 'verified'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>🔍 Alineaciones Verificadas</span>
              {isConfirmedLocked && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-slate-950">
                  OFICIAL
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body / Tab Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Liguilla Notice Banner */}
          {isPlayoffs && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Semáforo de Elegibilidad Activo para Liguilla
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Mínimo reglamentario: <strong className="text-slate-900 dark:text-white">{minRequiredMatches} partidos jugados</strong> en fase regular. {blockIneligible ? 'Bloqueo automático de alineación indebida activado.' : 'Bloqueo permisivo.'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                Fases Finales
              </span>
            </div>
          )}

          {/* TAB: LOCAL OR AWAY ROSTER */}
          {(activeTab === 'home' || activeTab === 'away') && (
            <div>
              {/* Roster Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                    style={{ backgroundColor: activeTab === 'home' ? homeColor : awayColor }}
                  >
                    {activeTab === 'home' ? (homeTeam?.shortName || 'LOC') : (awayTeam?.shortName || 'VIS')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Plantilla: {activeTab === 'home' ? homeTeam?.name : awayTeam?.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Toca sobre cada jugador para alternar [Presente / En Banca] vs [Ausente].
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Presentes:{' '}
                    <strong className="text-emerald-500">
                      {activeTab === 'home' ? homePresentIds.length : awayPresentIds.length}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Player Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(activeTab === 'home' ? homePlayers : awayPlayers).map((player) => {
                  const isPresent = (activeTab === 'home' ? homePresentIds : awayPresentIds).includes(player.id);
                  const eligibility = checkPlayerEligibility(player, tournament, match, allMatches, allAttendances);
                  const isBlockedByIneligibility = isPlayoffs && blockIneligible && !eligibility.isEligible;

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleTogglePlayer(player, activeTab === 'home')}
                      className={`group relative p-3.5 rounded-2xl border transition-all select-none cursor-pointer flex items-center justify-between gap-3 ${
                        isBlockedByIneligibility
                          ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/30 opacity-75'
                          : isPresent
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#070A0F] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Player Avatar, Jersey Number, Name and Position */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar / Big Profile Photo */}
                        <div className="relative shrink-0">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                            />
                          ) : (
                            <div
                              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs"
                              style={{ backgroundColor: activeTab === 'home' ? homeColor : awayColor }}
                            >
                              {player.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          {/* Dorsal Badge on Avatar */}
                          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-950 text-white font-black text-[10px] shadow-sm border border-slate-700">
                            #{player.number}
                          </div>
                        </div>

                        {/* Player Details */}
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {player.name}
                          </h5>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {player.position}
                          </span>

                          {/* Liguilla Traffic Light Semáforo */}
                          {isPlayoffs ? (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                eligibility.isEligible
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${eligibility.isEligible ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {eligibility.isEligible ? 'HABILITADO' : 'INELEGIBLE'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {eligibility.matchesCount} / {minRequiredMatches} JJ
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              {eligibility.matchesCount} JJ en torneo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Presence Button (One-Touch) */}
                      <div className="shrink-0">
                        {isBlockedByIneligibility ? (
                          <div 
                            title={eligibility.error}
                            className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-black uppercase flex items-center gap-1 border border-red-500/30"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Inhabilitado</span>
                          </div>
                        ) : isPresent ? (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>Presente</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full border border-slate-400 dark:border-slate-500" />
                            <span>Ausente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: BENCH PHOTOS CAPTURE */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Respaldo Fotográfico Obligatorio:</strong> El árbitro debe capturar o adjuntar una foto nítida de los jugadores presentes en la banca con sus uniformes reglamentarios. Esta foto queda sellada de forma inmutable.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Bench Photo Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor }} />
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Banca Local: {homeTeam?.name}
                      </h4>
                    </div>
                    {benchPhotoHome && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Foto Capturada
                      </span>
                    )}
                  </div>

                  {benchPhotoHome ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img
                        src={benchPhotoHome}
                        alt="Banca Local"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] text-white font-mono">
                          ✓ Evidencia sellada: Banca Local {homeTeam?.name}
                        </span>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setBenchPhotoHome('')}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Foto de la banca del equipo local
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Toma panorámica con cámara o selecciona archivo
                        </p>
                      </div>

                      {canEdit && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <input
                            ref={homeFileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, true)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => homeFileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                          >
                            <Camera className="w-4 h-4" />
                            <span>📷 Tomar Foto de la Banca</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleGenerateSamplePhoto(true)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            title="Generar evidencia fotográfica para pruebas rápidas"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Muestra</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Away Bench Photo Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor }} />
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Banca Visitante: {awayTeam?.name}
                      </h4>
                    </div>
                    {benchPhotoAway && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        Foto Capturada
                      </span>
                    )}
                  </div>

                  {benchPhotoAway ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img
                        src={benchPhotoAway}
                        alt="Banca Visitante"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] text-white font-mono">
                          ✓ Evidencia sellada: Banca Visitante {awayTeam?.name}
                        </span>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setBenchPhotoAway('')}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Foto de la banca del equipo visitante
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Toma panorámica con cámara o selecciona archivo
                        </p>
                      </div>

                      {canEdit && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <input
                            ref={awayFileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, false)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => awayFileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                          >
                            <Camera className="w-4 h-4" />
                            <span>📷 Tomar Foto de la Banca</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleGenerateSamplePhoto(false)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            title="Generar evidencia fotográfica para pruebas rápidas"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Muestra</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: COTEJO PARA CAPITANES / DELEGADOS (ALINEACIONES VERIFICADAS) */}
          {activeTab === 'verified' && (
            <div className="space-y-6">
              {/* Verification Stamp Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Cotejo Oficial de Alineaciones Verificadas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {existingAttendance?.confirmedAt ? (
                        <>
                          Validado por <strong className="text-slate-900 dark:text-white">{existingAttendance.confirmedBy}</strong> el{' '}
                          {new Date(existingAttendance.confirmedAt).toLocaleDateString()} a las{' '}
                          {new Date(existingAttendance.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                        </>
                      ) : (
                        'Vista previa del cotejo reglamentario disponible para Capitanes y Delegados.'
                      )}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shrink-0 self-start sm:self-auto">
                  {existingAttendance?.isLocked ? 'Cédula Cerrada' : 'En Verificación'}
                </span>
              </div>

              {/* Side-by-Side Roster Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Verified Roster */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor }} />
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {homeTeam?.name} ({homePresentIds.length} en banca)
                      </h5>
                    </div>
                  </div>

                  {benchPhotoHome && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={benchPhotoHome} alt="Banca Local" className="w-full h-36 object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {homePlayers
                      .filter((p) => homePresentIds.includes(p.id))
                      .map((p) => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                              #{p.number}
                            </span>
                            <div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</p>
                              <span className="text-[10px] text-slate-400">{p.position}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase text-emerald-500">Presente</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Away Verified Roster */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor }} />
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {awayTeam?.name} ({awayPresentIds.length} en banca)
                      </h5>
                    </div>
                  </div>

                  {benchPhotoAway && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={benchPhotoAway} alt="Banca Visitante" className="w-full h-36 object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {awayPlayers
                      .filter((p) => awayPresentIds.includes(p.id))
                      .map((p) => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                              #{p.number}
                            </span>
                            <div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</p>
                              <span className="text-[10px] text-slate-400">{p.position}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-500">Presente</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 shrink-0 bg-slate-50/70 dark:bg-[#070A0F]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Total presentes registrados: </span>
            <strong className="text-slate-900 dark:text-white">
              {homePresentIds.length} locales + {awayPresentIds.length} visitantes
            </strong>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 transition-colors"
            >
              Cerrar
            </button>

            {canEdit ? (
              <button
                type="button"
                onClick={handleConfirmAndLock}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>🔒 Confirmar y Cerrar Lista de Asistencia</span>
              </button>
            ) : isConfirmedLocked ? (
              <span className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Lista Cerrada Oficialmente</span>
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Fuera de Ventana (Solo Lectura)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blocking Red Ineligibility Modal Alert */}
      {blockingAlert?.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div 
            onClick={() => setBlockingAlert(null)}
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
                El jugador <strong className="text-slate-950 dark:text-white underline">{blockingAlert.playerName}</strong> no cumple con el mínimo de <strong className="text-red-500">{blockingAlert.minRequired}</strong> partidos reglamentarios de fase regular.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 text-center">
              Registra únicamente: <strong>{blockingAlert.matchesCount} de {blockingAlert.minRequired} partidos jugados</strong>. Queda estrictamente inhabilitado para participar en este encuentro de Liguilla.
            </div>

            <button
              onClick={() => setBlockingAlert(null)}
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
