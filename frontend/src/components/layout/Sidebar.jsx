import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, TrendingUp, CreditCard, Target, Shield,
  BarChart3, Bot, Trophy, LogOut, Menu, X, Zap, Bell, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/expenses', icon: CreditCard, label: 'Expenses' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/emergency', icon: Shield, label: 'Emergency Savings' },
  { to: '/analytics', icon: BarChart3, label: 'Reports' },
  { to: '/ai-coach', icon: Bot, label: 'Coach' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full" style={{ background: '#0F1E23' }}>
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-5 min-h-[68px]"
        style={{ borderBottom: '1px solid rgba(43,122,120,0.2)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#3AAFA9' }}
        >
          <Zap size={15} style={{ color: '#17252A' }} />
        </div>

        {(!collapsed || isMobile) && (
          <span
            className="font-bold text-lg tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FEFFFF' }}
          >
            Fin<span style={{ color: '#3AAFA9' }}>Pulse</span>
          </span>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md transition-colors"
            style={{ color: 'rgba(222,242,241,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3AAFA9'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(222,242,241,0.4)'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              size={15}
              style={{ transition: 'transform 0.3s', transform: collapsed ? 'none' : 'rotate(180deg)' }}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setMobileOpen(false)}
              title={(collapsed && !isMobile) ? label : undefined}
              style={({ isActive: ia }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: (collapsed && !isMobile) ? '10px 8px' : '10px 12px',
                justifyContent: (collapsed && !isMobile) ? 'center' : undefined,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid',
                transition: 'all 0.2s',
                background: ia ? 'rgba(58,175,169,0.1)' : 'transparent',
                borderColor: ia ? 'rgba(58,175,169,0.3)' : 'transparent',
                color: ia ? '#3AAFA9' : 'rgba(222,242,241,0.55)',
              })}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(43,122,120,0.12)';
                  e.currentTarget.style.color = '#DEF2F1';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(222,242,241,0.55)';
                }
              }}
            >
              <Icon size={17} className="flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 pb-4 pt-4 flex flex-col gap-2"
        style={{
          borderTop: '1px solid rgba(43,122,120,0.2)',
          alignItems: (collapsed && !isMobile) ? 'center' : undefined
        }}
      >
        {(!collapsed || isMobile) && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-1"
            style={{ background: 'rgba(43,122,120,0.08)', border: '1px solid rgba(43,122,120,0.18)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#3AAFA9', color: '#17252A' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#FEFFFF' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(222,242,241,0.4)' }}>
                {user?.email || ''}
              </p>
            </div>
            <button style={{ color: 'rgba(222,242,241,0.35)' }} className="p-1 flex-shrink-0">
              <Bell size={13} />
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            justifyContent: (collapsed && !isMobile) ? 'center' : undefined,
            padding: (collapsed && !isMobile) ? '10px 8px' : undefined,
            color: '#F87171',
            background: 'transparent',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          title={(collapsed && !isMobile) ? 'Logout' : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: '#0F1E23',
          borderRight: '1px solid rgba(43,122,120,0.2)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile trigger */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl flex items-center justify-center shadow-xl transition-colors"
          style={{
            background: '#0F1E23',
            border: '1px solid rgba(43,122,120,0.3)',
            color: '#DEF2F1',
          }}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(15,30,35,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-60 flex flex-col h-full shadow-2xl"
            style={{
              background: '#0F1E23',
              borderRight: '1px solid rgba(43,122,120,0.2)',
              animation: 'slideIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-1 rounded-md"
              style={{ color: 'rgba(222,242,241,0.5)' }}
            >
              <X size={19} />
            </button>
            <SidebarContent isMobile />
          </aside>
        </div>
      )}
    </>
  );
}