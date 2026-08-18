import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, TrendingUp, Shield, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const T = { bg: '#17252A', surface: '#0F1E23', accent: '#3AAFA9', light: '#DEF2F1', text: '#FEFFFF', muted: 'rgba(222,242,241,0.5)', border: 'rgba(43,122,120,0.22)' };

const FEATURES = [
  { icon: TrendingUp, title: 'Health Scoring', text: 'AI-powered metrics to assess your financial stability.' },
  { icon: Shield, title: 'Dynamic Tracking', text: 'Real-time visibility into your savings and emergency funds.' },
  { icon: Bot, title: 'AI Advisory', text: 'On-demand financial guidance powered by Gemini AI.' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{`
        @keyframes loginSlide { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes loginFade  { from { opacity: 0; } to { opacity: 1; } }
        .login-panel { animation: loginSlide 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        .login-form  { animation: loginFade 0.4s 0.2s ease forwards; opacity: 0; }
        .login-input:focus { border-color: #3AAFA9 !important; }
        .login-btn-submit:hover { background: #DEF2F1 !important; }
        .login-feat-card { transition: transform 0.2s, border-color 0.2s; }
        .login-feat-card:hover { transform: translateX(4px); border-color: rgba(58,175,169,0.35) !important; }
      `}</style>

      {/* Left panel */}
      <div
        className="login-panel"
        style={{ display: 'none', width: '46%', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', borderRight: `1px solid ${T.border}`, background: T.surface, position: 'relative', overflow: 'hidden' }}
        ref={el => { if (el) el.style.display = window.innerWidth >= 1024 ? 'flex' : 'none'; }}
      >
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(58,175,169,0.07)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(43,122,120,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={17} style={{ color: '#17252A' }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.text }}>
            Fin<span style={{ color: T.accent }}>Pulse</span>
          </span>
        </div>

        {/* Headline + features */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(30px,3.5vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: T.text, marginBottom: 16 }}>
            Know your financial health,{' '}
            <span style={{ color: T.accent }}>not just your balance.</span>
          </h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.65, marginBottom: 36 }}>
            Move past basic transaction monitoring. Access smart forecasting designed to protect your financial future.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <div key={i} className="login-feat-card" style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(43,122,120,0.07)', border: `1px solid ${T.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(58,175,169,0.1)', border: `1px solid rgba(58,175,169,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: T.accent }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(222,242,241,0.25)', position: 'relative', zIndex: 1 }}>Secured with industry-standard encryption.</div>
      </div>

      {/* Right / form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <div className="login-form" style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }} className="lg-hidden">
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} style={{ color: '#17252A' }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: T.text }}>Fin<span style={{ color: T.accent }}>Pulse</span></span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@domain.com"
                className="login-input"
                style={{ width: '100%', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="login-input"
                  style={{ width: '100%', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 44px 12px 14px', fontSize: 14, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn-submit"
              style={{ width: '100%', background: T.accent, color: '#17252A', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, transition: 'all 0.2s', marginTop: 4 }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(23,37,42,0.3)', borderTopColor: '#17252A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <><span>Sign In</span><ArrowRight size={15} /></>
              }
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ fontSize: 13, color: T.muted, textAlign: 'center', marginTop: 24 }}>
            New to FinPulse?{' '}
            <Link to="/register" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}