import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Save, 
  FileSpreadsheet, 
  HelpCircle, 
  Search,
  Sparkles
} from 'lucide-react';
import { Team } from '../types/team';
import { TournamentRules, InitialTeamStats, DEFAULT_TOURNAMENT_RULES } from '../types/tournament';

interface InitialStandingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  tournamentId?: string;
  tournamentName: string;
  rules?: TournamentRules;
  initialStatsMap?: Record<string, InitialTeamStats>;
  onSave: (newStatsMap: Record<string, InitialTeamStats>) => void;
}

const EMPTY_ROW: Omit<InitialTeamStats, 'teamId'> = {
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  penaltiesWon: 0,
  penaltiesLost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  penaltyPoints: 0,
  yellowCards: 0,
  redCards: 0,
};

export const InitialStandingsModal: React.FC<InitialStandingsModalProps> = ({
  isOpen,
  onClose,
  teams,
  tournamentName,
  rules = DEFAULT_TOURNAMENT_RULES,
  initialStatsMap = {},
  onSave,
}) => {
  const [stats, setStats] = useState<Record<string, InitialTeamStats>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, InitialTeamStats> = {};
      teams.forEach((team) => {
        if (initialStatsMap[team.id]) {
          initialData[team.id] = { ...initialStatsMap[team.id], teamId: team.id };
        } else {
          initialData[team.id] = { ...EMPTY_ROW, teamId: team.id };
        }
      });
      setStats(initialData);
      setHasChanges(false);
    }
  }, [isOpen, teams, initialStatsMap]);

  if (!isOpen) return null;

  const updateField = (
    teamId: string, 
    field: keyof Omit<InitialTeamStats, 'teamId'>, 
    value: number
  ) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    setStats((prev) => {
      const current = prev[teamId] || { ...EMPTY_ROW, teamId };
      return {
        ...prev,
        [teamId]: {
          ...current,
          [field]: safeVal,
        },
      };
    });
    setHasChanges(true);
  };

  const calculatePoints = (row: InitialTeamStats): number => {
    let pts = 0;
    pts += (row.won || 0) * (rules.pointsWin ?? 3);
    pts += (row.lost || 0) * (rules.pointsLoss ?? 0);
    
    if (rules.penaltiesEnabled) {
      pts += (row.penaltiesWon || 0) * (rules.pointsPenaltiesWin ?? 2);
      pts += (row.penaltiesLost || 0) * (rules.pointsPenaltiesLoss ?? 1);
      // Regular draws without penalty shootout points
      const remainingDraws = Math.max(0, (row.drawn || 0) - (row.penaltiesWon || 0) - (row.penaltiesLost || 0));
      pts += remainingDraws * (rules.pointsDraw ?? 1);
    } else {
      pts += (row.drawn || 0) * (rules.pointsDraw ?? 1);
    }

    // Subtract penalty penaltyPoints
    pts -= (row.penaltyPoints || 0);

    return Math.max(0, pts);
  };

  const handleResetToZero = () => {
    if (confirm('¿Deseas restablecer todas las estadísticas iniciales a 0 para todos los clubes?')) {
      const resetData: Record<string, InitialTeamStats> = {};
      teams.forEach((t) => {
        resetData[t.id] = { ...EMPTY_ROW, teamId: t.id };
      });
      setStats(resetData);
      setHasChanges(true);
    }
  };

  const handleLoadSampleData = () => {
    const sampleData: Record<string, InitialTeamStats> = {};
    teams.forEach((t, idx) => {
      const played = 5;
      const won = Math.max(0, 4 - Math.floor(idx / 2));
      const drawn = idx % 2 === 0 ? 1 : 0;
      const lost = Math.max(0, played - won - drawn);
      const gf = 10 + (teams.length - idx) * 2;
      const gc = 4 + idx * 2;

      sampleData[t.id] = {
        teamId: t.id,
        played,
        won,
        drawn,
        lost,
        penaltiesWon: 0,
        penaltiesLost: 0,
        goalsFor: gf,
        goalsAgainst: gc,
        penaltyPoints: 0,
        yellowCards: 4 + idx,
        redCards: idx % 3 === 0 ? 1 : 0,
      };
    });
    setStats(sampleData);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(stats);
    onClose();
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.shortName?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-6xl rounded-3xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                  Cargar Tabla Inicial / Histórico
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Motor Híbrido
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Torneo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tournamentName}</span> • Los partidos jugados en la plataforma se sumarán a este acumulado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Alert Banner */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-[#070A0F]/70 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Fórmula Híbrida:</strong> Tabla Total = Base Histórica + Partidos Finalizados en la App. La columna DIF y PTS se calculan automáticamente al tipear.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0B0F17] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ejemplo Rápido</span>
            </button>

            <button
              type="button"
              onClick={handleResetToZero}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar (0s)</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
          <div className="relative max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar club en la cuadrícula..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Spreadsheet Grid Table */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-2 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-[#070A0F] text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10 shadow-xs">
                <th className="py-2.5 px-3 min-w-[190px]">Club / Equipo</th>
                <th className="py-2.5 px-2 text-center" title="Juegos Jugados">JJ</th>
                <th className="py-2.5 px-2 text-center" title="Juegos Ganados">JG</th>
                <th className="py-2.5 px-2 text-center" title="Juegos Empatados">JE</th>
                <th className="py-2.5 px-2 text-center" title="Juegos Perdidos">JP</th>
                {rules.penaltiesEnabled && (
                  <>
                    <th className="py-2.5 px-2 text-center text-amber-600 dark:text-amber-400" title="Ganados en Penales">GP</th>
                    <th className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400" title="Perdidos en Penales">PP</th>
                  </>
                )}
                <th className="py-2.5 px-2 text-center" title="Goles a Favor">GF</th>
                <th className="py-2.5 px-2 text-center" title="Goles en Contra">GC</th>
                <th className="py-2.5 px-2 text-center font-bold" title="Diferencia de Goles">DIF</th>
                <th className="py-2.5 px-2 text-center text-red-500 font-bold" title="Puntos de Sanción / Descuento">PEN</th>
                <th className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/10" title="Puntos Totales Calculados">PTS</th>
                <th className="py-2.5 px-2 text-center text-amber-500" title="Tarjetas Amarillas">TA</th>
                <th className="py-2.5 px-2 text-center text-red-500" title="Tarjetas Rojas">TR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTeams.map((team) => {
                const row = stats[team.id] || { ...EMPTY_ROW, teamId: team.id };
                const dif = (row.goalsFor || 0) - (row.goalsAgainst || 0);
                const pts = calculatePoints(row);
                const teamColor = team.color || '#10B981';

                return (
                  <tr 
                    key={team.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Team identity */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-2xs"
                          style={{ backgroundColor: teamColor }}
                        >
                          {team.shortName || team.name.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {team.name}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {team.representative || 'Club'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* JJ */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.played}
                        onChange={(e) => updateField(team.id, 'played', parseInt(e.target.value) || 0)}
                        className="w-11 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* JG */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.won}
                        onChange={(e) => updateField(team.id, 'won', parseInt(e.target.value) || 0)}
                        className="w-11 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* JE */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.drawn}
                        onChange={(e) => updateField(team.id, 'drawn', parseInt(e.target.value) || 0)}
                        className="w-11 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* JP */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.lost}
                        onChange={(e) => updateField(team.id, 'lost', parseInt(e.target.value) || 0)}
                        className="w-11 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* GP & PP if penalties enabled */}
                    {rules.penaltiesEnabled && (
                      <>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.penaltiesWon}
                            onChange={(e) => updateField(team.id, 'penaltiesWon', parseInt(e.target.value) || 0)}
                            className="w-11 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.penaltiesLost}
                            onChange={(e) => updateField(team.id, 'penaltiesLost', parseInt(e.target.value) || 0)}
                            className="w-11 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                      </>
                    )}

                    {/* GF */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.goalsFor}
                        onChange={(e) => updateField(team.id, 'goalsFor', parseInt(e.target.value) || 0)}
                        className="w-12 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* GC */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.goalsAgainst}
                        onChange={(e) => updateField(team.id, 'goalsAgainst', parseInt(e.target.value) || 0)}
                        className="w-12 h-7 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-center font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* DIF (Calculated) */}
                    <td className="py-2 px-2 text-center font-black text-xs">
                      <span className={dif > 0 ? 'text-emerald-500' : dif < 0 ? 'text-red-500' : 'text-slate-400'}>
                        {dif > 0 ? `+${dif}` : dif}
                      </span>
                    </td>

                    {/* PEN */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.penaltyPoints}
                        onChange={(e) => updateField(team.id, 'penaltyPoints', parseInt(e.target.value) || 0)}
                        className="w-10 h-7 rounded-lg bg-red-500/10 border border-red-500/30 text-center font-bold text-xs text-red-600 dark:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </td>

                    {/* PTS (Calculated) */}
                    <td className="py-2 px-3 text-center font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {pts}
                    </td>

                    {/* TA */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.yellowCards}
                        onChange={(e) => updateField(team.id, 'yellowCards', parseInt(e.target.value) || 0)}
                        className="w-10 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </td>

                    {/* TR */}
                    <td className="py-2 px-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.redCards}
                        onChange={(e) => updateField(team.id, 'redCards', parseInt(e.target.value) || 0)}
                        className="w-10 h-7 rounded-lg bg-red-500/10 border border-red-500/30 text-center font-bold text-xs text-red-600 dark:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-[#070A0F]/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {hasChanges && <span className="text-amber-500 font-bold">● Cambios pendientes por guardar</span>}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Base Histórica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
