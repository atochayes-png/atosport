import React from 'react';
import { Trophy, Users, ShieldAlert, Award } from 'lucide-react';
import { Tournament } from '../types/tournament';

interface StatsCardsProps {
  tournaments: Tournament[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ tournaments }) => {
  const activeCount = tournaments.filter(t => t.status === 'Activo').length;
  const enrollingCount = tournaments.filter(t => t.status === 'En Inscripciones').length;
  const totalTeams = tournaments.reduce((acc, t) => acc + t.teamsCount, 0);

  const stats = [
    {
      title: 'Torneos Totales',
      value: tournaments.length,
      change: `${activeCount} activos actualmente`,
      icon: Trophy,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      borderColor: 'border-emerald-200 dark:border-emerald-500/20',
    },
    {
      title: 'En Inscripciones',
      value: enrollingCount,
      change: 'Abiertos para registro',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
    },
    {
      title: 'Equipos Registrados',
      value: totalTeams,
      change: 'En todas las sedes',
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border-amber-200 dark:border-amber-500/20',
    },
    {
      title: 'Cédulas en Vivo',
      value: '100% Digital',
      change: 'Arbitraje sin papel',
      icon: ShieldAlert,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
