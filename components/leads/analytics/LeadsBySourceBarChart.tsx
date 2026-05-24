import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lead } from '@/lib/types';

interface LeadsBySourceBarChartProps {
  leads: Lead[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export function LeadsBySourceBarChart({ leads }: LeadsBySourceBarChartProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-6 col-span-full">
        <span className="text-4xl mb-2">📭</span>
        <p className="font-medium text-sm">No data yet — add your first lead to see analytics</p>
      </div>
    );
  }

  const sources: string[] = ["Website", "Referral", "Social Media", "Email Campaign", "Cold Call", "Other"];

  const data = sources.map(source => {
    let count = 0;
    if (source === 'Other') {
      count = leads.filter(l => {
        const s = (l.source || '').trim();
        return !s || !sources.includes(s) || s === 'Other';
      }).length;
    } else {
      count = leads.filter(l => (l.source || '').trim() === source).length;
    }
    return { source, count };
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full min-h-[300px] col-span-full">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Leads by Source</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="source"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              dy={15}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Bar dataKey="count" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
