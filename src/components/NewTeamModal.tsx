import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  User, 
  Phone, 
  Sparkles, 
  Palette, 
  Hash, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Team } from '../types/team';

interface NewTeamModalProps {
  isOpen: boolean;
  tournamentId: string;
  tournamentName: string;
  onClose: () => void;
  onSave: (team: Omit<Team, 'id' | 'createdAt'>) => void;
}

const PRESET_COLORS = [
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Azul Real', hex: '#2563EB' },
  { name: 'Rojo Carmesí', hex: '#EF4444' },
  { name: 'Ámbar Dorado', hex: '#F59E0B' },
  { name: 'Púrpura Élite', hex: '#8B5CF6' },
  { name: 'Cian Neón', hex: '#06B6D4' },
  { name: 'Naranja Fuego', hex: '#F97316' },
  { name: 'Gris Carbón', hex: '#334155' },
];

export const NewTeamModal: React.FC<NewTeamModalProps> = ({
  isOpen,
  tournamentId,
  tournamentName,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [representative, setRepresentative] = useState('');
  const [phone, setPhone] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [customColor, setCustomColor] = useState(false);
  const [isTouchedShortName, setIsTouchedShortName] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; representative?: string; phone?: string }>({});

  // Auto-generate short initials when team name changes if user hasn't manually edited
  const generateInitials = (text: string) => {
    const clean = text.trim();
    if (!clean) return '';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }
    if (words.length === 2) {
      return (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
    }
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isTouchedShortName) {
      setShortName(generateInitials(newName));
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setRepresentative('');
      setPhone('');
      setShortName('');
      setColor('#10B981');
      setCustomColor(false);
      setIsTouchedShortName(false);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; representative?: string; phone?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'El nombre del equipo es obligatorio.';
    }
    if (!representative.trim()) {
      newErrors.representative = 'El representante o capitán es obligatorio.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalShortName = shortName.trim().toUpperCase() || generateInitials(name) || 'EQP';

    onSave({
      tournamentId,
      name: name.trim(),
      representative: representative.trim(),
      phone: phone.trim() || 'Sin contacto registrado',
      shortName: finalShortName.slice(0, 4),
      color,
    });
  };

  const previewInitials = (shortName.trim() || generateInitials(name) || 'EQ').slice(0, 4);

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
          className="h-1.5 w-full transition-colors duration-300"
          style={{ backgroundColor: color }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors duration-300"
              style={{ backgroundColor: color }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Inscribir Nuevo Equipo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Torneo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tournamentName}</span>
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

        {/* Live Badge Preview Banner */}
        <div className="px-5 sm:px-6 pt-4 pb-2 bg-slate-50/70 dark:bg-[#070A0F]/70 border-b border-slate-200 dark:border-slate-800/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Vista previa del gafete
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-sm shrink-0 transition-transform duration-300"
              style={{
                backgroundColor: color,
                boxShadow: `0 4px 14px ${color}40`,
              }}
            >
              {previewInitials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {name.trim() || 'Nombre del Equipo'}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase shrink-0"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {previewInitials}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Capitán: {representative.trim() || 'Carlos Pech'}
                {phone.trim() ? ` • ${phone.trim()}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Nombre del Equipo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre del Equipo <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="ej. Atlético Modelo, Lobos FC..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                autoFocus
              />
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Grid: Representante & Siglas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Representante / Capitán <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={representative}
                  onChange={(e) => {
                    setRepresentative(e.target.value);
                    if (errors.representative) {
                      setErrors((prev) => ({ ...prev, representative: undefined }));
                    }
                  }}
                  placeholder="ej. Carlos Pech"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.representative
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.representative && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.representative}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Siglas (3-4 letras)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  value={shortName}
                  onChange={(e) => {
                    setIsTouchedShortName(true);
                    setShortName(e.target.value.toUpperCase());
                  }}
                  placeholder="ATM"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white uppercase placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-center"
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Teléfono / Contacto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Teléfono / Contacto de WhatsApp
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ej. +52 999 123 4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Color Distintivo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-500" />
                Color del Uniforme / Distintivo
              </label>
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                {color.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      setColor(preset.hex);
                      setCustomColor(false);
                    }}
                    title={preset.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0B0F17] scale-110 shadow-md'
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}

              {/* Custom Color input */}
              <label
                className={`relative w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-all ${
                  customColor ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0B0F17]' : 'hover:scale-105'
                }`}
                title="Color personalizado"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setCustomColor(true);
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Inscribir Equipo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
