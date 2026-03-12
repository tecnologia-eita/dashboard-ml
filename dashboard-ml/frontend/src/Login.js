import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || '';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) onLogin(data.token);
      else setError(data.error || 'Erro ao fazer login');
    } catch {
      setError('Erro de conexão com o servidor');
    }
    setLoading(false);
  }

  return (
    <div style={styles.bg}>
      <div style={styles.noise} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoMl}>ML</span>
          <span style={styles.logoDash}>dash</span>
        </div>
        <p style={styles.subtitle}>Painel de Vendas · Mercado Livre</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuário</label>
            <input
              style={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading} type="submit">
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  noise: {
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    opacity: 0.6, pointerEvents: 'none',
  },
  card: {
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: 16,
    padding: '48px 40px',
    width: 360,
    position: 'relative',
    boxShadow: '0 0 60px rgba(255,199,0,0.06)',
  },
  logo: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 },
  logoMl: {
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700, fontSize: 28,
    background: 'linear-gradient(135deg, #FFE000, #FFC300)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: -1,
  },
  logoDash: { color: '#555', fontSize: 22, fontWeight: 600, letterSpacing: 2 },
  subtitle: { color: '#555', fontSize: 13, marginBottom: 32, marginTop: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  input: {
    background: '#1e1e2a', border: '1px solid #2a2a3a', borderRadius: 8,
    padding: '12px 14px', color: '#fff', fontSize: 15, outline: 'none',
    fontFamily: "'Space Mono', monospace",
    transition: 'border-color 0.2s',
  },
  error: { color: '#ff4d6d', fontSize: 13, margin: 0 },
  btn: {
    background: 'linear-gradient(135deg, #FFE000, #FFC300)',
    border: 'none', borderRadius: 8, padding: '14px',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15,
    color: '#0a0a0f', cursor: 'pointer', marginTop: 4,
    letterSpacing: 0.5,
  },
  btnDisabled: {
    background: '#2a2a3a', border: 'none', borderRadius: 8, padding: '14px',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15,
    color: '#555', cursor: 'not-allowed', marginTop: 4,
  },
};
