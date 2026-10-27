import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaButton: React.FC<{ className?: string; isMobileMenu?: boolean }> = ({ 
  className = '',
  isMobileMenu = false 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setJustInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // In case beforeinstallprompt hasn't fired yet or iOS Safari
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        alert('Para instalar ATOSPORT en iOS: Toca el botón Compartir (cuadrado con flecha) y luego "Agregar a pantalla de inicio".');
      } else {
        alert('Para instalar ATOSPORT: Abre el menú de tu navegador (⋮) y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".');
      }
    }
  };

  // If already installed and running standalone, don't clutter the UI
  if (isInstalled && !justInstalled) {
    return null;
  }

  if (justInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
        <Check className="w-3.5 h-3.5" />
        <span>¡App Instalada!</span>
      </div>
    );
  }

  if (isMobileMenu) {
    return (
      <button
        onClick={handleInstallClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all ${className}`}
      >
        <span className="flex items-center gap-2.5">
          <Smartphone className="w-4 h-4" />
          <span>Instalar App en tu Móvil</span>
        </span>
        <Download className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Instalar ATOSPORT como aplicación nativa en tu dispositivo"
      aria-label="Instalar ATOSPORT"
      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all active:scale-95 shadow-sm ${className}`}
    >
      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
      <span className="hidden md:inline">Instalar App</span>
      <span className="md:hidden">Instalar</span>
    </button>
  );
};
