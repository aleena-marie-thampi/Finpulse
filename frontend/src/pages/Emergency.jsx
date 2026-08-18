import { useState, useEffect } from 'react';
import api from '../api/axios'; // Corrected path resolution to shared network module
import { PageHeader, ProgressBar, CardSkeleton } from '../components/ui';
import { formatINR } from '../utils/helpers';
import { Shield, CheckCircle, TrendingUp, Info, Save } from 'lucide-react';
import { useCounter } from '../hooks/useCounter';
import { useInView } from '../hooks/useInView';
import toast from 'react-hot-toast';

// Inline Status Tag Badge to eliminate custom build dependencies
function LocalStatusBadge({ label, color }) {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border mt-4"
      style={{ 
        backgroundColor: `${color}12`, 
        borderColor: `${color}30`, 
        color: color 
      }}
    >
      {label}
    </span>
  );
}

function CoverageGauge({ coverage, recommended }) {
  const [ref, inView] = useInView();
  const animated = useCounter(inView ? Math.min(coverage, recommended) : 0, 1400);
  const pct = Math.min((coverage / recommended) * 100, 100);
  const color = pct >= 100 ? '#10B981' : pct >= 60 ? '#38BDF8' : pct >= 30 ? '#F59E0B' : '#F43F5E';
  const size = 200;
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center py-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1E293B" strokeWidth="12" />
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={r} 
            fill="none" 
            stroke={color} 
            strokeWidth={12}
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={inView ? offset : circumference}
            style={{ 
              transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)', 
              filter: `drop-shadow(0 0 8px ${color}40)` 
            }} 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black text-white">{animated.toFixed(1)}</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1">months covered</span>
        </div>
      </div>
      <LocalStatusBadge 
        label={pct >= 100 ? '✓ Fully Funded' : pct >= 60 ? 'Building Up' : 'Needs Attention'}
        color={color} 
      />
    </div>
  );
}

export default function Emergency() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ currentSavings: '', monthlyExpenses: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/dashboard/emergency');
      setData(res.data);
      setForm({ currentSavings: res.data.currentSavings, monthlyExpenses: res.data.monthlyExpenses });
    } catch {
      const empty = { currentSavings: 0, monthlyExpenses: 0, coverage: 0, recommended: 6, gap: 0, recommendedAmount: 0 };
      setData(empty);
      setForm({ currentSavings: '', monthlyExpenses: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const currentSavings = parseFloat(form.currentSavings) || 0;
    const monthlyExpenses = parseFloat(form.monthlyExpenses) || 0;
    const coverage = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
    const recommended = 6;
    const recommendedAmount = monthlyExpenses * recommended;
    const gap = Math.max(recommendedAmount - currentSavings, 0);
    const updated = { currentSavings, monthlyExpenses, coverage: parseFloat(coverage.toFixed(2)), recommended, gap, recommendedAmount };
    
    try {
      const res = await api.post('/dashboard/emergency', { currentSavings, monthlyExpenses });
      setData(res.data);
      toast.success('Emergency fund metrics sync complete.');
    } catch {
      toast.error('Network error. Updated parameters locally.');
      setData(updated);
    }
    setSaving(false);
  };

  const tips = [
    { id: 'tip-hysa', icon: '🏦', text: 'Keep emergency savings in a high-yield savings account or liquid mutual fund — not a regular checking account.' },
    { id: 'tip-auto', icon: '⚡', text: 'Automate a monthly transfer right after payday so the fund grows without requiring willpower.' },
    { id: 'tip-target', icon: '🎯', text: 'Aim for 6 months first, then work up to 12 months if your income is variable (freelance, business).' },
    { id: 'tip-secure', icon: '🔒', text: 'Only use this fund for genuine emergencies: job loss, medical, urgent home/car repair.' },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const pct = Math.min((data.coverage / data.recommended) * 100, 100);
  const color = pct >= 100 ? '#10B981' : pct >= 60 ? '#38BDF8' : pct >= 30 ? '#F59E0B' : '#F43F5E';
  const monthsToGoal = data.gap > 0 && form.monthlyExpenses
    ? Math.ceil(data.gap / (parseFloat(form.monthlyExpenses) * 0.3))
    : 0;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-100 selection:bg-indigo-500/20 antialiased">
      
      {/* Structural Animation Node stylesheet */}
      <style>{`
        @keyframes emergencySlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-emergency-enter { animation: emergencySlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <PageHeader title="Emergency Fund" subtitle="Your financial safety net — designed to protect you from unexpected expenses and life events." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Coverage status card */}
        <div className="bg-[#0F1524]/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col items-center animate-emergency-enter">
          <h2 className="font-bold text-xs font-mono tracking-widest text-slate-400 uppercase mb-4 self-start">Current Coverage</h2>
          <CoverageGauge coverage={data.coverage} recommended={data.recommended} />
          
          <div className="w-full grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Months Covered', value: `${data.coverage} mo`, color },
              { label: 'Recommended', value: `${data.recommended} mo`, color: '#64748B' },
              { label: 'Funding Gap', value: data.gap > 0 ? formatINR(data.gap) : '✓ Fully Funded', color: data.gap > 0 ? '#F43F5E' : '#10B981' },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div className="font-mono text-xs font-bold tracking-tight" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync update form frame */}
        <div className="bg-[#0F1524]/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl animate-emergency-enter" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-200">Update Fund Details</h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Recalculate your safety metrics instantly</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">Current Emergency Savings (₹)</label>
              <input 
                type="number" 
                value={form.currentSavings}
                onChange={e => setForm({ ...form, currentSavings: e.target.value })}
                className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors" 
                placeholder="80000" 
                required 
              />
            </div>
            
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 block">Average Monthly Expenses (₹)</label>
              <input 
                type="number" 
                value={form.monthlyExpenses}
                onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })}
                className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors" 
                placeholder="25000" 
                required 
              />
            </div>

            {/* Micro Live Preview Node */}
            {form.currentSavings && form.monthlyExpenses && (
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-300 space-y-1 animate-emergency-enter">
                <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Live Preview</p>
                <p className="font-sans">
                  Estimated Safety Runway: <span className="font-mono font-bold text-white">{(parseFloat(form.currentSavings) / (parseFloat(form.monthlyExpenses) || 1)).toFixed(1)} months</span>
                </p>
                {parseFloat(form.currentSavings) < parseFloat(form.monthlyExpenses) * 6 && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    You need {formatINR(parseFloat(form.monthlyExpenses) * 6 - parseFloat(form.currentSavings))} more to reach the 6-month safety benchmark.
                  </p>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={saving} 
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-900 text-white font-bold text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-2 border border-indigo-500/20"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} /> 
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Progress timeline matrix card */}
      <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4 animate-emergency-enter" style={{ animationDelay: '120ms' }}>
        <h3 className="font-bold text-xs font-mono tracking-widest text-slate-400 uppercase">Progress Toward 6-Month Target</h3>
        <ProgressBar 
          value={data.currentSavings} 
          max={data.recommendedAmount} 
          color={color} 
          height={8}
          label={`${formatINR(data.currentSavings)} of ${formatINR(data.recommendedAmount)} saved`} 
        />
        
        {monthsToGoal > 0 && form.monthlyExpenses && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
            <TrendingUp size={14} className="text-indigo-400" />
            <p>
              By saving 30% of your monthly expense budget, you will reach your target in <span className="text-indigo-400 font-bold">{monthsToGoal} months</span>.
            </p>
          </div>
        )}
        
        {data.gap === 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mt-2">
            <CheckCircle size={14} />
            <p>Your emergency fund is fully loaded! You are well prepared for unexpected costs.</p>
          </div>
        )}
      </div>

      {/* Knowledge grid block */}
      <div className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4 animate-emergency-enter" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center gap-2">
          <Info size={14} className="text-purple-400" />
          <h3 className="font-bold text-xs font-mono tracking-widest text-slate-400 uppercase">Best Practices & Guidelines</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <div 
              key={tip.id} 
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-900/60 shadow-inner"
            >
              <span className="text-xl select-none">{tip.icon}</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}