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
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card} className="fade-in">
        <div style={s.cardAccent} />

        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <rect x="2"  y="2"  width="11" height="11" rx="3" fill="#fe9b3b" />
              <rect x="15" y="2"  width="11" height="11" rx="3" fill="#fe9b3b" opacity="0.6" />
              <rect x="2"  y="15" width="11" height="11" rx="3" fill="#fe9b3b" opacity="0.6" />
              <rect x="15" y="15" width="11" height="11" rx="3" fill="#fe9b3b" opacity="0.3" />
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
            <label style={s.label}>Usuário</label>
            <input
              style={s.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Senha</label>
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
    background: 'linear-gradient(160deg, #fdf7f2 0%, #fdeedd 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Kumbh Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '10%', left: '15%',
    width: 480, height: 480, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(254,155,59,0.12) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '8%', right: '10%',
    width: 360, height: 360, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(237,118,47,0.08) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #eeddd2',
    borderRadius: 20,
    padding: '44px 40px 36px',
    width: 420,
    position: 'relative',
    boxShadow: '0 8px 40px rgba(237,118,47,0.10), 0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, #fe9b3b, #ed762f, #fe9b3b)',
    borderRadius: '20px 20px 0 0',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
  },
  logoIcon: {
    width: 52, height: 52,
    background: '#fff5ec',
    border: '1px solid #eeddd2',
    borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Kumbh Sans', sans-serif",
    fontWeight: 800, fontSize: 21, color: '#2c1810',
    letterSpacing: -0.3,
  },
  logoAccent: { color: '#fe9b3b', marginLeft: 3 },
  logoSub: { color: '#c8a898', fontSize: 11, marginTop: 3, fontWeight: 500, letterSpacing: 0.2 },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #eeddd2, transparent)',
    marginBottom: 28,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: {
    color: '#9e7a68', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.0, textTransform: 'uppercase',
  },
  input: {
    background: '#fdf7f2',
    border: '1.5px solid #eeddd2',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#2c1810',
    fontSize: 14,
    fontWeight: 500,
    outline: 'none',
    fontFamily: "'Kumbh Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorBox: {
    background: 'rgba(224,82,82,0.07)',
    border: '1px solid rgba(224,82,82,0.22)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#c94040',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  errorIcon: {
    width: 20, height: 20,
    background: 'rgba(224,82,82,0.15)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800, color: '#c94040',
    flexShrink: 0, textAlign: 'center', lineHeight: '20px',
  },
  btn: {
    background: 'linear-gradient(135deg, #fe9b3b, #ed762f)',
    border: 'none', borderRadius: 10, padding: '13px 20px',
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 700, fontSize: 15,
    color: '#fff', cursor: 'pointer', marginTop: 4,
    boxShadow: '0 4px 18px rgba(254,155,59,0.35)',
    transition: 'all 0.2s',
    letterSpacing: 0.2,
  },
  btnLoading: {
    background: '#f5ece6', border: 'none', borderRadius: 10, padding: '13px 20px',
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 700, fontSize: 15,
    color: '#c8a898', cursor: 'not-allowed', marginTop: 4,
  },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnArrow: { fontSize: 16 },
  spinnerSmall: {
    width: 14, height: 14,
    border: '2px solid #eeddd2',
    borderTop: '2px solid #fe9b3b',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  channels: {
    display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 24, justifyContent: 'center',
  },
  channelTag: {
    background: '#fdf7f2',
    border: '1px solid #eeddd2',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 10, color: '#c8a898', fontWeight: 700, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};
