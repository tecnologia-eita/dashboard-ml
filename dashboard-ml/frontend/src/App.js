import React, { useState, useEffect, useCallback } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const API = process.env.REACT_APP_API_URL || '';

export function api(path, options = {}) {
  const token = localStorage.getItem('ml_token');
  return fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(r => {
    if (r.status === 401) {
      localStorage.removeItem('ml_token');
      window.location.reload();
    }
    return r.json();
  });
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('ml_token'));

  const handleLogin = useCallback((t) => {
    localStorage.setItem('ml_token', t);
    setToken(t);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ml_token');
    setToken(null);
  }, []);

  if (!token) return <Login onLogin={handleLogin} />;
  return <Dashboard onLogout={handleLogout} />;
}
