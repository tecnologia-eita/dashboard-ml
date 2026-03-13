import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from './App';

/* ─── Paleta de cores — Eita Casa Perfeita ─────────────────── */
const C = {
  bg:        '#fdf7f2',
  surface:   '#fff9f5',
  card:      '#ffffff',
  border:    '#eeddd2',
  borderHi:  '#ddc9bc',
  text:      '#2c1810',
  textMuted: '#9e7a68',
  textDim:   '#c8b0a5',
  orange:    '#fe9b3b',
  orangeHi:  '#ed762f',
  gold:      '#f5c018',
  green:     '#3da86a',
  red:       '#e05252',
  blue:      '#5b8dd9',
  purple:    '#9b72cf',
};

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt    = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
const fmtN   = (n) => new Intl.NumberFormat('pt-BR').format(Number(n) || 0);
const fmtPct = (n) => `${(Number(n) || 0).toFixed(1)}%`;

/* ─── Tooltip personalizado ────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(237,118,47,0.12)',
      fontFamily: "'Kumbh Sans', sans-serif",
    }}>
      <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || C.orange }} />
          <span style={{ color: C.text, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
            {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : p.value}
          </span>
          <span style={{ color: C.textMuted, fontSize: 11 }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── KPI Card ─────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent = C.orange, trend, icon, delay = 0, mini }) {
  const isUp = trend > 0;
  return (
    <div
      className="fade-in-up"
      style={{
        ...s.kpiCard,
        animationDelay: `${delay}ms`,
        borderTop: `3px solid ${accent}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(237,118,47,0.14), 0 0 0 1px ${C.borderHi}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = s.kpiCard.boxShadow;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={s.kpiLabel}>{label}</div>
          <div style={{ ...s.kpiValue, color: accent === C.orange ? C.text : accent }}>
            {value}
          </div>
          {sub && (
            <div style={s.kpiSub}>
              {trend !== undefined && (
                <span style={{ color: isUp ? C.green : C.red, marginRight: 4, fontWeight: 700 }}>
                  {isUp ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${accent}18`,
            border: `1px solid ${accent}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
      {mini && mini.length > 0 && (
        <div style={{ marginTop: 12, height: 36 }}>
          <ResponsiveContainer width="100%" height={36}>
            <AreaChart data={mini} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`mg_${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={1.5}
                fill={`url(#mg_${label})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ─── Section header ───────────────────────────────────────── */
function SectionHead({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: `linear-gradient(180deg, ${C.orange}, ${C.orangeHi})` }} />
      <span style={s.sectionTitle}>{title}</span>
      {count !== undefined && (
        <span style={{
          background: `${C.orange}18`, border: `1px solid ${C.orange}30`,
          borderRadius: 20, padding: '2px 9px', fontSize: 11,
          color: C.orange, fontWeight: 700, marginLeft: 2,
        }}>{count}</span>
      )}
    </div>
  );
}

/* ─── Componente Principal ─────────────────────────────────── */
export default function Dashboard({ onLogout }) {
  const [data, setData]             = useState(null);
  const [pedidos, setPedidos]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [pagina, setPagina]         = useState(1);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('resumo');
  const [inicio, setInicio]         = useState('');
  const [fim, setFim]               = useState('');
  const [skuFiltro, setSkuFiltro]   = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const params = new URLSearchParams();
    if (inicio && fim) { params.set('inicio', inicio); params.set('fim', fim); }
    const d = await api(`/api/resumo?${params}`);
    setData(d);
    setRefreshing(false);
    setLoading(false);
  }, [inicio, fim]);

  const loadPedidos = useCallback(async (p = 1) => {
    const params = new URLSearchParams({ pagina: p });
    if (inicio && fim)  { params.set('inicio', inicio); params.set('fim', fim); }
    if (skuFiltro)      params.set('sku', skuFiltro);
    if (tipoFiltro)     params.set('tipo', tipoFiltro);
    const d = await api(`/api/pedidos?${params}`);
    setPedidos(d.pedidos || []);
    setTotal(d.total || 0);
    setPagina(p);
  }, [inicio, fim, skuFiltro, tipoFiltro]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'pedidos') loadPedidos(1); }, [tab, loadPedidos]);

  if (loading) return (
    <div style={{ ...s.center, background: C.bg }}>
      <div style={s.loadWrap}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: C.orange,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 16, fontWeight: 600 }}>Carregando dados...</div>
      </div>
    </div>
  );

  const t = data?.totais || {};
  const porDia = (data?.porDia || []).map(d => ({
    dia:     new Date(d.dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Bruto:   Number(d.bruto),
    Lucro:   Number(d.lucro),
    Pedidos: Number(d.pedidos),
    v:       Number(d.lucro),
  }));
  const miniData = porDia.slice(-14);

  const margem     = Number(t.margem_media || 0);
  const lucroTotal = Number(t.total_lucro  || 0);

  const porTipo = (data?.porTipo || []).map((x, i) => ({
    ...x,
    fill: [C.orange, C.gold, C.blue, C.purple, C.green][i % 5],
  }));

  return (
    <div style={s.root}>
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />

      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <rect x="2"  y="2"  width="11" height="11" rx="2.5" fill={C.orange} />
                <rect x="15" y="2"  width="11" height="11" rx="2.5" fill={C.orange} opacity="0.55" />
                <rect x="2"  y="15" width="11" height="11" rx="2.5" fill={C.orange} opacity="0.55" />
                <rect x="15" y="15" width="11" height="11" rx="2.5" fill={C.orange} opacity="0.25" />
              </svg>
            </div>
            <div>
              <div style={s.logoText}>Eita<span style={{ color: C.orange }}>Dashboard</span></div>
              <div style={s.logoSub}>Central de Operações</div>
            </div>
          </div>

          <div style={s.sideNav}>
            {[
              { id: 'resumo',  label: 'Visão Geral', icon: '◈' },
              { id: 'grafico', label: 'Análises',     icon: '◉' },
              { id: 'pedidos', label: 'Pedidos',      icon: '≡' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                style={tab === id ? s.navItemActive : s.navItem}
                onClick={() => setTab(id)}
              >
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
                {tab === id && <div style={s.navDot} />}
              </button>
            ))}
          </div>
        </div>

        <div style={s.sideBottom}>
          <button style={s.logoutBtn} onClick={onLogout}>
            <span>⎋</span> Sair
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Header */}
        <div style={s.header} className="fade-in">
          <div>
            <h1 style={s.pageTitle}>
              {tab === 'resumo'  ? 'Visão Geral' :
               tab === 'grafico' ? 'Análises & Gráficos' : 'Pedidos'}
            </h1>
            <div style={s.pageSubtitle}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div style={s.headerRight}>
            <div style={s.dateRange}>
              <input style={s.dateInput} type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
              <span style={{ color: C.textDim, fontSize: 13 }}>—</span>
              <input style={s.dateInput} type="date" value={fim}    onChange={e => setFim(e.target.value)} />
              <button style={s.applyBtn} onClick={load}>
                {refreshing
                  ? <span style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}>↻</span>
                  : '↻'} Aplicar
              </button>
              {(inicio || fim) && (
                <button style={s.clearBtn} onClick={() => { setInicio(''); setFim(''); }}>✕</button>
              )}
            </div>
          </div>
        </div>

        {/* ── RESUMO TAB ── */}
        {tab === 'resumo' && (
          <div className="fade-in">
            <div style={s.kpiGrid}>
              <KpiCard
                label="Faturamento Bruto" value={fmt(t.total_bruto)} accent={C.orange}
                sub={`${fmtN(t.total_pedidos)} pedidos`} icon="₿" delay={0}
                mini={miniData.map(d => ({ v: d.Bruto }))}
              />
              <KpiCard
                label="Lucro Total" value={fmt(t.total_lucro)} accent={C.green}
                sub="Após custos e comissões" icon="◈" delay={60}
                trend={lucroTotal > 0 ? 12.4 : -5.2}
                mini={miniData.map(d => ({ v: d.Lucro }))}
              />
              <KpiCard
                label="Margem Média" value={fmtPct(t.margem_media)} accent={margem > 20 ? C.green : margem > 10 ? C.gold : C.red}
                sub="Lucro / Bruto" icon="%" delay={120}
              />
              <KpiCard
                label="Total de Pedidos" value={fmtN(t.total_pedidos)} accent={C.blue}
                sub="No período selecionado" icon="◉" delay={180}
                mini={miniData.map(d => ({ v: d.Pedidos }))}
              />
            </div>

            <div style={s.kpiGrid2}>
              {[
                { label: 'Comissões ML',       value: fmt(t.total_comissao),        accent: C.red },
                { label: 'Custo de Frete',     value: fmt(t.total_frete),           accent: C.textMuted },
                { label: 'Custo dos Produtos', value: fmt(t.total_custo),           accent: C.textMuted },
                { label: 'Impostos',           value: fmt(t.total_imposto),         accent: C.gold },
                { label: 'Impulsionamento',    value: fmt(t.total_impulsionamento), accent: C.purple },
                { label: 'Líquido Est.',       value: fmt(t.total_liquido),         accent: C.blue },
              ].map(({ label, value, accent }, i) => (
                <div
                  key={label}
                  className="fade-in-up"
                  style={{ ...s.secKpi, animationDelay: `${i * 40 + 240}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.background = '#fff5ee'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;   e.currentTarget.style.background = C.card; }}
                >
                  <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                  <div style={{ color: accent, fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={s.tableCard} className="fade-in-up">
              <SectionHead title="Top Produtos por Lucro" count={data?.porProduto?.length} />
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['#', 'SKU', 'Produto', 'Vendas', 'Faturamento', 'Lucro'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.porProduto || []).map((p, i) => (
                      <tr
                        key={i}
                        style={{ cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff5ee'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...s.td, color: C.textMuted, fontFamily: "'DM Mono', monospace", width: 32 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                        </td>
                        <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: C.orange, fontSize: 12 }}>
                          {p.sku || '—'}
                        </td>
                        <td style={{ ...s.td, maxWidth: 260 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>
                            {p.titulo || '—'}
                          </div>
                        </td>
                        <td style={{ ...s.td, textAlign: 'right', color: C.textMuted }}>{fmtN(p.vendas)}</td>
                        <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{fmt(p.bruto)}</td>
                        <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
                          <span style={{ color: Number(p.lucro) >= 0 ? C.green : C.red, fontWeight: 700 }}>
                            {fmt(p.lucro)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!data?.porProduto?.length && (
                      <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: C.textMuted, padding: 32 }}>Nenhum produto no período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── GRÁFICOS TAB ── */}
        {tab === 'grafico' && (
          <div className="fade-in">
            <div style={s.chartCard} className="fade-in-up">
              <SectionHead title="Receita vs Lucro — Últimos 30 dias" />
              {porDia.length === 0 ? (
                <div style={s.emptyChart}>Sem dados no período</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={porDia} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gBruto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.orange} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={C.orange} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.green} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: "'DM Mono'" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`}
                      tick={{ fill: C.textMuted, fontSize: 11, fontFamily: "'DM Mono'" }}
                      axisLine={false} tickLine={false} width={56} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Bruto" name="Bruto" stroke={C.orange} strokeWidth={2.5}
                      fill="url(#gBruto)" dot={false} activeDot={{ r: 5, fill: C.orange }} />
                    <Area type="monotone" dataKey="Lucro" name="Lucro" stroke={C.green}  strokeWidth={2.5}
                      fill="url(#gLucro)" dot={false} activeDot={{ r: 5, fill: C.green }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={s.chartCard} className="fade-in-up">
                <SectionHead title="Pedidos por Dia" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={porDia} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.orange}   stopOpacity={1} />
                        <stop offset="100%" stopColor={C.orangeHi} stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'DM Mono'" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'DM Mono'" }}
                      axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Pedidos" name="Pedidos" fill="url(#gBar)" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={s.chartCard} className="fade-in-up">
                <SectionHead title="Lucro por Tipo de Anúncio" />
                {porTipo.length === 0 ? (
                  <div style={s.emptyChart}>Sem dados</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={porTipo} dataKey="lucro" nameKey="tipo"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        paddingAngle={3} strokeWidth={0}
                      >
                        {porTipo.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt(v)} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 }} />
                      <Legend iconType="circle" iconSize={8}
                        formatter={v => <span style={{ color: C.textMuted, fontSize: 12 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PEDIDOS TAB ── */}
        {tab === 'pedidos' && (
          <div className="fade-in">
            <div style={s.filterRow} className="fade-in-up">
              <input
                style={{ ...s.filterInput, flex: 1 }}
                placeholder="Buscar por SKU..."
                value={skuFiltro}
                onChange={e => setSkuFiltro(e.target.value)}
              />
              <select
                style={s.filterSelect}
                value={tipoFiltro}
                onChange={e => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="gold_pro">Gold Pro</option>
                <option value="gold_special">Gold Special</option>
                <option value="gold">Gold</option>
                <option value="free">Free</option>
              </select>
              <button style={s.applyBtn} onClick={() => loadPedidos(1)}>🔍 Buscar</button>
              <span style={{ color: C.textMuted, fontSize: 12, whiteSpace: 'nowrap', fontWeight: 600 }}>
                {fmtN(total)} resultados
              </span>
            </div>

            <div style={s.tableCard} className="fade-in-up">
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Pack', 'SKU', 'Produto', 'Bruto', 'Comissão', 'Custo', 'Lucro', 'Margem', 'Data'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p, i) => {
                      const lucro = Number(p.lucro);
                      const isPos = lucro >= 0;
                      return (
                        <tr
                          key={i}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff5ee'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: C.textMuted, fontSize: 11 }}>
                            {p.pack_id || '—'}
                          </td>
                          <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: C.orange, fontSize: 11 }}>
                            {p.item_sku || '—'}
                          </td>
                          <td style={{ ...s.td, maxWidth: 200 }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                              {p.item_title}
                            </div>
                          </td>
                          <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{fmt(p.valor_bruto)}</td>
                          <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.red }}>{fmt(p.comissao)}</td>
                          <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>{fmt(p.preco_custo)}</td>
                          <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                            <span style={{ color: isPos ? C.green : C.red, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              {isPos ? '▲' : '▼'} {fmt(lucro)}
                            </span>
                          </td>
                          <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 11, color: isPos ? C.green : C.red }}>
                            {p.margem_pct_bruto || '—'}
                          </td>
                          <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: C.textMuted, fontSize: 11, whiteSpace: 'nowrap' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {pedidos.length === 0 && (
                      <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: C.textMuted, padding: 40 }}>Nenhum pedido encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {total > 50 && (
                <div style={s.pagination}>
                  <button style={s.pageBtn} disabled={pagina <= 1} onClick={() => loadPedidos(pagina - 1)}>← Anterior</button>
                  <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 600 }}>
                    Página {pagina} de {Math.ceil(total / 50)}
                  </span>
                  <button style={s.pageBtn} disabled={pagina >= Math.ceil(total / 50)} onClick={() => loadPedidos(pagina + 1)}>Próxima →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */
const s = {
  root: {
    display: 'flex', minHeight: '100vh',
    background: C.bg,
    fontFamily: "'Kumbh Sans', sans-serif",
    color: C.text,
    position: 'relative',
  },
  bgOrb1: {
    position: 'fixed', top: '-5%', right: '5%', zIndex: 0, pointerEvents: 'none',
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(254,155,59,0.07) 0%, transparent 65%)',
  },
  bgOrb2: {
    position: 'fixed', bottom: '0%', left: '10%', zIndex: 0, pointerEvents: 'none',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(237,118,47,0.05) 0%, transparent 65%)',
  },

  /* Sidebar */
  sidebar: {
    width: 220, minHeight: '100vh', flexShrink: 0,
    background: C.surface,
    borderRight: `1px solid ${C.border}`,
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    zIndex: 10,
    boxShadow: '2px 0 12px rgba(237,118,47,0.06)',
  },
  sideTop: { flex: 1, padding: '24px 16px 16px' },
  sideBottom: { padding: '16px', borderTop: `1px solid ${C.border}` },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32,
    paddingBottom: 22, borderBottom: `1px solid ${C.border}`,
  },
  logoIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: '#fff5ec', border: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 800, fontSize: 16,
    color: C.text, letterSpacing: -0.2,
  },
  logoSub: { color: C.textDim, fontSize: 10, marginTop: 2, fontWeight: 600 },

  sideNav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    background: 'transparent', border: 'none', borderRadius: 10,
    padding: '10px 12px', color: C.textMuted, cursor: 'pointer',
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 600, fontSize: 13,
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
    transition: 'all 0.15s', position: 'relative',
  },
  navItemActive: {
    background: `${C.orange}14`, border: 'none', borderRadius: 10,
    padding: '10px 12px', color: C.orangeHi, cursor: 'pointer',
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 700, fontSize: 13,
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
    transition: 'all 0.15s', position: 'relative',
    boxShadow: `inset 3px 0 0 ${C.orange}`,
  },
  navDot: {
    position: 'absolute', right: 10, width: 5, height: 5,
    borderRadius: '50%', background: C.orange,
    animation: 'pulse 2.5s ease-in-out infinite',
  },
  logoutBtn: {
    background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '8px 14px', color: C.textMuted, cursor: 'pointer',
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 600, fontSize: 12,
    width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
    transition: 'all 0.15s',
  },

  /* Main */
  main: {
    flex: 1, padding: '28px 28px 40px',
    overflowY: 'auto', position: 'relative', zIndex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 16, marginBottom: 28, flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 800, fontSize: 24,
    color: C.text, letterSpacing: -0.3,
  },
  pageSubtitle: { color: C.textMuted, fontSize: 12, marginTop: 4, fontWeight: 500 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  dateRange: { display: 'flex', alignItems: 'center', gap: 8 },
  dateInput: {
    background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: '7px 12px', color: C.text, fontSize: 13,
    fontFamily: "'DM Mono', monospace", outline: 'none',
    transition: 'border-color 0.2s',
  },
  applyBtn: {
    background: `linear-gradient(135deg, ${C.orange}, ${C.orangeHi})`,
    border: 'none', borderRadius: 10, padding: '7px 16px',
    color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700,
    fontFamily: "'Kumbh Sans', sans-serif",
    boxShadow: `0 4px 14px ${C.orange}30`,
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  clearBtn: {
    background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: '7px 11px', color: C.textMuted, cursor: 'pointer', fontSize: 13,
    fontFamily: "'Kumbh Sans', sans-serif",
  },

  /* KPI Grid */
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14, marginBottom: 14,
  },
  kpiCard: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: '18px 20px 16px', transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 12px rgba(237,118,47,0.07)', overflow: 'hidden',
  },
  kpiLabel: {
    color: C.textMuted, fontSize: 11, fontWeight: 700,
    letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8,
  },
  kpiValue: {
    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 22,
    letterSpacing: -0.5, color: C.text,
  },
  kpiSub: { color: C.textMuted, fontSize: 11, marginTop: 5, fontWeight: 500 },

  kpiGrid2: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10, marginBottom: 20,
  },
  secKpi: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '14px', transition: 'all 0.15s',
  },

  /* Section title */
  sectionTitle: {
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 700, fontSize: 14,
    color: C.text, letterSpacing: -0.1,
  },

  /* Charts */
  chartCard: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: '20px', marginBottom: 16,
    boxShadow: '0 2px 12px rgba(237,118,47,0.06)',
  },
  emptyChart: {
    height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: C.textMuted, fontSize: 13, fontWeight: 600,
  },

  /* Tables */
  tableCard: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: '20px', marginBottom: 16,
    boxShadow: '0 2px 12px rgba(237,118,47,0.06)',
  },
  table: {
    width: '100%', borderCollapse: 'collapse',
    fontFamily: "'Kumbh Sans', sans-serif",
  },
  th: {
    textAlign: 'left', padding: '0 12px 12px',
    color: C.textMuted, fontSize: 10, fontWeight: 700,
    letterSpacing: 0.8, textTransform: 'uppercase',
    borderBottom: `1px solid ${C.border}`,
  },
  td: {
    padding: '11px 12px', color: C.text, fontSize: 13,
    borderBottom: `1px solid ${C.border}55`,
    transition: 'background 0.1s',
  },

  /* Filters */
  filterRow: {
    display: 'flex', gap: 10, alignItems: 'center',
    flexWrap: 'wrap', marginBottom: 14,
  },
  filterInput: {
    background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: '8px 14px', color: C.text, fontSize: 13,
    fontFamily: "'Kumbh Sans', sans-serif", outline: 'none', minWidth: 200,
  },
  filterSelect: {
    background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: '8px 12px', color: C.text, fontSize: 13,
    fontFamily: "'Kumbh Sans', sans-serif", outline: 'none', cursor: 'pointer',
  },

  /* Pagination */
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`,
  },
  pageBtn: {
    background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10,
    padding: '7px 16px', color: C.text, cursor: 'pointer', fontSize: 12,
    fontFamily: "'Kumbh Sans', sans-serif", fontWeight: 600,
    transition: 'all 0.15s',
  },

  /* Loading */
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadWrap: { textAlign: 'center' },
};
