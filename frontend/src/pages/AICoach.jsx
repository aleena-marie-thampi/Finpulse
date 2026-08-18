import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Bot, Sparkles, Send, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const T = { bg: '#17252A', surface: '#0F1E23', accent: '#3AAFA9', light: '#DEF2F1', text: '#FEFFFF', muted: 'rgba(222,242,241,0.5)', border: 'rgba(43,122,120,0.22)' };

const CHAT_SUGGESTIONS = [
  'How do I maximize my financial health score?',
  'How can I build a solid emergency fund?',
  'Analyze my spending across different categories.',
  'Am I on track to meet my financial goals?',
  'What are the best ways to optimize my investments?',
];

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: T.surface, border: `1px solid ${expanded ? `${insight.color}35` : T.border}`,
        borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
        animation: `coachSlide 0.4s ${index * 60}ms cubic-bezier(0.16,1,0.3,1) forwards`, opacity: 0,
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, background: `${insight.color}10`, border: `1px solid ${insight.color}22` }}>
          {insight.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: T.text, fontFamily: "'Space Grotesk', sans-serif" }}>{insight.title}</h3>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${insight.color}10`, color: insight.color, border: `1px solid ${insight.color}25`, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
              {insight.impact}
            </span>
          </div>
          <p style={{ fontSize: 12, color: expanded ? T.muted : 'rgba(222,242,241,0.35)', lineHeight: 1.6, overflow: expanded ? 'visible' : 'hidden', whiteSpace: expanded ? 'normal' : 'nowrap', textOverflow: 'ellipsis' }}>
            {insight.body}
          </p>
        </div>
        <ChevronRight size={15} style={{ color: expanded ? insight.color : T.muted, flexShrink: 0, marginTop: 2, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s, color 0.25s' }} />
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, animation: 'coachFade 0.3s ease forwards' }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(58,175,169,0.12)', border: `1px solid rgba(58,175,169,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10 }}>
          <Bot size={14} style={{ color: T.accent }} />
        </div>
      )}
      <div style={{
        maxWidth: '75%', padding: '11px 14px', fontSize: 13, lineHeight: 1.6,
        background: isUser ? T.accent : T.surface,
        color: isUser ? '#17252A' : '#D1D5DB',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        border: isUser ? 'none' : `1px solid ${T.border}`,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {msg.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 2px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export default function AICoach() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Financial Coach. I can help you analyze your spending, build savings, optimize cash flow, and achieve your financial goals. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [refreshing, setRefreshing] = useState(false);
  const bottomRef = useRef(null);
  const [liveHealthScore, setLiveHealthScore] = useState(0);
  const [liveRisksCount, setLiveRisksCount] = useState(0);
  const [dynamicInsights, setDynamicInsights] = useState([]);

  const fetchLiveTelemetry = async () => {
    try {
      const [scoreRes, summaryRes] = await Promise.all([api.get('/dashboard/health-score'), api.get('/dashboard/summary')]);
      if (scoreRes.data?.score !== undefined) setLiveHealthScore(scoreRes.data.score);
      if (summaryRes.data?.risks) {
        setLiveRisksCount(summaryRes.data.risks.length);
        const risks = summaryRes.data.risks.map(r => ({ type: 'risk', icon: '⚠️', title: 'Budget Risk Warning', body: r, impact: 'Risk Alert', color: '#F87171' }));
        const base = [
          { type: 'recommendation', icon: '💡', title: 'Reduce Non-Essential Spending', body: `Your savings rate is around ${summaryRes.data.savingsRate || 0}%. Cutting back on dining by ₹1,500 monthly will help you hit targets faster.`, impact: 'Save ₹1,500/mo', color: '#FBBF24' },
          { type: 'positive', icon: '🏆', title: 'Healthy Monthly Savings Rate', body: `Your net monthly savings are ₹${(summaryRes.data.totalSavings || 0).toLocaleString('en-IN')}. Keeping expenses tracked grows wealth long-term.`, impact: 'Good Progress', color: T.accent },
        ];
        setDynamicInsights([...risks, ...base]);
      }
    } catch {
      setLiveHealthScore(0); setLiveRisksCount(0); setDynamicInsights([]);
    }
  };

  useEffect(() => { fetchLiveTelemetry(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    const loadingId = Date.now();
    setMessages(prev => [...prev, { role: 'assistant', loading: true, id: loadingId }]);
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => prev.map(m => m.id === loadingId ? { role: 'assistant', content: res.data.reply } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === loadingId ? { role: 'assistant', content: 'Could not reach the AI endpoint. Please check that your backend is running and GEMINI_API_KEY is configured.' } : m));
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLiveTelemetry();
    setRefreshing(false);
    toast.success('Insights refreshed');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '32px 40px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes coachSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes coachFade  { from { opacity:0; } to { opacity:1; } }
        @keyframes dotPulse   { 0%,100%{opacity:0.3;transform:scale(0.9);} 50%{opacity:1;transform:scale(1.1);} }
        @keyframes spin       { to { transform:rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${T.border}`, animation: 'coachFade 0.4s forwards' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Smart Insights Platform</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>
          AI Financial Coach
        </h1>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 28, animation: 'coachFade 0.4s 0.1s forwards', opacity: 0 }}>
        {[{ key: 'insights', label: 'Smart Insights', icon: Sparkles }, { key: 'chat', label: 'AI Assistant', icon: Bot }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === key ? T.accent : 'transparent',
              color: activeTab === key ? '#17252A' : T.muted,
            }}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Insights tab */}
      {activeTab === 'insights' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, animation: 'coachFade 0.4s 0.15s forwards', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <Sparkles size={13} style={{ color: T.accent }} />
              {dynamicInsights.length} Suggestions
            </div>
            <button onClick={handleRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: T.muted, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 14px', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = `rgba(58,175,169,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
            >
              <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Health Score', value: `${liveHealthScore}/100`, icon: '❤️', color: T.accent },
              { label: 'Risk Alerts',  value: `${liveRisksCount} Active`, icon: '⚠️', color: '#F87171' },
              { label: 'Optimizations', value: `${dynamicInsights.filter(i => i.type === 'recommendation').length} Found`, icon: '💡', color: '#FBBF24' },
              { label: 'Goal Status', value: 'Live & Synced', icon: '🎯', color: '#A78BFA' },
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, animation: `coachSlide 0.35s ${i * 40}ms forwards`, opacity: 0 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Insight cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dynamicInsights.length === 0
              ? <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px', fontSize: 13, color: T.muted }}>No insights yet. Add income, expenses, or goals and refresh.</div>
              : dynamicInsights.map((insight, i) => <InsightCard key={i} insight={insight} index={i} />)
            }
          </div>
        </div>
      ) : (
        /* Chat tab */
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 290px)', minHeight: 520, animation: 'coachFade 0.3s forwards' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 24px 16px', animation: 'coachFade 0.4s forwards' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>💡 Try asking:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CHAT_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: 'rgba(58,175,169,0.06)', color: T.accent, border: `1px solid rgba(58,175,169,0.18)`, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(58,175,169,0.12)'; e.currentTarget.style.borderColor = 'rgba(58,175,169,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(58,175,169,0.06)'; e.currentTarget.style.borderColor = 'rgba(58,175,169,0.18)'; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: 'flex', gap: 10, maxWidth: 800, margin: '0 auto' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask your financial assistant a question…"
                disabled={loading}
                style={{ flex: 1, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1, transition: 'border-color 0.2s' }}
                onFocus={e => { e.target.style.borderColor = T.accent; }}
                onBlur={e => { e.target.style.borderColor = T.border; }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', background: input.trim() && !loading ? T.accent : T.surface, color: input.trim() && !loading ? '#17252A' : T.muted, flexShrink: 0, transition: 'all 0.2s' }}
              >
                {loading
                  ? <div style={{ width: 15, height: 15, border: '2px solid rgba(222,242,241,0.2)', borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <Send size={14} />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}