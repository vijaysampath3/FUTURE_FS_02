'use client';

import { Users, UserPlus, Phone, CheckCircle } from 'lucide-react';
import { useLeads } from '@/lib/leads-context';

export function LeadStats() {
  const { getLeadStats } = useLeads();
  const stats = getLeadStats();

  const statCards = [
    {
      label: 'TOTAL LEADS',
      value: stats.total,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'NEW',
      value: stats.new,
      icon: UserPlus,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: 'CONTACTED',
      value: stats.contacted,
      icon: Phone,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'CONVERTED',
      value: stats.converted,
      icon: CheckCircle,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl border border-border p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wider">
              {stat.label}
            </p>
            <p className="text-4xl font-semibold text-foreground mt-1">
              {stat.value}
            </p>
          </div>
          <div className={`${stat.iconBg} p-3 rounded-full`}>
            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
