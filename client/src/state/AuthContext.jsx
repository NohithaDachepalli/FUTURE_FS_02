import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('leadflow_token') || sessionStorage.getItem('leadflow_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('leadflow_token');
        sessionStorage.removeItem('leadflow_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async ({ email, password, remember }) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const storage = remember ? localStorage : sessionStorage;
    localStorage.removeItem('leadflow_token');
    sessionStorage.removeItem('leadflow_token');
    storage.setItem('leadflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('leadflow_token');
    sessionStorage.removeItem('leadflow_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, loading, login, logout, setUser }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

