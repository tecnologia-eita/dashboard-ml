import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from './App';

const fmt = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtPct = v => `${Number(v || 0).toFixed(1)}%`;

// Paleta Eita
const ORANGE = '#FF6B35';
const AMBER  = '#FFB435';
const GREEN  = '#34d399';
const RED    = '#f87171';
const BLUE   = '#60a5fa';
const TEAL   = '#2dd4bf';
const COLORS = [ORANGE, AMBER, GREEN, BLUE, TEAL, RED, '#a78bfa'];

// Cores por canal
const CHANNEL_COLORS = {
  'mercado livre': '#FFE000',
  'mercadolivre':  '#FFE000',
  'ml':            '#FFE000',
  'shopee':        '#EE4D2D',
  'wbuy':          '#00B2FF',
  'outro':         '#a78bfa',
};

function channelColor(canal) {
  if (!canal) return '#4a5568';
  const k = canal.toLowerCase();
  for (const key of Object.keys(CHANNEL_COLORS)) {
    if (k.includes(key)) return CHANNEL_COLORS[key];
  }
  return '#a78bfa';
}

const hoje = new Date();
const dStr = d => d.toISOString().split('T')[0];
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

// ─── Ícones SVG inline ───
const IconResumo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.25"/>
  </svg>
);
const IconVendas = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <polyline points="1,12 5,7 8,9 12,4 15,6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
const IconProdutos = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="8" width="3" height="6" rx="1" fill="currentColor"/>
    <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" opacity="0.4"/>
  </svg>
);
const IconPedidos = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

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

  const navItems = [
    { id: 'resumo',   icon: <IconResumo />,   label: 'Resumo' },
    { id: 'vendas',   icon: <IconVendas />,   label: 'Vendas' },
    { id: 'produtos', icon: <IconProdutos />, label: 'Produtos' },
    { id: 'pedidos',  icon: <IconPedidos />,  label: 'Pedidos' },
  ];

  const pageTitles = {
    resumo: 'Visão Geral', vendas: 'Análise de Vendas',
    produtos: 'Produtos', pedidos: 'Pedidos',
  };

  return (
    <div style={s.root}>
      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.sidebarTop}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="1" width="8" height="8" rx="1.5" fill={ORANGE} />
                <rect x="11" y="1" width="8" height="8" rx="1.5" fill={ORANGE} opacity="0.5" />
                <rect x="1" y="11" width="8" height="8" rx="1.5" fill={ORANGE} opacity="0.5" />
                <rect x="11" y="11" width="8" height="8" rx="1.5" fill={ORANGE} opacity="0.2" />
              </svg>
            </div>
            <div>
              <div style={s.logoName}>Eita<span style={s.logoOrange}>Dash</span></div>
              <div style={s.logoTagline}>All Channels</div>
            </div>
          </div>

          {/* Canal badges */}
          <div style={s.channelBadges}>
            <span style={{ ...s.chBadge, background: '#1a1400', color: '#FFE000', borderColor: '#2a2200' }}>ML</span>
            <span style={{ ...s.chBadge, background: '#1a0a08', color: '#EE4D2D', borderColor: '#2a1210' }}>Shopee</span>
            <span style={{ ...s.chBadge, background: '#081318', color: '#00B2FF', borderColor: '#0a1e28' }}>Wbuy</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <div style={s.navLabel}>MENU</div>
          {navItems.map(item => (
            <button
              key={item.id}
              style={aba === item.id ? s.navActive : s.navItem}
              onClick={() => setAba(item.id)}
            >
              <span style={aba === item.id ? s.navIconActive : s.navIconInactive}>
                {item.icon}
              </span>
              {item.label}
              {aba === item.id && <span style={s.navDot} />}
            </button>
          ))}
        </nav>

        <button style={s.logoutBtn} onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6 }}>
            <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sair
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <div style={s.breadcrumb}>
              <span style={s.breadcrumbRoot}>Eita Dashboard</span>
              <span style={s.breadcrumbSep}>/</span>
              <span style={s.breadcrumbPage}>{pageTitles[aba]}</span>
            </div>
            <h1 style={s.pageTitle}>{pageTitles[aba]}</h1>
          </div>
          <div style={s.filtros}>
            <div style={s.dateGroup}>
              <span style={s.dateLabel}>De</span>
              <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} style={s.dateInput} />
            </div>
            <div style={s.dateSep}>→</div>
            <div style={s.dateGroup}>
              <span style={s.dateLabel}>Até</span>
              <input type="date" value={fim} onChange={e => setFim(e.target.value)} style={s.dateInput} />
            </div>
            <button style={s.btnFiltrar} onClick={buscarResumo}>
              Filtrar
            </button>
          </div>
        </header>

        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.loadingBox}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── ABA RESUMO ── */}
            {aba === 'resumo' && (
              <div style={s.content}>
                {/* KPI Grid */}
                <div style={s.kpiGrid}>
                  <KpiCard
                    label="Total Vendido" value={fmt(t.total_bruto)}
                    sub={`${t.total_pedidos || 0} pedidos`}
                    color={AMBER} icon="💰"
                  />
                  <KpiCard
                    label="Lucro Líquido" value={fmt(lucroTotal)}
                    sub={fmtPct(margemMedia) + ' de margem'}
                    color={lucroTotal >= 0 ? GREEN : RED} icon={lucroTotal >= 0 ? '📈' : '📉'}
                  />
                  <KpiCard
                    label="Comissão Total" value={fmt(t.total_comissao)}
                    sub="Marketplaces" color={RED} icon="🏪"
                  />
                  <KpiCard
                    label="Custo de Produtos" value={fmt(t.total_custo)}
                    sub="CMV total" color={BLUE} icon="📦"
                  />
                  <KpiCard
                    label="Imposto (14%)" value={fmt(t.total_imposto)}
                    sub="Sobre líquido" color="#a78bfa" icon="🏛"
                  />
                  <KpiCard
                    label="Impulsionamento" value={fmt(t.total_impulsionamento)}
                    sub="Ads / 10% bruto" color={TEAL} icon="🚀"
                  />
                </div>

                {/* Gráfico principal */}
                <div style={s.chartCard}>
                  <div style={s.chartHeader}>
                    <div>
                      <h3 style={s.chartTitle}>Faturamento × Lucro por Dia</h3>
                      <p style={s.chartSub}>Evolução diária no período selecionado</p>
                    </div>
                    <div style={s.legendRow}>
                      <LegendDot color={AMBER} label="Bruto" />
                      <LegendDot color={GREEN} label="Lucro" />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={dados?.porDia || []} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                      <defs>
                        <linearGradient id="gBruto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AMBER} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={d => {
                        const parts = (d || '').split('-');
                        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                      }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0e1320', border: '1px solid #1e2535', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                        labelStyle={{ color: '#6b7a94', fontSize: 12, marginBottom: 4 }}
                        formatter={v => [fmt(v)]}
                        cursor={{ stroke: '#1e2535', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="bruto" name="Bruto" stroke={AMBER} fill="url(#gBruto)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="lucro" name="Lucro" stroke={GREEN} fill="url(#gLucro)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Row 2 */}
                <div style={s.twoCol}>
                  <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                      <div>
                        <h3 style={s.chartTitle}>Vendas por Tipo de Anúncio</h3>
                        <p style={s.chartSub}>Distribuição por categoria</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={dados?.porTipo || []} dataKey="pedidos" nameKey="tipo"
                          cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                          paddingAngle={3}
                        >
                          {(dados?.porTipo || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip
                          formatter={v => [v + ' pedidos']}
                          contentStyle={{ background: '#0e1320', border: '1px solid #1e2535', borderRadius: 10 }}
                          labelStyle={{ color: '#6b7a94', fontSize: 12 }}
                        />
                        <Legend
                          formatter={v => <span style={{ color: '#6b7a94', fontSize: 12 }}>{v}</span>}
                          iconSize={8} iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                      <div>
                        <h3 style={s.chartTitle}>Top 5 Produtos por Lucro</h3>
                        <p style={s.chartSub}>Melhores performers do período</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={(dados?.porProduto || []).slice(0, 5)} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="sku" tick={{ fill: '#6b7a94', fontSize: 11 }} width={72} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#0e1320', border: '1px solid #1e2535', borderRadius: 10 }}
                          formatter={v => [fmt(v)]}
                          cursor={{ fill: 'rgba(255,107,53,0.05)' }}
                        />
                        <Bar dataKey="lucro" name="Lucro" fill={GREEN} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA VENDAS ── */}
            {aba === 'vendas' && (
              <div style={s.content}>
                <div style={s.kpiGrid}>
                  <KpiCard label="Total de Pedidos" value={t.total_pedidos || 0} sub="No período" color={AMBER} icon="📋" />
                  <KpiCard label="Ticket Médio" value={fmt((t.total_bruto || 0) / Math.max(t.total_pedidos || 1, 1))} sub="Por pedido" color={BLUE} icon="🧾" />
                  <KpiCard label="Lucro por Pedido" value={fmt(lucroTotal / Math.max(t.total_pedidos || 1, 1))} sub="Média" color={lucroTotal >= 0 ? GREEN : RED} icon="💡" />
                  <KpiCard label="Margem Média" value={fmtPct(margemMedia)} sub="Sobre bruto" color={TEAL} icon="📊" />
                </div>

                <div style={s.chartCard}>
                  <div style={s.chartHeader}>
                    <div>
                      <h3 style={s.chartTitle}>Volume de Pedidos por Dia</h3>
                      <p style={s.chartSub}>Quantidade diária no período</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dados?.porDia || []} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={d => {
                        const parts = (d || '').split('-');
                        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                      }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#3a4a60', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0e1320', border: '1px solid #1e2535', borderRadius: 10 }}
                        formatter={v => [v + ' pedidos']}
                        cursor={{ fill: 'rgba(255,180,53,0.05)' }}
                      />
                      <Bar dataKey="pedidos" name="Pedidos" fill={AMBER} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={s.chartCard}>
                  <div style={s.chartHeader}>
                    <div>
                      <h3 style={s.chartTitle}>Receita × Lucro × Custo</h3>
                      <p style={s.chartSub}>Composição financeira diária</p>
                    </div>
                    <div style={s.legendRow}>
                      <LegendDot color={AMBER} label="Bruto" />
                      <LegendDot color={GREEN} label="Lucro" />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dados?.porDia || []} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={d => {
                        const parts = (d || '').split('-');
                        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                      }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#3a4a60', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0e1320', border: '1px solid #1e2535', borderRadius: 10 }}
                        formatter={v => [fmt(v)]}
                        cursor={{ stroke: '#1e2535', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="bruto" name="Bruto" stroke={AMBER} fill="none" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      <Area type="monotone" dataKey="lucro" name="Lucro" stroke={GREEN} fill="none" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── ABA PRODUTOS ── */}
            {aba === 'produtos' && (
              <div style={s.content}>
                <div style={s.chartCard}>
                  <div style={s.chartHeader}>
                    <div>
                      <h3 style={s.chartTitle}>Ranking de Produtos</h3>
                      <p style={s.chartSub}>{(dados?.porProduto || []).length} produtos no período</p>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {['#', 'SKU', 'Título', 'Vendas', 'Receita Bruta', 'Lucro', 'Margem'].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(dados?.porProduto || []).map((p, i) => {
                          const lucro = parseFloat(p.lucro || 0);
                          const bruto = parseFloat(p.bruto || 0);
                          const margem = bruto > 0 ? (lucro / bruto * 100) : 0;
                          return (
                            <tr key={p.sku} style={s.tr}>
                              <td style={{ ...s.td, color: '#3a4a60', fontWeight: 700 }}>{i + 1}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: AMBER, fontSize: 12 }}>{p.sku}</td>
                              <td style={{ ...s.td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#c0cce0' }}>{p.titulo}</td>
                              <td style={{ ...s.td, textAlign: 'right' }}>
                                <span style={s.badge}>{p.vendas}</span>
                              </td>
                              <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{fmt(p.bruto)}</td>
                              <td style={{ ...s.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", color: lucro >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(lucro)}</td>
                              <td style={{ ...s.td, textAlign: 'right' }}>
                                <MargemBar value={margem} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA PEDIDOS ── */}
            {aba === 'pedidos' && (
              <div style={s.content}>
                {/* Filtros */}
                <div style={s.filtroPedidosRow}>
                  <input
                    placeholder="Buscar por SKU..."
                    style={s.searchInput}
                    value={filtroPedidos.sku}
                    onChange={e => setFiltroPedidos(f => ({ ...f, sku: e.target.value }))}
                  />
                  <select
                    style={s.selectInput}
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
                  <span style={s.countTag}>{totalPedidos} pedidos</span>
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
                            <tr key={p.id} style={s.tr}>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#3a4a60' }}>{p.order_id}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", color: AMBER, fontSize: 12 }}>{p.item_sku}</td>
                              <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#c0cce0' }}>{p.item_title}</td>
                              <td style={s.td}><TypeBadge tipo={p.listing_type} /></td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>{fmt(p.valor_bruto)}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", textAlign: 'right', color: RED }}>{fmt(p.comissao)}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", textAlign: 'right', color: '#3a4a60' }}>{fmt(p.frete_aplicado_no_pedido)}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>{fmt(p.preco_custo)}</td>
                              <td style={{ ...s.td, fontFamily: "'DM Mono', monospace", textAlign: 'right', color: lucro >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(lucro)}</td>
                              <td style={{ ...s.td, color: lucro >= 0 ? GREEN : RED, fontSize: 12 }}>{p.margem_pct_bruto}</td>
                              <td style={{ ...s.td, fontSize: 11, color: '#3a4a60', whiteSpace: 'nowrap' }}>
                                {new Date(p.created_at).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Paginação */}
                  <div style={s.pagination}>
                    <button
                      style={pagina > 1 ? s.pageBtn : s.pageBtnDisabled}
                      disabled={pagina <= 1}
                      onClick={() => buscarPedidos(pagina - 1)}
                    >← Anterior</button>
                    <span style={s.pageInfo}>
                      Página <strong style={{ color: '#c0cce0' }}>{pagina}</strong> de <strong style={{ color: '#c0cce0' }}>{Math.ceil(totalPedidos / 50)}</strong>
                    </span>
                    <button
                      style={pagina * 50 < totalPedidos ? s.pageBtn : s.pageBtnDisabled}
                      disabled={pagina * 50 >= totalPedidos}
                      onClick={() => buscarPedidos(pagina + 1)}
                    >Próxima →</button>
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

// ── Sub-components ──

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.kpiCard}>
      <div style={s.kpiTop}>
        <span style={s.kpiIcon}>{icon}</span>
        <p style={s.kpiLabel}>{label}</p>
      </div>
      <p style={{ ...s.kpiValue, color }}>{value}</p>
      <p style={s.kpiSub}>{sub}</p>
      <div style={{ ...s.kpiBar, background: color + '22' }}>
        <div style={{ ...s.kpiBarFill, background: color }} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ color: '#4a5a74', fontSize: 12 }}>{label}</span>
    </div>
  );
}

function TypeBadge({ tipo }) {
  const colors = {
    Premium: { bg: '#1a1400', color: '#FFE000', border: '#2a2200' },
    Diamante: { bg: '#081420', color: '#60a5fa', border: '#0e2030' },
    Clássico: { bg: '#160e1a', color: '#c084fc', border: '#220e2a' },
    Ouro:     { bg: '#1a1200', color: '#fbbf24', border: '#2a1c00' },
    Prata:    { bg: '#101418', color: '#94a3b8', border: '#1e2530' },
  };
  const c = colors[tipo] || { bg: '#101418', color: '#6b7a94', border: '#1e2530' };
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
      whiteSpace: 'nowrap', letterSpacing: 0.3,
    }}>{tipo}</span>
  );
}

function MargemBar({ value }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = value >= 20 ? GREEN : value >= 10 ? AMBER : RED;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <span style={{ fontSize: 12, color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
        {value.toFixed(1)}%
      </span>
      <div style={{ width: 48, height: 4, background: '#1a2030', borderRadius: 2 }}>
        <div style={{ width: `${clamped}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ── Styles ──
const s = {
  root: {
    display: 'flex', minHeight: '100vh',
    background: '#080b12',
    fontFamily: "'DM Sans', 'Syne', sans-serif",
    color: '#8a9ab8',
  },

  // Sidebar
  sidebar: {
    width: 220, background: '#0a0e1a',
    borderRight: '1px solid #121826',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, overflow: 'hidden',
  },
  sidebarTop: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid #121826',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  logoIcon: {
    width: 40, height: 40, background: '#0e1320',
    border: '1px solid #1e2535', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoName: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: 18, color: '#e8eaf0', letterSpacing: -0.5,
  },
  logoOrange: { color: ORANGE },
  logoTagline: { color: '#2a3448', fontSize: 10, fontWeight: 600, letterSpacing: 1, marginTop: 1 },
  channelBadges: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  chBadge: {
    border: '1px solid', borderRadius: 20,
    padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
  },

  nav: { flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLabel: {
    color: '#1e2a3a', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    padding: '0 8px', marginBottom: 8,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'none', border: 'none',
    color: '#3a4a60', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    padding: '9px 12px', borderRadius: 8,
    cursor: 'pointer', textAlign: 'left',
    transition: 'color 0.15s',
    position: 'relative',
  },
  navActive: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,107,53,0.08)',
    border: 'none', color: '#FF6B35',
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
    padding: '9px 12px', borderRadius: 8,
    cursor: 'pointer', textAlign: 'left',
    position: 'relative',
  },
  navIconInactive: { color: '#2a3a50', flexShrink: 0 },
  navIconActive: { color: ORANGE, flexShrink: 0 },
  navDot: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: ORANGE,
  },
  logoutBtn: {
    background: 'none', border: 'none',
    color: '#2a3448', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', padding: '12px 20px',
    textAlign: 'left', display: 'flex', alignItems: 'center',
    borderTop: '1px solid #121826',
    transition: 'color 0.15s',
  },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 32px', borderBottom: '1px solid #121826',
    background: '#0a0e1a', flexWrap: 'wrap', gap: 16,
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  breadcrumbRoot: { color: '#2a3448', fontSize: 12, fontWeight: 500 },
  breadcrumbSep: { color: '#1e2535', fontSize: 12 },
  breadcrumbPage: { color: '#4a5a74', fontSize: 12, fontWeight: 500 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: '#e8eaf0', letterSpacing: -0.5 },

  filtros: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: 3 },
  dateLabel: { color: '#2a3448', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  dateInput: {
    background: '#0e1320', border: '1px solid #1e2535', borderRadius: 8,
    padding: '7px 12px', color: '#8a9ab8', fontSize: 13,
    fontFamily: "'DM Mono', monospace", outline: 'none',
  },
  dateSep: { color: '#1e2535', fontSize: 14, alignSelf: 'flex-end', paddingBottom: 8 },
  btnFiltrar: {
    background: 'linear-gradient(135deg, #FF6B35, #FF8C35)',
    border: 'none', borderRadius: 8, padding: '8px 18px',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
    color: '#fff', cursor: 'pointer', alignSelf: 'flex-end',
    boxShadow: '0 4px 16px rgba(255,107,53,0.25)',
  },

  content: {
    padding: '24px 32px', display: 'flex', flexDirection: 'column',
    gap: 20, overflowY: 'auto', flex: 1,
  },

  // KPI
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 },
  kpiCard: {
    background: '#0e1320', border: '1px solid #121826',
    borderRadius: 12, padding: '18px 16px',
    position: 'relative', overflow: 'hidden',
  },
  kpiTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  kpiIcon: { fontSize: 16 },
  kpiLabel: { margin: 0, color: '#3a4a60', fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' },
  kpiValue: { margin: '0 0 4px', fontSize: 20, fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: -0.5 },
  kpiSub: { margin: 0, color: '#2a3448', fontSize: 11 },
  kpiBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  kpiBarFill: { width: '60%', height: '100%' },

  // Charts
  chartCard: {
    background: '#0e1320', border: '1px solid #121826',
    borderRadius: 12, padding: '20px 24px',
  },
  chartHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitle: { margin: '0 0 4px', color: '#c0cce0', fontSize: 15, fontWeight: 700 },
  chartSub: { margin: 0, color: '#2a3448', fontSize: 12 },
  legendRow: { display: 'flex', gap: 16 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 12px',
    color: '#2a3a54', fontSize: 11, fontWeight: 600,
    letterSpacing: 0.8, textTransform: 'uppercase',
    borderBottom: '1px solid #121826', whiteSpace: 'nowrap',
  },
  td: { padding: '10px 12px', color: '#6b7a94', borderBottom: '1px solid #0e1420', whiteSpace: 'nowrap' },
  tr: { transition: 'background 0.1s' },
  badge: {
    background: '#121826', border: '1px solid #1e2a3a',
    borderRadius: 20, padding: '2px 10px', fontSize: 12, color: '#6b7a94', fontWeight: 600,
  },

  // Pedidos filters
  filtroPedidosRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  searchInput: {
    background: '#0e1320', border: '1px solid #1e2535', borderRadius: 8,
    padding: '9px 14px', color: '#8a9ab8', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: 'none', minWidth: 200,
  },
  selectInput: {
    background: '#0e1320', border: '1px solid #1e2535', borderRadius: 8,
    padding: '9px 14px', color: '#8a9ab8', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
  },
  countTag: {
    background: '#121826', border: '1px solid #1e2535',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, color: '#4a5a74', fontWeight: 600,
  },

  // Pagination
  pagination: { display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  pageBtn: {
    background: '#121826', border: '1px solid #1e2535',
    borderRadius: 8, padding: '7px 14px', fontSize: 13,
    color: '#8a9ab8', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
  },
  pageBtnDisabled: {
    background: 'transparent', border: '1px solid #0e1520',
    borderRadius: 8, padding: '7px 14px', fontSize: 13,
    color: '#1e2535', cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
  },
  pageInfo: { color: '#3a4a60', fontSize: 13 },

  // Loading
  loadingWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 400 },
  loadingBox: { textAlign: 'center' },
  spinner: {
    width: 32, height: 32, border: '3px solid #121826',
    borderTop: `3px solid ${ORANGE}`, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
  },
  loadingText: { color: '#2a3448', fontSize: 13, margin: 0 },
};
