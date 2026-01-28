'use client';

import { Users, Dog as DogIcon, CheckCircle, Eye } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number;
    totalDogs: number;
    activeDogs: number;
    pendingDogs: number;
  };
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Dogs',
      value: stats.totalDogs,
      icon: DogIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Active Dogs',
      value: stats.activeDogs,
      icon: CheckCircle,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Pending',
      value: stats.pendingDogs,
      icon: Eye,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <div key={label} className="card">
          <div className="flex items-center">
            <div className={`p-3 ${iconBg} rounded-lg`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}