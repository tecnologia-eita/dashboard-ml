import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from './App';

const fmt = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtPct = v => `${Number(v || 0).toFixed(1)}%`;
const YELLOW = '#FFC300';
const GREEN = '#00e676';
const RED = '#ff4d6d';
const BLUE = '#4fc3f7';
const PURPLE = '#ce93d8';
const COLORS = [YELLOW, GREEN, BLUE, PURPLE, RED, '#80cbc4'];

const hoje = new Date();
const dStr = d => d.toISOString().split('T')[0];
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

export default function Dashboard({ onLogout }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inicio, setInicio] = useState(dStr(primeiroDiaMes));
  const [fim, setFim] = useState(dStr(hoje));
  const [aba, setAba] = useState('resumo');
  const [pedidos, setPedidos] = useState([]);
  const [filtroPedidos, setFiltroPedidos] = useState({ sku: '', tipo: '' });
  const [pagina, setPagina] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);

  const buscarResumo = useCallback(async () => {
    setLoading(true);
    const d = await api(`/api/resumo?inicio=${inicio}&fim=${fim}`);
    setDados(d);
    setLoading(false);
  }, [inicio, fim]);

  const buscarPedidos = useCallback(async (pag = 1) => {
    const p = await api(`/api/pedidos?inicio=${inicio}&fim=${fim}&sku=${filtroPedidos.sku}&tipo=${filtroPedidos.tipo}&pagina=${pag}`);
    setPedidos(p.pedidos || []);
    setTotalPedidos(p.total || 0);
    setPagina(pag);
  }, [inicio, fim, filtroPedidos]);

  useEffect(() => { buscarResumo(); }, [buscarResumo]);
  useEffect(() => { if (aba === 'pedidos') buscarPedidos(); }, [aba, buscarPedidos]);

  const t = dados?.totais || {};
  const lucroTotal = parseFloat(t.total_lucro || 0);
  const margemMedia = parseFloat(t.margem_media || 0);

  return (
    <div style={s.root}>
      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <span style={s.logoMl}>ML</span>
          <span style={s.logoDash}>dash</span>
        </div>
        <nav style={s.nav}>
          {[
            { id: 'resumo', icon: '◈', label: 'Resumo' },
            { id: 'vendas', icon: '◉', label: 'Vendas' },
            { id: 'produtos', icon: '▣', label: 'Produtos' },
            { id: 'pedidos', icon: '≡', label: 'Pedidos' },
          ].map(item => (
            <button
              key={item.id}
              style={aba === item.id ? s.navItemActive : s.navItem}
              onClick={() => setAba(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button style={s.logoutBtn} onClick={onLogout}>Sair →</button>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <h1 style={s.pageTitle}>
              {aba === 'resumo' && 'Visão Geral'}
              {aba === 'vendas' && 'Análise de Vendas'}
              {aba === 'produtos' && 'Produtos'}
              {aba === 'pedidos' && 'Pedidos'}
            </h1>
            <p style={s.pageSub}>Atualizado agora</p>
          </div>
          <div style={s.filtros}>
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} style={s.dateInput} />
            <span style={{ color: '#555' }}>→</span>
            <input type="date" value={fim} onChange={e => setFim(e.target.value)} style={s.dateInput} />
            <button style={s.btnFiltrar} onClick={buscarResumo}>Filtrar</button>
          </div>
        </header>

        {loading ? (
          <div style={s.loadingWrap}><div style={s.spinner} /></div>
        ) : (
          <>
            {/* ── ABA RESUMO ── */}
            {aba === 'resumo' && (
              <div style={s.content}>
                {/* KPI Cards */}
                <div style={s.kpiGrid}>
                  <KpiCard label="Total Vendido" value={fmt(t.total_bruto)} sub={`${t.total_pedidos} pedidos`} color={YELLOW} />
                  <KpiCard label="Lucro Líquido" value={fmt(lucroTotal)} sub={fmtPct(margemMedia) + ' de margem'} color={lucroTotal >= 0 ? GREEN : RED} />
                  <KpiCard label="Comissão ML" value={fmt(t.total_comissao)} sub="Taxa cobrada" color={RED} />
                  <KpiCard label="Custo Total" value={fmt(t.total_custo)} sub="Produtos" color={BLUE} />
                  <KpiCard label="Imposto (14%)" value={fmt(t.total_imposto)} sub="Sobre líquido" color={PURPLE} />
                  <KpiCard label="Impulsionamento" value={fmt(t.total_impulsionamento)} sub="10% sobre bruto" color="#80cbc4" />
                </div>

                {/* Gráfico Lucro por dia */}
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Lucro x Vendas por Dia</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={dados?.porDia || []}>
                      <defs>
                        <linearGradient id="gBruto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={YELLOW} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={YELLOW} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GREEN} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                      <XAxis dataKey="dia" tick={{ fill: '#555', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fill: '#555', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                      <Tooltip
                        contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8 }}
                        labelStyle={{ color: '#aaa' }}
                        formatter={v => fmt(v)}
                      />
                      <Legend formatter={v => <span style={{ color: '#888', fontSize: 12 }}>{v}</span>} />
                      <Area type="monotone" dataKey="bruto" name="Bruto" stroke={YELLOW} fill="url(#gBruto)" strokeWidth={2} />
                      <Area type="monotone" dataKey="lucro" name="Lucro" stroke={GREEN} fill="url(#gLucro)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Tipo de Anúncio */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>Vendas por Tipo de Anúncio</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dados?.porTipo || []} dataKey="pedidos" nameKey="tipo" cx="50%" cy="50%" outerRadius={70} label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {(dados?.porTipo || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => v + ' pedidos'} contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>Top 5 Produtos — Lucro</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={(dados?.porProduto || []).slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                        <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                        <YAxis type="category" dataKey="sku" tick={{ fill: '#888', fontSize: 11 }} width={70} />
                        <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8 }} formatter={v => fmt(v)} />
                        <Bar dataKey="lucro" name="Lucro" fill={GREEN} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA VENDAS ── */}
            {aba === 'vendas' && (
              <div style={s.content}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Pedidos por Dia</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dados?.porDia || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                      <XAxis dataKey="dia" tick={{ fill: '#555', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8 }} />
                      <Bar dataKey="pedidos" name="Pedidos" fill={YELLOW} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Lucro x Custo x Comissão por Dia</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dados?.porDia || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                      <XAxis dataKey="dia" tick={{ fill: '#555', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fill: '#555', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                      <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8 }} formatter={v => fmt(v)} />
                      <Legend formatter={v => <span style={{ color: '#888', fontSize: 12 }}>{v}</span>} />
                      <Area type="monotone" dataKey="bruto" name="Bruto" stroke={YELLOW} fill="none" strokeWidth={2} strokeDasharray="4 2" />
                      <Area type="monotone" dataKey="lucro" name="Lucro" stroke={GREEN} fill="none" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── ABA PRODUTOS ── */}
            {aba === 'produtos' && (
              <div style={s.content}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>Ranking de Produtos</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {['#', 'SKU', 'Título', 'Vendas', 'Bruto', 'Lucro'].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(dados?.porProduto || []).map((p, i) => (
                          <tr key={p.sku} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                            <td style={s.td}>{i + 1}</td>
                            <td style={{ ...s.td, fontFamily: "'Space Mono', monospace", color: YELLOW, fontSize: 12 }}>{p.sku}</td>
                            <td style={{ ...s.td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</td>
                            <td style={s.td}>{p.vendas}</td>
                            <td style={s.td}>{fmt(p.bruto)}</td>
                            <td style={{ ...s.td, color: parseFloat(p.lucro) >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(p.lucro)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA PEDIDOS ── */}
            {aba === 'pedidos' && (
              <div style={s.content}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <input
                    placeholder="Filtrar por SKU..."
                    style={{ ...s.dateInput, minWidth: 180 }}
                    value={filtroPedidos.sku}
                    onChange={e => setFiltroPedidos(f => ({ ...f, sku: e.target.value }))}
                  />
                  <select
                    style={s.dateInput}
                    value={filtroPedidos.tipo}
                    onChange={e => setFiltroPedidos(f => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value="">Todos os tipos</option>
                    <option value="Premium">Premium</option>
                    <option value="Diamante">Diamante</option>
                    <option value="Clássico">Clássico</option>
                    <option value="Ouro">Ouro</option>
                  </select>
                  <button style={s.btnFiltrar} onClick={() => buscarPedidos(1)}>Buscar</button>
                  <span style={{ color: '#555', fontSize: 13, alignSelf: 'center' }}>{totalPedidos} pedidos encontrados</span>
                </div>
                <div style={s.chartCard}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {['Order ID', 'SKU', 'Título', 'Tipo', 'Bruto', 'Comissão', 'Frete', 'Custo', 'Lucro', 'Margem', 'Data'].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map((p, i) => {
                          const lucro = parseFloat(p.lucro || 0);
                          return (
                            <tr key={p.id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                              <td style={{ ...s.td, fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#888' }}>{p.order_id}</td>
                              <td style={{ ...s.td, fontFamily: "'Space Mono', monospace", color: YELLOW, fontSize: 12 }}>{p.item_sku}</td>
                              <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.item_title}</td>
                              <td style={{ ...s.td, fontSize: 12 }}><span style={badgeStyle(p.listing_type)}>{p.listing_type}</span></td>
                              <td style={s.td}>{fmt(p.valor_bruto)}</td>
                              <td style={{ ...s.td, color: RED }}>{fmt(p.comissao)}</td>
                              <td style={{ ...s.td, color: '#888' }}>{fmt(p.frete_aplicado_no_pedido)}</td>
                              <td style={s.td}>{fmt(p.preco_custo)}</td>
                              <td style={{ ...s.td, color: lucro >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(lucro)}</td>
                              <td style={{ ...s.td, color: lucro >= 0 ? GREEN : RED }}>{p.margem_pct_bruto}</td>
                              <td style={{ ...s.td, fontSize: 11, color: '#555' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Paginação */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                    {pagina > 1 && <button style={s.btnFiltrar} onClick={() => buscarPedidos(pagina - 1)}>← Anterior</button>}
                    <span style={{ color: '#555', fontSize: 13, alignSelf: 'center' }}>Página {pagina} de {Math.ceil(totalPedidos / 50)}</span>
                    {pagina * 50 < totalPedidos && <button style={s.btnFiltrar} onClick={() => buscarPedidos(pagina + 1)}>Próxima →</button>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ ...s.kpiCard, borderTopColor: color }}>
      <p style={s.kpiLabel}>{label}</p>
      <p style={{ ...s.kpiValue, color }}>{value}</p>
      <p style={s.kpiSub}>{sub}</p>
    </div>
  );
}

function badgeStyle(tipo) {
  const colors = { Premium: '#FFE000', Diamante: '#4fc3f7', Clássico: '#ce93d8', Ouro: '#FFD54F', Prata: '#B0BEC5', Bronze: '#FFCC80' };
  return {
    background: (colors[tipo] || '#555') + '22',
    color: colors[tipo] || '#888',
    border: `1px solid ${(colors[tipo] || '#555')}44`,
    borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    whiteSpace: 'nowrap',
  };
}

const s = {
  root: { display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Syne', sans-serif", color: '#e8e8f0' },
  sidebar: {
    width: 200, background: '#0e0e18', borderRight: '1px solid #1e1e2a',
    display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
  },
  sidebarLogo: { display: 'flex', alignItems: 'baseline', gap: 4, padding: '0 24px', marginBottom: 40 },
  logoMl: { fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 22, background: 'linear-gradient(135deg,#FFE000,#FFC300)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoDash: { color: '#444', fontSize: 16, fontWeight: 600, letterSpacing: 2 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: '#555', fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: 10, background: '#FFC30011', border: 'none', color: '#FFC300', fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' },
  navIcon: { fontSize: 16 },
  logoutBtn: { background: 'none', border: 'none', color: '#333', fontFamily: "'Syne', sans-serif", fontSize: 13, cursor: 'pointer', padding: '10px 24px', textAlign: 'left', marginTop: 8 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #1e1e2a', flexWrap: 'wrap', gap: 16 },
  pageTitle: { margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' },
  pageSub: { margin: '4px 0 0', color: '#444', fontSize: 12, fontFamily: "'Space Mono', monospace" },
  filtros: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  dateInput: { background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 6, padding: '8px 12px', color: '#aaa', fontSize: 13, fontFamily: "'Space Mono', monospace", outline: 'none' },
  btnFiltrar: { background: '#FFC300', border: 'none', borderRadius: 6, padding: '8px 16px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#0a0a0f', cursor: 'pointer' },
  content: { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  kpiCard: { background: '#13131a', border: '1px solid #1e1e2a', borderTop: '3px solid', borderRadius: 10, padding: '20px 16px' },
  kpiLabel: { margin: '0 0 8px', color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  kpiValue: { margin: '0 0 6px', fontSize: 22, fontWeight: 800, fontFamily: "'Space Mono', monospace" },
  kpiSub: { margin: 0, color: '#444', fontSize: 12 },
  chartCard: { background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 10, padding: '20px 24px' },
  chartTitle: { margin: '0 0 20px', color: '#aaa', fontSize: 14, fontWeight: 700, letterSpacing: 0.5 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #1e1e2a', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', color: '#bbb', borderBottom: '1px solid #16161e', whiteSpace: 'nowrap' },
  trEven: { background: 'transparent' },
  trOdd: { background: '#0f0f18' },
  loadingWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 300 },
  spinner: { width: 36, height: 36, border: '3px solid #1e1e2a', borderTop: '3px solid #FFC300', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};
