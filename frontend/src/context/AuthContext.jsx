import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Clear local storage and reset API headers
  const clearAuthState = () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('fp_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        
        setUser(res.data);
        localStorage.setItem('fp_user', JSON.stringify(res.data));
      } catch (err) {
        console.warn("Auth initialization failed, clearing stale session.");
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('fp_token', token);
    localStorage.setItem('fp_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('fp_token', token);
    localStorage.setItem('fp_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};