'use client';

import { Shield, AlertTriangle, Bell, Radio } from 'lucide-react';

export default function SummaryCards({ stats }) {
  const cards = [
    { title: 'Total Threats',  value: stats?.totalThreats  ?? 0, icon: Shield,        color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10'   },
    { title: 'High Severity',  value: stats?.highSeverity  ?? 0, icon: AlertTriangle, color: 'text-red-400',    bgColor: 'bg-red-500/10'    },
    { title: 'Unread Alerts',  value: stats?.unreadAlerts  ?? 0, icon: Bell,          color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { title: 'Active Sources', value: stats?.activeSources ?? 0, icon: Radio,         color: 'text-green-400',  bgColor: 'bg-green-500/10'  },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const CardIcon = card.icon;
        return (
          <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mb-2">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
              </div>
              <div className={`${card.bgColor} p-2 sm:p-3 rounded-lg`}>
                <CardIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
