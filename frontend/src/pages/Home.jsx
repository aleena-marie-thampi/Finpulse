import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, TrendingUp, Shield, Bot, Flame } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, title: 'Health Scoring', desc: 'Real metrics. Real insight. Know exactly where you stand.' },
  { icon: Shield, title: 'Emergency Tracking', desc: 'Build your safety net and watch your coverage grow.' },
  { icon: Bot, title: 'AI Coach', desc: 'On-demand guidance powered by Gemini AI.' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#17252A', color: '#FEFFFF', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes homeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes homeFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes homeFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .home-hero-title { animation: homeSlideUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .home-hero-sub   { animation: homeSlideUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .home-hero-cta   { animation: homeSlideUp 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .home-features   { animation: homeSlideUp 0.7s 0.55s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .home-badge      { animation: homeFadeIn 0.5s 0.05s ease forwards; opacity: 0; }
        .home-card-hover { transition: transform 0.25s, box-shadow 0.25s; }
        .home-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(58,175,169,0.12); }
        .home-btn-primary { transition: all 0.2s; }
        .home-btn-primary:hover { background: #DEF2F1 !important; transform: translateY(-1px); }
        .home-btn-ghost:hover { background: rgba(58,175,169,0.12) !important; }
        .home-link:hover { color: #3AAFA9 !important; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(43,122,120,0.25)',
        background: 'rgba(23,37,42,0.85)',
        backdropFilter: 'blur(10px)',
        padding: '0 48px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#3AAFA9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} style={{ color: '#17252A' }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#FEFFFF' }}>
            Fin<span style={{ color: '#3AAFA9' }}>Pulse</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/login" className="home-link" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(222,242,241,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Sign In
          </Link>
          <Link
            to="/register"
            className="home-btn-primary"
            style={{ fontSize: 13, fontWeight: 700, background: '#3AAFA9', color: '#17252A', borderRadius: 10, padding: '9px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Get Started <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

        <div className="home-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(58,175,169,0.08)', border: '1px solid rgba(58,175,169,0.2)', color: '#3AAFA9', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
          <Flame size={12} style={{ color: '#FBBF24' }} /> AI-Powered Financial Health
        </div>

        <h1
          className="home-hero-title"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#FEFFFF',
            marginBottom: 20,
          }}
        >
          Know your financial health,{' '}
          <span style={{ color: '#3AAFA9' }}>not just your balance.</span>
        </h1>

        <p
          className="home-hero-sub"
          style={{ fontSize: 17, color: 'rgba(222,242,241,0.6)', maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}
        >
          FinPulse tracks income, expenses, goals, and emergency assets — then uses AI to give you a clear picture of where you stand and what to do next.
        </p>

        <div
          className="home-hero-cta"
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link
            to="/register"
            className="home-btn-primary"
            style={{ fontSize: 14, fontWeight: 700, background: '#3AAFA9', color: '#17252A', borderRadius: 12, padding: '13px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Create Free Account <ArrowRight size={15} />
          </Link>
          <Link
            to="/login"
            className="home-btn-ghost"
            style={{ fontSize: 14, fontWeight: 600, background: 'transparent', border: '1.5px solid rgba(58,175,169,0.35)', color: '#DEF2F1', borderRadius: 12, padding: '13px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Access Dashboard
          </Link>
        </div>

        {/* Feature cards */}
        <div
          className="home-features"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 64, width: '100%' }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="home-card-hover"
              style={{
                background: 'rgba(43,122,120,0.07)',
                border: '1px solid rgba(58,175,169,0.18)',
                borderRadius: 16,
                padding: '20px 18px',
                textAlign: 'left',
                animationDelay: `${0.6 + i * 0.1}s`,
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(58,175,169,0.12)', border: '1px solid rgba(58,175,169,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={17} style={{ color: '#3AAFA9' }} />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#FEFFFF', marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(222,242,241,0.5)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(43,122,120,0.18)', padding: '20px 48px', textAlign: 'center', fontSize: 12, color: 'rgba(222,242,241,0.3)' }}>
        © 2026 FinPulse. All Rights Reserved.
      </footer>
    </div>
  );
}