require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || 'troque-essa-chave-secreta';

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      pack_id BIGINT,
      order_id BIGINT,
      item_title TEXT,
      item_sku TEXT,
      listing_type TEXT,
      valor_bruto NUMERIC(10,2),
      comissao NUMERIC(10,2),
      comissao_pct TEXT,
      frete_custo_real NUMERIC(10,2),
      frete_aplicado_no_pedido NUMERIC(10,2),
      desconto_comprador NUMERIC(10,2),
      liquido_estimado NUMERIC(10,2),
      preco_custo NUMERIC(10,2),
      lucro NUMERIC(10,2),
      margem_pct_liquido TEXT,
      margem_pct_bruto TEXT,
      is_kit BOOLEAN DEFAULT false,
      total_imposto NUMERIC(10,2),
      total_impulsionamento NUMERIC(10,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const admin = await pool.query("SELECT id FROM users WHERE username = 'admin'");
  if (admin.rows.length === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await pool.query("INSERT INTO users (username, password_hash) VALUES ('admin', $1)", [hash]);
    console.log('✅ Usuário admin criado. Senha:', process.env.ADMIN_PASSWORD || 'admin123');
  }

  console.log('✅ Banco de dados inicializado');
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

app.post('/api/webhook/pedido', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const d = req.body; console.log('WEBHOOK:', JSON.stringify(d).substring(0,1000));

    // Converte "R$ 343,55" ou número para float
    const parseVal = v => {
      if (typeof v === 'number') return v;
      if (!v) return 0;
      return parseFloat(String(v).replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    };

    const itens = d.itens ?? [d];

    for (const item of itens) {
      const valor_bruto = parseVal(item.valor_bruto ?? item.valor_bruto_fmt);
      const comissao    = parseVal(item.comissao ?? item.comissao_fmt);
      const frete       = parseVal(item.frete_aplicado_no_pedido ?? item.frete_fmt);
      const liquido     = parseVal(item.liquido_estimado ?? item.liquido_fmt);
      const custo       = parseVal(item.preco_custo ?? item.custo_fmt);
      const lucro       = parseVal(item.lucro ?? item.lucro_fmt);

      const totalLiquido        = parseVal(d.total_lucro ?? liquido);
      const totalBruto          = parseVal(d.total_bruto ?? valor_bruto);
      const totalImposto        = totalLiquido * 0.14;
      const totalImpulsionamento = totalBruto  * 0.10;

      await pool.query(`
        INSERT INTO pedidos (
          pack_id, order_id, item_title, item_sku, listing_type,
          valor_bruto, comissao, comissao_pct, frete_custo_real,
          frete_aplicado_no_pedido, desconto_comprador, liquido_estimado,
          preco_custo, lucro, margem_pct_liquido, margem_pct_bruto,
          is_kit, total_imposto, total_impulsionamento
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      `, [
        d.pack_id ?? item.order_id,
        item.order_id,
        item.item_title ?? item.title,
        item.item_sku ?? item.sku,
        item.listing_type ?? d.listing_type,
        valor_bruto,
        comissao,
        item.comissao_pct,
        parseVal(item.frete_custo_real),
        frete,
        parseVal(item.desconto_comprador),
        liquido,
        custo,
        lucro,
        item.margem_pct_liquido,
        item.margem_pct_bruto,
        item.is_kit ?? false,
        totalImposto / (itens.length || 1),
        totalImpulsionamento / (itens.length || 1)
      ]);
    }

    res.json({ ok: true, inserted: itens.length });
  } catch (err) {
    console.error('Erro webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resumo', authMiddleware, async (req, res) => {
  const { inicio, fim } = req.query;
  const where = inicio && fim ? `WHERE created_at BETWEEN $1 AND $2` : '';
  const params = inicio && fim ? [inicio, fim] : [];

  const [totais, porDia, porProduto, porTipo, recentes] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) AS total_pedidos,
        COALESCE(SUM(valor_bruto),0) AS total_bruto,
        COALESCE(SUM(comissao),0) AS total_comissao,
        COALESCE(SUM(frete_aplicado_no_pedido),0) AS total_frete,
        COALESCE(SUM(preco_custo),0) AS total_custo,
        COALESCE(SUM(total_imposto),0) AS total_imposto,
        COALESCE(SUM(total_impulsionamento),0) AS total_impulsionamento,
        COALESCE(SUM(liquido_estimado),0) AS total_liquido,
        COALESCE(SUM(lucro),0) AS total_lucro,
        COALESCE(AVG(REPLACE(REPLACE(margem_pct_bruto,'%',''),',','.')::NUMERIC),0) AS margem_media
      FROM pedidos ${where}
    `, params),

    pool.query(`
      SELECT
        DATE(created_at) AS dia,
        COALESCE(SUM(valor_bruto),0) AS bruto,
        COALESCE(SUM(lucro),0) AS lucro,
        COUNT(*) AS pedidos
      FROM pedidos ${where}
      GROUP BY dia ORDER BY dia DESC LIMIT 30
    `, params),

    pool.query(`
      SELECT
        item_sku AS sku,
        item_title AS titulo,
        COUNT(*) AS vendas,
        COALESCE(SUM(valor_bruto),0) AS bruto,
        COALESCE(SUM(lucro),0) AS lucro
      FROM pedidos ${where}
      GROUP BY item_sku, item_title
      ORDER BY lucro DESC LIMIT 10
    `, params),

    pool.query(`
      SELECT
        listing_type AS tipo,
        COUNT(*) AS pedidos,
        COALESCE(SUM(lucro),0) AS lucro
      FROM pedidos ${where}
      GROUP BY listing_type
    `, params),

    pool.query(`
      SELECT * FROM pedidos ${where}
      ORDER BY created_at DESC LIMIT 50
    `, params)
  ]);

  res.json({
    totais: totais.rows[0],
    porDia: porDia.rows.reverse(),
    porProduto: porProduto.rows,
    porTipo: porTipo.rows,
    recentes: recentes.rows
  });
});

app.get('/api/pedidos', authMiddleware, async (req, res) => {
  const { inicio, fim, sku, tipo, pagina = 1 } = req.query;
  const conditions = [];
  const params = [];

  if (inicio && fim) { params.push(inicio, fim); conditions.push(`created_at BETWEEN $${params.length-1} AND $${params.length}`); }
  if (sku) { params.push(`%${sku}%`); conditions.push(`item_sku ILIKE $${params.length}`); }
  if (tipo) { params.push(tipo); conditions.push(`listing_type = $${params.length}`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (parseInt(pagina) - 1) * 50;
  params.push(offset);

  const [rows, count] = await Promise.all([
    pool.query(`SELECT * FROM pedidos ${where} ORDER BY created_at DESC LIMIT 50 OFFSET $${params.length}`, params),
    pool.query(`SELECT COUNT(*) FROM pedidos ${where}`, params.slice(0, -1))
  ]);

  res.json({ pedidos: rows.rows, total: parseInt(count.rows[0].count), pagina: parseInt(pagina) });
});

initDB().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
});
