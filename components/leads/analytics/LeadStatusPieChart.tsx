import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lead } from '@/lib/types';

interface LeadStatusPieChartProps {
  leads: Lead[];
}

const COLORS = {
  New: '#3b82f6', // blue-500
  Contacted: '#eab308', // yellow-500
  Converted: '#22c55e', // green-500
};

export function LeadStatusPieChart({ leads }: LeadStatusPieChartProps) {
  const data = [
    { name: 'New', value: leads.filter(l => l.status === 'New').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length },
    { name: 'Converted', value: leads.filter(l => l.status === 'Converted').length },
  ].filter(d => d.value > 0);

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-6">
        <span className="text-4xl mb-2">📭</span>
        <p className="font-medium text-sm">No data yet — add your first lead to see analytics</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Lead Status Distribution</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => {
                const total = leads.length;
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, 'Leads'];
              }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
