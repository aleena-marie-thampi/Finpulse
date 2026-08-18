import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, TrendingUp, Bot, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const T = { bg: '#17252A', surface: '#0F1E23', accent: '#3AAFA9', light: '#DEF2F1', text: '#FEFFFF', muted: 'rgba(222,242,241,0.5)', border: 'rgba(43,122,120,0.22)' };

const MILESTONES = [
  { icon: Star,       title: 'Instant Onboarding', text: 'Set up your financial profile immediately.' },
  { icon: TrendingUp, title: 'Easy Tracking',      text: 'Automatically monitor your savings and core metrics.' },
  { icon: Bot,        title: 'AI Assistant',       text: 'Get financial insights powered by Gemini AI.' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created. Welcome to FinPulse!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{`
        @keyframes regSlide  { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes regFade   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin      { to { transform: rotate(360deg); } }
        .reg-panel { animation: regSlide 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        .reg-form  { animation: regFade  0.4s 0.2s ease forwards; opacity: 0; }
        .reg-input:focus { border-color: #3AAFA9 !important; }
        .reg-btn:hover   { background: #DEF2F1 !important; }
        .reg-card:hover  { transform: translateX(4px); border-color: rgba(58,175,169,0.35) !important; }
      `}</style>

      {/* Left panel */}
      <div className="reg-panel" style={{ display: 'none', width: '46%', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', borderRight: `1px solid ${T.border}`, background: T.surface, position: 'relative', overflow: 'hidden' }}
        ref={el => { if (el) el.style.display = window.innerWidth >= 1024 ? 'flex' : 'none'; }}
      >
        <div style={{ position: 'absolute', top: '-8%', right: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(58,175,169,0.07)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', left: '-8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(43,122,120,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={17} style={{ color: '#17252A' }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.text }}>
            Fin<span style={{ color: T.accent }}>Pulse</span>
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: T.text, marginBottom: 16 }}>
            Create your account{' '}
            <span style={{ color: T.accent }}>and start today.</span>
          </h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.65, marginBottom: 36 }}>
            Join thousands of users tracking financial health and getting tailored assistance from smart financial models.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MILESTONES.map(({ icon: Icon, title, text }, i) => (
              <div key={i} className="reg-card" style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(43,122,120,0.07)', border: `1px solid ${T.border}`, transition: 'transform 0.2s, border-color 0.2s' }}>
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

        <div style={{ fontSize: 11, color: 'rgba(222,242,241,0.25)', position: 'relative', zIndex: 1 }}>Secured with robust encryption & industry-standard authentication.</div>
      </div>

      {/* Right / form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <div className="reg-form" style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} style={{ color: '#17252A' }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: T.text }}>Fin<span style={{ color: T.accent }}>Pulse</span></span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: '-0.02em' }}>Create account</h1>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>Set up your secure account in just a few clicks.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Your Full Name', name: 'name', type: 'text', placeholder: 'Arjun Kumar' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'name@domain.com' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="reg-input"
                  style={{ width: '100%', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="reg-input"
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
              className="reg-btn"
              style={{ width: '100%', background: T.accent, color: '#17252A', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, transition: 'all 0.2s', marginTop: 4 }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(23,37,42,0.3)', borderTopColor: '#17252A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <><span>Create Account</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p style={{ fontSize: 13, color: T.muted, textAlign: 'center', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}