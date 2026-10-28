import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Hash, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { Player, PlayerPosition } from '../types/player';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  tournamentId: string;
  teamColor?: string;
  suggestedFee?: number;
  existingNumbers?: number[];
  initialPlayer?: Player | null;
  onSave: (playerData: Omit<Player, 'id' | 'createdAt'>, editingId?: string) => void;
}

const POSITIONS: PlayerPosition[] = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  teamId,
  tournamentId,
  teamColor = '#10B981',
  suggestedFee = 350,
  existingNumbers = [],
  initialPlayer = null,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState<number | ''>(10);
  const [position, setPosition] = useState<PlayerPosition>('Mediocampista');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [feeAssigned, setFeeAssigned] = useState<number>(suggestedFee);
  const [feePaid, setFeePaid] = useState<number>(suggestedFee);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialPlayer) {
        setName(initialPlayer.name);
        setNumber(initialPlayer.number);
        setPosition(initialPlayer.position);
        setPhone(initialPlayer.phone || '');
        setPhotoUrl(initialPlayer.photoUrl);
        setFeeAssigned(initialPlayer.feeAssigned);
        setFeePaid(initialPlayer.feePaid);
      } else {
        setName('');
        // Suggest next unused number between 1 and 99
        let nextNum = 1;
        while (existingNumbers.includes(nextNum) && nextNum < 99) {
          nextNum++;
        }
        setNumber(nextNum);
        setPosition('Mediocampista');
        setPhone('');
        setPhotoUrl(undefined);
        setFeeAssigned(suggestedFee);
        setFeePaid(suggestedFee); // default to fully paid
      }
      setErrors({});
    }
  }, [isOpen, initialPlayer, suggestedFee, existingNumbers]);

  if (!isOpen) return null;

  const currentNumber = typeof number === 'number' ? number : 0;
  const numAssigned = Number(feeAssigned) || 0;
  const numPaid = Number(feePaid) || 0;
  const debt = Math.max(0, numAssigned - numPaid);
  const isLiquidated = numPaid >= numAssigned && numAssigned > 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'La imagen debe ser menor a 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      setErrors((prev) => ({ ...prev, photo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio.';
    }

    if (number === '' || currentNumber < 1 || currentNumber > 99) {
      newErrors.number = 'El dorsal debe ser entre 1 y 99.';
    } else if (
      existingNumbers.includes(currentNumber) &&
      (!initialPlayer || initialPlayer.number !== currentNumber)
    ) {
      newErrors.number = `El dorsal #${currentNumber} ya está en uso en esta plantilla.`;
    }

    if (numAssigned < 0) {
      newErrors.feeAssigned = 'La cuota no puede ser negativa.';
    }

    if (numPaid < 0) {
      newErrors.feePaid = 'El monto pagado no puede ser negativo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        teamId,
        tournamentId,
        name: name.trim(),
        number: currentNumber,
        position,
        phone: phone.trim() || undefined,
        photoUrl,
        feeAssigned: numAssigned,
        feePaid: numPaid,
        paymentStatus: isLiquidated ? 'Liquidado' : 'Pendiente',
      },
      initialPlayer?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Accent Bar */}
        <div 
          className="h-1.5 w-full" 
          style={{ backgroundColor: teamColor }} 
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
              style={{ backgroundColor: teamColor }}
            >
              #{currentNumber || '--'}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {initialPlayer ? 'Editar Jugador' : 'Registrar Nuevo Jugador'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ficha de plantilla y control de cuota de inscripción
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Photo & Avatar Section */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-[#070A0F]/70 border border-slate-200/80 dark:border-slate-800/60">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center text-white font-black"
                  style={{ backgroundColor: teamColor }}
                >
                  <span className="text-base">{name ? name.slice(0, 2).toUpperCase() : 'JG'}</span>
                  <span className="text-[10px] opacity-80">#{currentNumber || 0}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Foto del Jugador
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sube una imagen local o se usará el avatar oficial con dorsal.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs flex items-center gap-1 font-semibold"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
              {errors.photo && (
                <p className="text-[11px] text-red-500">{errors.photo}</p>
              )}
            </div>
          </div>

          {/* Name & Dorsal */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre Completo <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="ej. Santiago Morales"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dorsal <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={number}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                    setNumber(val);
                    if (errors.number) setErrors((prev) => ({ ...prev, number: '' }));
                  }}
                  className={`w-full pl-8 pr-2 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 transition-all text-center ${
                    errors.number
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.number && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.number}
                </p>
              )}
            </div>
          </div>

          {/* Position & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Posición Táctica <span className="text-emerald-500">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PlayerPosition)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Teléfono / Emergencia
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ej. +52 999 123 4567"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Financial / Payment Module */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-[#070A0F] dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Módulo de Pago de Inscripción
              </span>

              {/* Status Badge Preview */}
              {isLiquidated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Liquidado / Al Día
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Pendiente: Debe ${debt} MXN
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Cuota Asignada (MXN)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={feeAssigned}
                    onChange={(e) => setFeeAssigned(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Monto Pagado (MXN)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={feePaid}
                    onChange={(e) => setFeePaid(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Atajos:</span>
              <button
                type="button"
                onClick={() => setFeePaid(numAssigned)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
              >
                Pagar Total (${numAssigned})
              </button>
              <button
                type="button"
                onClick={() => setFeePaid(Math.floor(numAssigned / 2))}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                50% (${Math.floor(numAssigned / 2)})
              </button>
              <button
                type="button"
                onClick={() => setFeePaid(0)}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Sin Pago ($0)
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:scale-95 shadow-md dark:shadow-emerald-glow transition-all"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{initialPlayer ? 'Guardar Cambios' : 'Registrar Jugador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
