import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Player } from '../types/player';

interface PaymentAbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  teamColor?: string;
  onSavePayment: (playerId: string, newFeePaid: number) => void;
}

export const PaymentAbonoModal: React.FC<PaymentAbonoModalProps> = ({
  isOpen,
  onClose,
  player,
  teamColor = '#10B981',
  onSavePayment,
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);

  useEffect(() => {
    if (player && isOpen) {
      setAmountPaid(player.feePaid);
    }
  }, [player, isOpen]);

  if (!isOpen || !player) return null;

  const debt = Math.max(0, player.feeAssigned - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment(player.id, Math.max(0, amountPaid));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
              style={{ backgroundColor: teamColor }}
            >
              #{player.number}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pago de Inscripción
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {player.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Cuota Asignada:</span>
              <strong className="text-slate-900 dark:text-white">${player.feeAssigned} MXN</strong>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Pagado hasta ahora:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">${player.feePaid} MXN</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold">
              <span>Adeudo Actual:</span>
              <span className={debt === 0 ? 'text-emerald-500' : 'text-red-500'}>
                ${debt} MXN
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Actualizar Monto Total Pagado (MXN)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAmountPaid(player.feeAssigned)}
              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              Liquidar (${player.feeAssigned})
            </button>
            <button
              type="button"
              onClick={() => setAmountPaid(0)}
              className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              $0
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
            >
              Guardar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
