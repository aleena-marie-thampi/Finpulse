import { useState, useEffect } from 'react';
import api from '../api/axios'; // Aligned path resolution across layout workspaces
import { PageHeader, CardSkeleton } from '../components/ui';
import { formatINR, MONTHS } from '../utils/helpers';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar } from 'lucide-react';
import {
  AreaChart, Area, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';

// Production-hardened Custom Tooltip Architecture
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0F1524] border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[140px]">
      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <Calendar size={10} /> {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((p, i) => {
          // Detect linear gradient color interpolation fallbacks safely
          const displayColor = p.color && p.color.includes('url') ? '#6366F1' : p.color;
          return (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-400 font-medium">{p.name}:</span>
              <span className="font-mono font-bold" style={{ color: displayColor }}>
                {typeof p.value === 'number' && p.value > 1000 ? formatINR(p.value) : `${p.value}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const COLORS = { income: '#10B981', expenses: '#F43F5E', savings: '#3B82F6', score: '#8B5CF6' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6m');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/analytics?period=${period}`);
        setData(res.data);
        setError('');
      } catch {
        setError('Unable to reach the backend. Showing empty analytics until your API reconnects.');
        const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
        const monthly = MONTHS.slice(0, months).map((m) => ({
          month: m,
          income: 0,
          expenses: 0,
          savings: 0,
          score: 0,
        }));
        const catData = [];
        setData({ monthly, catData });
      } finally { setLoading(false); }
    };
    load();
  }, [period]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
        <div className="h-12 w-1/4 bg-slate-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const lastMonth = data?.monthly?.[data.monthly.length - 1] || {};
  const firstMonth = data?.monthly?.[0] || {};

  // Production-hardened calculation algorithms guarding against division-by-zero maps
  const incomeGrowth = firstMonth.income && firstMonth.income !== 0
    ? (((lastMonth.income - firstMonth.income) / firstMonth.income) * 100).toFixed(1)
    : '0.0';
  const savingsGrowth = firstMonth.savings && firstMonth.savings !== 0
    ? (((lastMonth.savings - firstMonth.savings) / firstMonth.savings) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-slate-100 antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      
      {/* CSS Viewport Animation Engine */}
      <style>{`
        @keyframes chartFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-chart-viewport { animation: chartFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header Controls Interface Channel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <PageHeader title="System Analytics" subtitle="Analyze macro cash distributions and velocity parameters." />
        </div>
        
        {/* Dynamic Window Configuration Matrix */}
        <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          {[
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '12m', label: '1 Year' }
          ].map(p => (
            <button 
              key={p.id} 
              onClick={() => setPeriod(p.id)}
              className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all duration-200 ${period === p.id ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* KPI Core Data Matrix Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Monthly Income', value: formatINR(Math.round(data.monthly.reduce((s, m) => s + m.income, 0) / (data.monthly.length || 1))), color: '#10B981', icon: <DollarSign size={13} /> },
          { label: 'Avg Monthly Spend', value: formatINR(Math.round(data.monthly.reduce((s, m) => s + m.expenses, 0) / (data.monthly.length || 1))), color: '#F43F5E', icon: <Activity size={13} /> },
          { label: 'Income Growth Rate', value: `${parseFloat(incomeGrowth) >= 0 ? '+' : ''}${incomeGrowth}%`, color: '#3B82F6', icon: parseFloat(incomeGrowth) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} /> },
          { label: 'Savings Velocity Δ', value: `${parseFloat(savingsGrowth) >= 0 ? '+' : ''}${savingsGrowth}%`, color: '#8B5CF6', icon: parseFloat(savingsGrowth) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} /> },
        ].map((k, i) => (
          <div 
            key={i} 
            className="bg-[#0F1524]/40 border border-slate-800/80 p-4 rounded-2xl shadow-md group hover:bg-[#0F1524]/70 hover:border-slate-700/60 transition-all duration-300 animate-chart-viewport"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{k.label}</span>
              <span style={{ color: k.color }} className="opacity-80">{k.icon}</span>
            </div>
            <div className="font-mono text-base font-black tracking-tight" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Composite Vector Stream Processing Engine */}
      <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl animate-chart-viewport" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-xs text-slate-400 font-mono uppercase tracking-widest">Capital Horizon Vectors</h3>
            <p className="text-xs text-slate-500 mt-0.5">Aggregate balancing layout showing gross income trends mapped to residual savings reserves.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-mono font-bold uppercase tracking-wider">
            {['income', 'expenses', 'savings'].map(k => (
              <span key={k} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-850">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[k] }} />
                <span className="text-slate-400">{k}</span>
              </span>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data.monthly} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
            <defs>
              {['income', 'expenses'].map(k => (
                <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[k]} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={COLORS[k]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" vertical={false} />
            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'font-mono' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#475569" tick={{ fontSize: 9, fontFamily: 'font-mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} width={50} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="income" name="Gross Income" stroke={COLORS.income} strokeWidth={2} fill="url(#grad_income)" dot={false} />
            <Area type="monotone" dataKey="expenses" name="Expenditures" stroke={COLORS.expenses} strokeWidth={2} fill="url(#grad_expenses)" dot={false} />
            <Bar dataKey="savings" name="Retained Savings" fill={COLORS.savings} radius={[4, 4, 0, 0]} barSize={24} opacity={0.75} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Grid Allocation Split Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Savings Efficiency Index */}
        <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl animate-chart-viewport" style={{ animationDelay: '250ms' }}>
          <div className="mb-4">
            <h3 className="font-bold text-xs text-slate-400 font-mono uppercase tracking-widest">Savings Efficiency Index (%)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated net margin retention efficiency curves across timeline steps.</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data.monthly.map(m => ({ ...m, rate: m.income ? parseFloat(((m.savings / m.income) * 100).toFixed(1)) : 0 }))} margin={{ top: 10, right: 5, bottom: 0, left: -25 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" vertical={false} />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fontSize: 9, fontFamily: 'font-mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Savings Margin" stroke="#8B5CF6" strokeWidth={2} fill="url(#rateGrad)" dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Categorical Distribution Analysis Matrix */}
        <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl id-pie-matrix animate-chart-viewport" style={{ animationDelay: '300ms' }}>
          <div className="mb-4">
            <h3 className="font-bold text-xs text-slate-400 font-mono uppercase tracking-widest">Categorical Distributions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution breakdown of systemic capital outflows across sectors.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 flex justify-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie 
                    data={data.catData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={75}
                    dataKey="value" 
                    paddingAngle={3} 
                    animationDuration={600}
                  >
                    {data.catData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#090D16" strokeWidth={1.5} /> // Fixed array index key allocation
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0F1524', border: '1px solid #1E293B', borderRadius: 12, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Scroll-Hardened Component List */}
            <div className="w-full sm:w-1/2 space-y-2.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
              {data.catData.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-8">No expense categories saved yet.</div>
              ) : data.catData.map((item) => {
                const total = data.catData.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold" style={{ color: item.color }}>{pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full p-[0.5px] border border-slate-900">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Health Score Vector Workspace */}
      <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl animate-chart-viewport" style={{ animationDelay: '350ms' }}>
        <div className="mb-4">
          <h3 className="font-bold text-xs text-slate-400 font-mono uppercase tracking-widest">Financial Health Index Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Calculated internal health coefficient mapping spending boundaries and liability thresholds.</p>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={data.monthly} margin={{ top: 10, right: 5, bottom: 0, left: -25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" vertical={false} />
            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9, fontFamily: 'font-mono' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              name="Health Score" 
              stroke="#8B5CF6" 
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFFFFF' }}
              animationDuration={800} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
