import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Phone, 
  Crown, 
  ShieldAlert, 
  SlidersHorizontal,
  Check,
  CreditCard
} from 'lucide-react';
import { Team } from '../types/team';
import { Player, TeamFinance } from '../types/player';
import { PlayerModal } from './PlayerModal';
import { PaymentAbonoModal } from './PaymentAbonoModal';

interface TeamRosterViewProps {
  team: Team;
  tournamentName: string;
  players: Player[];
  teamFinance?: TeamFinance;
  onBack: () => void;
  onAddPlayer: (playerData: Omit<Player, 'id' | 'createdAt'>) => void;
  onUpdatePlayer: (playerId: string, playerData: Partial<Player>) => void;
  onDeletePlayer: (playerId: string) => void;
  onUpdateFinance: (teamId: string, finance: Partial<TeamFinance>) => void;
}

export const TeamRosterView: React.FC<TeamRosterViewProps> = ({
  team,
  tournamentName,
  players,
  teamFinance,
  onBack,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onUpdateFinance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'liquidado' | 'pendiente'>('all');
  
  // Modals state
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayerForPayment, setSelectedPlayerForPayment] = useState<Player | null>(null);
  const [isEditingFinance, setIsEditingFinance] = useState(false);
  
  // Team finance values
  const currentTotalTeamFee = teamFinance?.totalTeamFee ?? 4200;
  const currentSuggestedFee = teamFinance?.suggestedPlayerFee ?? 350;

  const [tempTotalFee, setTempTotalFee] = useState(currentTotalTeamFee);
  const [tempSuggestedFee, setTempSuggestedFee] = useState(currentSuggestedFee);

  // Financial calculations
  const totalCollected = useMemo(() => {
    return players.reduce((sum, p) => sum + (p.feePaid || 0), 0);
  }, [players]);

  const teamBalancePending = Math.max(0, currentTotalTeamFee - totalCollected);
  const progressPercent = Math.min(100, Math.round((totalCollected / (currentTotalTeamFee || 1)) * 100));

  const liquidatedPlayersCount = players.filter((p) => p.paymentStatus === 'Liquidado').length;
  const pendingPlayersCount = players.filter((p) => p.paymentStatus === 'Pendiente').length;

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = 
          p.name.toLowerCase().includes(q) ||
          p.number.toString().includes(q) ||
          (p.phone && p.phone.includes(q)) ||
          p.position.toLowerCase().includes(q);

        const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
        const matchesPayment = 
          paymentFilter === 'all' ||
          (paymentFilter === 'liquidado' && p.paymentStatus === 'Liquidado') ||
          (paymentFilter === 'pendiente' && p.paymentStatus === 'Pendiente');

        return matchesSearch && matchesPosition && matchesPayment;
      })
      .sort((a, b) => a.number - b.number);
  }, [players, searchTerm, positionFilter, paymentFilter]);

  const existingJerseyNumbers = useMemo(() => {
    return players.map((p) => p.number);
  }, [players]);

  // Quick 1-tap full payment toggle
  const handleQuickTogglePayment = (player: Player) => {
    if (player.paymentStatus === 'Liquidado') {
      // Toggle back to partial or 0
      onUpdatePlayer(player.id, {
        feePaid: 0,
        paymentStatus: 'Pendiente',
      });
    } else {
      // Liquidate in full
      onUpdatePlayer(player.id, {
        feePaid: player.feeAssigned,
        paymentStatus: 'Liquidado',
      });
    }
  };

  const handleSaveFinanceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFinance(team.id, {
      totalTeamFee: Number(tempTotalFee) || 0,
      suggestedPlayerFee: Number(tempSuggestedFee) || 0,
    });
    setIsEditingFinance(false);
  };

  const teamColor = team.color || '#10B981';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Back Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-[#0B0F17] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Volver a Equipos</span>
        </button>

        <button
          onClick={() => {
            setEditingPlayer(null);
            setIsPlayerModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Registrar Jugador</span>
        </button>
      </div>

      {/* Main Team Banner Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Top color indicator line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: teamColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Team Info */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shrink-0"
              style={{
                backgroundColor: teamColor,
                boxShadow: `0 8px 24px ${teamColor}40`,
              }}
            >
              {team.shortName || team.name.slice(0, 3).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${teamColor}15`,
                    color: teamColor,
                    border: `1px solid ${teamColor}30`,
                  }}
                >
                  {team.shortName || 'OFICIAL'}
                </span>
                <span className="text-xs text-slate-400">• {tournamentName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {team.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-500">Capitán:</span>
                  <strong className="text-slate-900 dark:text-white">{team.representative}</strong>
                </div>
                {team.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{team.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span><strong>{players.length}</strong> Jugadores en Plantilla</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempTotalFee(currentTotalTeamFee);
                setTempSuggestedFee(currentSuggestedFee);
                setIsEditingFinance(!isEditingFinance);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ajustar Cuotas</span>
            </button>
          </div>
        </div>

        {/* Finance Edit Dropdown Bar (if toggled) */}
        {isEditingFinance && (
          <form 
            onSubmit={handleSaveFinanceConfig}
            className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top duration-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                Configurar Parámetros Financieros del Equipo
              </span>
              <button 
                type="button" 
                onClick={() => setIsEditingFinance(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Cuota Total Asignada al Equipo ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={tempTotalFee}
                  onChange={(e) => setTempTotalFee(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Cuota Individual Sugerida por Jugador ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={tempSuggestedFee}
                  onChange={(e) => setTempSuggestedFee(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingFinance(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                Actualizar Cuotas
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Resumen Financiero del Equipo (Cabecera de la Plantilla) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cuota Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Cuota Total Equipo</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ${currentTotalTeamFee.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sugerido por jugador: <strong>${currentSuggestedFee} MXN</strong>
          </p>
        </div>

        {/* Recaudado vs Pendiente */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Total Recaudado</span>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {progressPercent}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalCollected.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Saldo Pendiente</span>
            <ShieldAlert className={`w-4 h-4 ${teamBalancePending > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${teamBalancePending > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500'}`}>
            ${teamBalancePending.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {teamBalancePending === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Equipo 100% al día
              </span>
            ) : (
              `Faltan $${teamBalancePending.toLocaleString('es-MX')} para liquidar cuota`
            )}
          </p>
        </div>

        {/* Players Paid Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Estado de Jugadores</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {liquidatedPlayersCount} <span className="text-xs font-bold text-slate-400">Pagados</span>
            </div>
            <div className="text-xl font-bold text-red-500">
              / {pendingPlayersCount} <span className="text-xs font-bold text-slate-400">Con Adeudo</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {players.length === 0 ? 'Sin jugadores registrados' : `${Math.round((liquidatedPlayersCount / players.length) * 100)}% de jugadores al día`}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre, dorsal o posición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Position Selector */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Todas las Posiciones</option>
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Mediocampista">Mediocampista</option>
            <option value="Delantero">Delantero</option>
          </select>

          {/* Payment Status Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                paymentFilter === 'all'
                  ? 'bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({players.length})
            </button>
            <button
              onClick={() => setPaymentFilter('liquidado')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                paymentFilter === 'liquidado'
                  ? 'bg-white dark:bg-[#0B0F17] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Check className="w-3 h-3" />
              Al Día ({liquidatedPlayersCount})
            </button>
            <button
              onClick={() => setPaymentFilter('pendiente')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                paymentFilter === 'pendiente'
                  ? 'bg-white dark:bg-[#0B0F17] text-red-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Con Adeudo ({pendingPlayersCount})
            </button>
          </div>
        </div>
      </div>

      {/* Players List Grid / Empty State */}
      {players.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No hay jugadores registrados en esta plantilla
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Registra los dorsales, posiciones tácticas y lleva el control del pago de la inscripción de cada jugador.
          </p>
          <button
            onClick={() => {
              setEditingPlayer(null);
              setIsPlayerModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Registrar Primer Jugador
          </button>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No se encontraron jugadores con los filtros seleccionados
          </h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setPositionFilter('all');
              setPaymentFilter('all');
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const isLiquidated = player.paymentStatus === 'Liquidado';
            const debt = Math.max(0, player.feeAssigned - player.feePaid);

            return (
              <div
                key={player.id}
                className="group relative rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Left position accent border line */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 w-1 ${
                    isLiquidated ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />

                <div className="space-y-3 pl-1">
                  {/* Player Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar / Photo */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-black text-sm"
                            style={{ backgroundColor: teamColor }}
                          >
                            {player.name ? player.name.slice(0, 2).toUpperCase() : 'JG'}
                          </div>
                        )}

                        {/* Jersey Number Tag Overlay */}
                        <div 
                          className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[10px] font-black text-white"
                          style={{ backgroundColor: teamColor }}
                        >
                          #{player.number}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {player.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {player.position}
                          </span>
                          {player.phone && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              {player.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingPlayer(player);
                          setIsPlayerModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Editar datos del jugador"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al jugador #${player.number} ${player.name} de la plantilla?`)) {
                            onDeletePlayer(player.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Dar de baja de la plantilla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Payment Card / Interactive Badge */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F]/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Cuota:</span>
                      <strong className="text-slate-900 dark:text-white">${player.feeAssigned} MXN</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Abonado:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${player.feePaid} MXN
                      </span>
                    </div>

                    {/* Interactive Badge & Actions */}
                    <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {isLiquidated ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Al Día</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Debe ${debt} MXN</span>
                        </div>
                      )}

                      {/* Quick 1-Tap Toggle or Abono */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPlayerForPayment(player)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Registrar abono de dinero"
                        >
                          Abonar
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePayment(player)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs ${
                            isLiquidated
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                          title={isLiquidated ? 'Revertir estado de pago' : 'Marcar liquidado en 1 toque'}
                        >
                          {isLiquidated ? 'Revertir' : 'Marcar Pagado'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Player Add/Edit Modal */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setEditingPlayer(null);
        }}
        teamId={team.id}
        tournamentId={team.tournamentId}
        teamColor={teamColor}
        suggestedFee={currentSuggestedFee}
        existingNumbers={existingJerseyNumbers}
        initialPlayer={editingPlayer}
        onSave={(data, editingId) => {
          if (editingId) {
            onUpdatePlayer(editingId, data);
          } else {
            onAddPlayer(data);
          }
        }}
      />

      {/* Payment / Abono Modal */}
      <PaymentAbonoModal
        isOpen={Boolean(selectedPlayerForPayment)}
        player={selectedPlayerForPayment}
        teamColor={teamColor}
        onClose={() => setSelectedPlayerForPayment(null)}
        onSavePayment={(playerId, newFeePaid) => {
          const targetPlayer = players.find((p) => p.id === playerId);
          const feeAssigned = targetPlayer?.feeAssigned || currentSuggestedFee;
          const isLiquidated = newFeePaid >= feeAssigned;

          onUpdatePlayer(playerId, {
            feePaid: newFeePaid,
            paymentStatus: isLiquidated ? 'Liquidado' : 'Pendiente',
          });
        }}
      />
    </div>
  );
};
