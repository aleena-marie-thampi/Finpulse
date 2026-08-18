import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Emergency from './pages/Emergency';
import Analytics from './pages/Analytics';
import AICoach from './pages/AICoach';
import Achievements from './pages/Achievements';
import { useEffect } from 'react';

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-[#8a95b8]">Loading FinPulse...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />; 
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/health`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Network health response was not okay');
      })
      .then(data => console.log('📡 Engine connectivity baseline:', data.status))
      .catch(err => console.warn('⚠️ Engine connection check deferred:', err.message));
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page accessible by everyone */}
          <Route path="/" element={<Home />} />

          {/* Authentication Channels */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Main Secure Application Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/achievements" element={<Achievements />} />
          </Route>

          {/* Fallback Catch-all back to home landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}