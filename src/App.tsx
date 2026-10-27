import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { StatsCards } from './components/StatsCards';
import { TournamentsView } from './components/TournamentsView';
import { LiveScoresView } from './components/LiveScoresView';
import { NewTournamentModal } from './components/NewTournamentModal';
import { Tournament } from './types/tournament';
import { CheckCircle2, Shield } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

const STORAGE_KEY = 'atosport_tournaments';

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: 'Liga Premier Nocturna 2026',
    sport: 'Fútbol 7',
    venue: 'Complejo Deportivo El Retiro - Cancha 1',
    season: 'Apertura 2026',
    status: 'Activo',
    teamsCount: 14,
    maxTeams: 16,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 't-2',
    name: 'Copa Metropolitana Élite',
    sport: 'Fútbol 11',
    venue: 'Estadio Olímpico Municipal',
    season: 'Clausura 2026',
    status: 'En Inscripciones',
    teamsCount: 8,
    maxTeams: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 't-3',
    name: 'Torneo Intercolegial de Futsal',
    sport: 'Futsal',
    venue: 'Polideportivo Norte - Sala A',
    season: 'Verano 2026',
    status: 'Próximo',
    teamsCount: 6,
    maxTeams: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 't-4',
    name: 'Circuito Regional de Básquetbol',
    sport: 'Básquetbol',
    venue: 'Gimnasio Techado Municipal',
    season: 'Temporada Regular 2026',
    status: 'Activo',
    teamsCount: 10,
    maxTeams: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tournaments' | 'scores'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load initial tournaments with localStorage synchronization
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading tournaments from localStorage, using defaults:', e);
    }
    return INITIAL_TOURNAMENTS;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Sync state with localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
    } catch (e) {
      console.error('Error saving tournaments to localStorage:', e);
    }
  }, [tournaments]);

  const handleCreateTournament = (
    data: Omit<Tournament, 'id' | 'createdAt'>
  ) => {
    const newTournament: Tournament = {
      ...data,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTournaments((prev) => {
      const updated = [newTournament, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving new tournament to localStorage:', e);
      }
      return updated;
    });

    // Close modal, show toast and navigate directly to tournaments view
    setIsModalOpen(false);
    setCurrentTab('tournaments');
    setNotification(`¡Torneo "${data.name}" creado con éxito y guardado localmente!`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleDeleteTournament = (id: string) => {
    setTournaments((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating localStorage after tournament delete:', e);
      }
      return updated;
    });

    setNotification('Torneo eliminado del registro.');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A0F] text-slate-900 dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-500 pb-20 md:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/50 text-slate-900 dark:text-white shadow-xl dark:shadow-emerald-glow animate-in slide-in-from-bottom duration-300 max-w-[90vw]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold truncate">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenNewTournament={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            <Hero
              onOpenNewTournament={() => setIsModalOpen(true)}
              onExploreTournaments={() => setCurrentTab('tournaments')}
            />
            <StatsCards tournaments={tournaments} />
            <TournamentsView
              tournaments={tournaments}
              onOpenNewTournament={() => setIsModalOpen(true)}
              onDeleteTournament={handleDeleteTournament}
            />
          </div>
        )}

        {currentTab === 'tournaments' && (
          <TournamentsView
            tournaments={tournaments}
            onOpenNewTournament={() => setIsModalOpen(true)}
            onDeleteTournament={handleDeleteTournament}
          />
        )}

        {currentTab === 'scores' && <LiveScoresView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070A0F] py-6 sm:py-8 mt-12 sm:mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">ATOSPORT SaaS</span>
            <span className="hidden sm:inline">— Plataforma Deportiva Profesional</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} ATOSPORT. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenNewTournament={() => setIsModalOpen(true)}
      />

      {/* Responsive New Tournament Modal */}
      <NewTournamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTournament}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
