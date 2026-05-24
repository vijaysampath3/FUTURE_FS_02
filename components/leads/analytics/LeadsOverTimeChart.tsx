import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lead } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface LeadsOverTimeChartProps {
  leads: Lead[];
}

export function LeadsOverTimeChart({ leads }: LeadsOverTimeChartProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-6">
        <span className="text-4xl mb-2">📭</span>
        <p className="font-medium text-sm">No data yet — add your first lead to see analytics</p>
      </div>
    );
  }

  // Aggregate by month (or day depending on the range)
  // To keep it simple and fulfill the requirement "months (January to current month)"
  // We will group by 'MMM yyyy' for all leads in the filtered array.
  const groupedData = leads.reduce((acc: Record<string, number>, lead) => {
    // addedAt is a Date object according to types.ts
    const date = new Date(lead.addedAt);
    const key = format(date, 'MMM dd, yyyy'); // Using exact date for better granularity
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedKeys = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const data = sortedKeys.map(key => ({
    date: key,
    count: groupedData[key]
  }));

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Leads Over Time</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
              dy={10}
              tickFormatter={(val) => {
                // Keep the label simple on the axis (e.g. just "Jan 12")
                const d = new Date(val);
                return format(d, 'MMM dd');
              }}
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
              cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Leads"
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
