import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatINR, MONTHS } from '../utils/helpers';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, CreditCard, Wallet, Target, Shield, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const T = {
  bg: '#17252A', surface: '#0F1E23', card: 'rgba(23,37,42,0.9)',
  accent: '#3AAFA9', mid: '#2B7A78', light: '#DEF2F1',
  text: '#FEFFFF', muted: 'rgba(222,242,241,0.5)',
  border: 'rgba(43,122,120,0.22)', borderHover: 'rgba(58,175,169,0.4)',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: T.muted, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, isCurrency, suffix, icon: Icon, color, trend, trendLabel, delay }) {
  return (
    <div
      style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px',
        animation: `dashSlideUp 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards`, opacity: 0,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(58,175,169,0.1)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}14`, border: `1px solid ${color}25` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: trend ? 8 : 0 }}>
        {isCurrency ? formatINR(value) : `${value}${suffix || ''}`}
      </div>
      {trend && (
        <p style={{ fontSize: 11, color: T.accent, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
          ▲ {trend}% <span style={{ color: T.muted, fontWeight: 400 }}>{trendLabel}</span>
        </p>
      )}
    </div>
  );
}

function ProgressBar({ value, max, color, height = 5 }) {
  const pct = Math.min(Math.round((value / max) * 100), 100) || 0;
  return (
    <div style={{ width: '100%', background: 'rgba(43,122,120,0.15)', borderRadius: 100, overflow: 'hidden', height }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 1s ease' }} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, score, goals, emergency] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/health-score'),
          api.get('/goals'),
          api.get('/dashboard/emergency'),
        ]);
        setData({ summary: summary.data, score: score.data, goals: goals.data.slice(0, 3), emergency: emergency.data });
        setError('');
      } catch {
        setError('Unable to reach the backend. Showing an empty dashboard until your API reconnects.');
        setData({
          summary: { totalIncome: 0, totalExpenses: 0, totalSavings: 0, savingsRate: 0, monthlyData: MONTHS.slice(0, 6).map(m => ({ month: m, income: 0, expenses: 0, savings: 0 })), categoryBreakdown: [], risks: [] },
          score: { score: 0, breakdown: { savings: 0, emergency: 0, debt: 0, goals: 0, stability: 0 } },
          goals: [],
          emergency: { coverage: 0, recommended: 6, currentSavings: 0, monthlyExpenses: 0 },
        });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: `2px solid rgba(58,175,169,0.15)`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>Loading Dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { summary, score, goals, emergency } = data;

  const scoreBreakdown = [
    { label: 'Savings Performance',    value: score.breakdown?.savings   || 0, color: T.accent },
    { label: 'Emergency Readiness',    value: score.breakdown?.emergency || 0, color: '#38BDF8' },
    { label: 'Debt & Liability',       value: score.breakdown?.debt      || 0, color: '#A78BFA' },
    { label: 'Goal Progress Rate',     value: score.breakdown?.goals     || 0, color: '#FBBF24' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '32px 40px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes dashSlideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dashFade    { from { opacity:0; } to { opacity:1; } }
        @keyframes spin        { to { transform:rotate(360deg); } }
        .dash-card-hover { transition: transform 0.2s, border-color 0.2s !important; }
        .dash-card-hover:hover { transform: translateY(-2px) !important; border-color: rgba(58,175,169,0.4) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: `1px solid ${T.border}`, animation: 'dashFade 0.4s forwards' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0] || 'User'}
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>
          Financial Overview
        </h1>
      </div>

      {error && (
        <div style={{ marginBottom: 24, borderRadius: 12, border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.06)', padding: '12px 16px', fontSize: 12, color: '#FCD34D' }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Income"   value={summary.totalIncome}   isCurrency icon={TrendingUp} color={T.accent}  delay={0}   />
        <StatCard label="Total Expenses" value={summary.totalExpenses} isCurrency icon={CreditCard} color="#F87171"    delay={60}  />
        <StatCard label="Net Savings"    value={summary.totalSavings}  isCurrency icon={Wallet}     color="#38BDF8"    delay={120} />
        <StatCard label="Savings Rate"   value={summary.savingsRate}   suffix="%" icon={Target}     color="#FBBF24"    delay={180} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
        {/* Area chart */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 24px', animation: 'dashSlideUp 0.5s 240ms forwards', opacity: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Cash Flow</h2>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 20 }}>Income vs. expenses over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={summary.monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F87171" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,122,120,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fontSize: 9, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} width={42} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: T.border, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="income"   name="Income"   stroke={T.accent} strokeWidth={2} fill="url(#incG)" dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F87171"  strokeWidth={2} fill="url(#expG)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health index */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', animation: 'dashSlideUp 0.5s 280ms forwards', opacity: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Financial Health</h2>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 20 }}>Your overall score</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 56, fontWeight: 800, color: T.accent, lineHeight: 1 }}>{score.score}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: T.accent, background: `${T.accent}12`, border: `1px solid ${T.accent}25`, padding: '3px 10px', borderRadius: 100, marginTop: 10 }}>
              {score.score >= 80 ? 'EXCELLENT' : score.score >= 50 ? 'GOOD' : 'NEEDS WORK'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            {scoreBreakdown.map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: T.muted }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{item.value}%</span>
                </div>
                <ProgressBar value={item.value} max={100} color={item.color} height={4} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Expense pie */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px', animation: 'dashSlideUp 0.5s 320ms forwards', opacity: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Expense Breakdown</h2>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>By category</p>
          <div style={{ height: 140, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.categoryBreakdown} cx="50%" cy="50%" innerRadius={44} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {summary.categoryBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} stroke={T.surface} strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {summary.categoryBreakdown.length === 0
              ? <p style={{ textAlign: 'center', color: T.muted, fontSize: 12 }}>No expenses yet.</p>
              : summary.categoryBreakdown.map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ color: T.muted }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: T.text }}>{formatINR(item.value)}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Goals */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px', animation: 'dashSlideUp 0.5s 360ms forwards', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: T.text }}>Active Goals</h2>
            <Link to="/goals" style={{ fontSize: 11, fontWeight: 700, color: T.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              All <ArrowRight size={11} />
            </Link>
          </div>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 16 }}>Target deadlines</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {goals.length === 0
              ? <p style={{ color: T.muted, fontSize: 12, textAlign: 'center', paddingTop: 24 }}>No goals yet.</p>
              : goals.map(goal => {
                const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
                return (
                  <div key={goal._id} style={{ padding: '12px', borderRadius: 12, background: 'rgba(43,122,120,0.06)', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{goal.icon || '🎯'}</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{goal.name}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: T.accent }}>{pct}%</span>
                    </div>
                    <ProgressBar value={goal.savedAmount} max={goal.targetAmount} color={T.accent} height={5} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.muted, marginTop: 6, fontFamily: 'monospace' }}>
                      <span>{formatINR(goal.savedAmount)}</span>
                      <span>{formatINR(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Emergency */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', animation: 'dashSlideUp 0.5s 400ms forwards', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38BDF8' }}>
              <Shield size={13} /> Emergency Fund
            </div>
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 4 }}>{emergency.coverage} months</div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>vs {emergency.recommended} month target</div>
            <ProgressBar value={emergency.coverage} max={emergency.recommended} color={emergency.coverage >= emergency.recommended ? T.accent : '#F87171'} height={5} />
          </div>

          {/* AI coach */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', flex: 1, animation: 'dashSlideUp 0.5s 440ms forwards', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A78BFA' }}>
              <Sparkles size={13} /> AI Coach
            </div>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>
              Ask the coach to analyze your income, expenses, and goals for account-specific recommendations.
            </p>
            <Link to="/ai-coach" style={{ fontSize: 12, fontWeight: 700, color: T.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Launch Coach <ArrowRight size={12} />
            </Link>
          </div>

          {/* Risks */}
          {summary.risks?.length > 0 && (
            <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 16, padding: '16px 20px', animation: 'dashSlideUp 0.5s 480ms forwards', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#F87171' }}>
                <AlertTriangle size={13} /> Budget Alerts
              </div>
              {summary.risks.map((r, i) => (
                <p key={i} style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#F87171', flexShrink: 0 }}>▪</span>{r}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}