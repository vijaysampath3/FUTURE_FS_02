'use client';

import { useState, useMemo } from 'react';
import { useLeads } from '@/lib/leads-context';
import { LeadStatusPieChart } from './LeadStatusPieChart';
import { LeadsOverTimeChart } from './LeadsOverTimeChart';
import { LeadsBySourceBarChart } from './LeadsBySourceBarChart';

type TimeFilter = 'All' | '1 Day' | '1 Week' | '1 Month' | '1 Year';

export function LeadAnalytics() {
  const { leads, isLoading } = useLeads();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');

  const filteredLeads = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    if (timeFilter === 'All') return leads;
    
    const now = new Date();
    const pastDate = new Date();

    switch (timeFilter) {
      case '1 Day':
        pastDate.setDate(now.getDate() - 1);
        break;
      case '1 Week':
        pastDate.setDate(now.getDate() - 7);
        break;
      case '1 Month':
        pastDate.setMonth(now.getMonth() - 1);
        break;
      case '1 Year':
        pastDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return leads.filter(lead => {
      const addedAt = new Date(lead.addedAt);
      return addedAt >= pastDate && addedAt <= now;
    });
  }, [leads, timeFilter]);

  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="h-[300px] bg-card rounded-xl border border-border"></div>
          <div className="h-[300px] bg-card rounded-xl border border-border"></div>
        </div>
        <div className="h-[300px] bg-card rounded-xl border border-border"></div>
      </div>
    );
  }

  const filters: TimeFilter[] = ['1 Day', '1 Week', '1 Month', '1 Year'];

  return (
    <div className="mb-8">
      {/* Lead Analytics Section */}
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lead Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Visual breakdown of your lead pipeline
          </p>
        </div>
        
        {/* Time Filter Toggle */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <LeadStatusPieChart leads={filteredLeads} />
        <LeadsOverTimeChart leads={filteredLeads} />
      </div>
      <LeadsBySourceBarChart leads={filteredLeads} />
    </div>
  );
}
