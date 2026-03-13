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
      else setError(data.error || 'Usuário ou senha incorretos');
    } catch {
      setError('Erro de conexão com o servidor');
    }
    setLoading(false);
  }

  return (
    <div style={s.bg}>
      {/* Grid pattern background */}
      <div style={s.grid} />
      {/* Glow orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card}>
        {/* Top accent line */}
        <div style={s.cardAccent} />

        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="2" fill="#FF6B35" />
              <rect x="15" y="2" width="11" height="11" rx="2" fill="#FF6B35" opacity="0.6" />
              <rect x="2" y="15" width="11" height="11" rx="2" fill="#FF6B35" opacity="0.6" />
              <rect x="15" y="15" width="11" height="11" rx="2" fill="#FF6B35" opacity="0.3" />
            </svg>
          </div>
          <div>
            <div style={s.logoText}>Eita<span style={s.logoAccent}>Dashboard</span></div>
            <div style={s.logoSub}>Central de Operações · Todos os Canais</div>
          </div>
        </div>

        <div style={s.divider} />

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>
              <span style={s.labelDot} />
              Usuário
            </label>
            <input
              style={s.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>
              <span style={s.labelDot} />
              Senha
            </label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>!</span>
              {error}
            </div>
          )}
          <button style={loading ? s.btnLoading : s.btn} disabled={loading} type="submit">
            {loading ? (
              <span style={s.btnInner}>
                <span style={s.spinnerSmall} />
                Verificando...
              </span>
            ) : (
              <span style={s.btnInner}>
                Acessar Dashboard
                <span style={s.btnArrow}>→</span>
              </span>
            )}
          </button>
        </form>

        <div style={s.channels}>
          {['Mercado Livre', 'Shopee', 'Wbuy', 'e mais'].map((c, i) => (
            <span key={i} style={s.channelTag}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    background: '#080b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', 'Syne', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)`,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  orb1: {
    position: 'absolute', top: '15%', left: '20%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '10%', right: '15%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,180,53,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#0e1320',
    border: '1px solid #1e2535',
    borderRadius: 16,
    padding: '40px 36px 32px',
    width: 400,
    position: 'relative',
    boxShadow: '0 0 80px rgba(255,107,53,0.07), 0 32px 64px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    background: 'linear-gradient(90deg, #FF6B35, #FFB435, #FF6B35)',
    backgroundSize: '200% 100%',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
  },
  logoIcon: {
    width: 48, height: 48,
    background: '#13192a',
    border: '1px solid #1e2535',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: 20, color: '#e8eaf0',
    letterSpacing: -0.5,
  },
  logoAccent: { color: '#FF6B35', marginLeft: 4 },
  logoSub: { color: '#3a4458', fontSize: 11, marginTop: 2, fontWeight: 500, letterSpacing: 0.3 },
  divider: {
    height: 1, background: 'linear-gradient(90deg, transparent, #1e2535, transparent)',
    marginBottom: 28,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    color: '#4a5568', fontSize: 11, fontWeight: 600,
    letterSpacing: 1.2, textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  labelDot: {
    width: 4, height: 4, borderRadius: '50%', background: '#FF6B35', display: 'inline-block',
  },
  input: {
    background: '#13192a',
    border: '1px solid #1e2535',
    borderRadius: 8,
    padding: '11px 14px',
    color: '#e8eaf0',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'DM Mono', monospace",
    transition: 'border-color 0.2s',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#f87171',
    fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  errorIcon: {
    width: 18, height: 18,
    background: 'rgba(239,68,68,0.2)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800, color: '#f87171',
    flexShrink: 0, textAlign: 'center', lineHeight: '18px',
  },
  btn: {
    background: 'linear-gradient(135deg, #FF6B35, #FF8C35)',
    border: 'none', borderRadius: 8, padding: '13px 20px',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
    color: '#fff', cursor: 'pointer', marginTop: 4,
    boxShadow: '0 4px 20px rgba(255,107,53,0.3)',
    transition: 'all 0.2s',
  },
  btnLoading: {
    background: '#1e2535', border: 'none', borderRadius: 8, padding: '13px 20px',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
    color: '#4a5568', cursor: 'not-allowed', marginTop: 4,
  },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnArrow: { fontSize: 16 },
  spinnerSmall: {
    width: 14, height: 14,
    border: '2px solid #2a3348',
    borderTop: '2px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  channels: {
    display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 24, justifyContent: 'center',
  },
  channelTag: {
    background: '#13192a',
    border: '1px solid #1e2535',
    borderRadius: 20, padding: '3px 10px',
    fontSize: 10, color: '#3a4458', fontWeight: 600, letterSpacing: 0.5,
  },
};
