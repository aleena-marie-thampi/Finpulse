import { useEffect } from 'react';
import { useCounter } from '../../hooks/useCounter';
import { useInView } from '../../hooks/useInView';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#17252A',
  surface:    '#0F1E23',
  border:     'rgba(43,122,120,0.22)',
  accent:     '#3AAFA9',
  accentMid:  '#2B7A78',
  light:      '#DEF2F1',
  text:       '#FEFFFF',
  muted:      'rgba(222,242,241,0.5)',
  faint:      'rgba(222,242,241,0.25)',
};

// ── Animation keyframes injected once ────────────────────────────────────────
function AnimStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes _slideUp {
        from { transform: translateY(14px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes _scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to   { transform: scale(1);    opacity: 1; }
      }
      @keyframes _shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }
      .sk {
        background: linear-gradient(90deg, rgba(43,122,120,0.08) 25%, rgba(58,175,169,0.16) 50%, rgba(43,122,120,0.08) 75%);
        background-size: 200% 100%;
        animation: _shimmer 1.8s infinite;
        border-radius: 8px;
      }
    `}} />
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, prefix = '', suffix = '', trend, trendLabel, icon: Icon, color = T.accent, delay = 0, isCurrency = false }) {
  const [ref, inView] = useInView();
  const animated = useCounter(inView ? (typeof value === 'number' ? value : 0) : 0, 1200);

  return (
    <div
      ref={ref}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '20px',
        transition: 'transform 0.25s, box-shadow 0.25s',
        cursor: 'default',
        opacity: inView ? 1 : 0,
        animation: inView ? `_slideUp 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards` : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(58,175,169,0.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <AnimStyles />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>
          {label}
        </span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>

      <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
        {prefix}{isCurrency ? new Intl.NumberFormat('en-IN').format(animated) : animated}{suffix}
      </div>

      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {trend > 0 ? <TrendingUp size={12} style={{ color: T.accent }} /> :
           trend < 0 ? <TrendingDown size={12} style={{ color: '#F87171' }} /> :
           <Minus size={12} style={{ color: T.faint }} />}
          <span style={{ fontSize: 12, fontWeight: 700, color: trend > 0 ? T.accent : trend < 0 ? '#F87171' : T.faint }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span style={{ fontSize: 12, color: T.muted }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ── HealthScoreArc ────────────────────────────────────────────────────────────
export function HealthScoreArc({ score = 0, size = 160 }) {
  const [ref, inView] = useInView();
  const animated = useCounter(inView ? score : 0, 1400);
  const color = score >= 80 ? T.accent : score >= 50 ? '#F59E0B' : '#F87171';
  const label = score >= 80 ? 'Healthy' : score >= 50 ? 'Needs Work' : 'Critical';
  const r = (size / 2) - 12;
  const circ = Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size / 2 + 28} viewBox={`0 0 ${size} ${size / 2 + 28}`}>
        <path d={`M 12 ${size/2} A ${r} ${r} 0 0 1 ${size-12} ${size/2}`} fill="none" stroke="rgba(43,122,120,0.15)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 12 ${size/2} A ${r} ${r} 0 0 1 ${size-12} ${size/2}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 5px ${color}50)` }}
        />
        <text x={size/2} y={size/2 - 2} textAnchor="middle" fontFamily="'Space Grotesk', monospace" fontSize="28" fontWeight="700" fill={T.text}>{animated}</text>
        <text x={size/2} y={size/2 + 16} textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="500" fill={T.muted}>OUT OF 100</text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, marginTop: 8, background: `${color}14`, color, border: `1px solid ${color}30` }}>
        {label}
      </span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = '', rows = 1 }) {
  return (
    <div className={className}>
      <AnimStyles />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk" style={{ height: 14, marginBottom: 8, width: i % 2 === 0 ? '100%' : '70%' }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
      <AnimStyles />
      <div className="sk" style={{ height: 10, width: '35%', marginBottom: 16 }} />
      <div className="sk" style={{ height: 26, width: '60%', marginBottom: 12 }} />
      <div className="sk" style={{ height: 10, width: '45%' }} />
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = T.accent, label, showPercent = true, height = 6 }) {
  const [ref, inView] = useInView();
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {label && <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</span>}
          {showPercent && <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: T.text }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ width: '100%', borderRadius: 100, background: 'rgba(43,122,120,0.15)', overflow: 'hidden', height }}>
        <div style={{
          height: '100%',
          borderRadius: 100,
          background: color,
          width: inView ? `${pct}%` : '0%',
          boxShadow: `0 0 8px ${color}40`,
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color = T.accent }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${color}12`, color, border: `1px solid ${color}28`, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.7 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 20, maxWidth: 280, lineHeight: 1.6 }}>{desc}</p>
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <AnimStyles />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,35,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{
        position: 'relative',
        background: T.surface,
        border: `1px solid rgba(58,175,169,0.3)`,
        borderRadius: 20,
        width: '100%',
        maxWidth: 440,
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 10,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: '_scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, color: T.text, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, background: 'rgba(43,122,120,0.1)', border: 'none', cursor: 'pointer', fontSize: 18 }} aria-label="Close">×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </h1>
          {subtitle && <p style={{ fontSize: 12, color: T.muted, marginTop: 4, fontWeight: 400 }}>{subtitle}</p>}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  );
}