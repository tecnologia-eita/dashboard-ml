# 🚀 Guia de Deploy — Dashboard ML no EasyPanel

## Estrutura de Serviços no EasyPanel

Você vai criar 3 serviços:
1. **PostgreSQL** (banco de dados)
2. **dashboard-ml-api** (backend Node.js)
3. **dashboard-ml-frontend** (frontend React)

---

## PASSO 1 — PostgreSQL

No EasyPanel, vá em **"New Service" → "PostgreSQL"**:
- Nome: `postgres-ml`
- Clique em **Create**
- Anote a **connection string** que aparece (algo como `postgresql://postgres:SENHA@postgres-ml:5432/postgres`)

---

## PASSO 2 — Backend (API)

No EasyPanel, vá em **"New Service" → "App"**:

**General:**
- Nome: `dashboard-ml-api`
- Source: GitHub (conecte seu repositório) ou **Upload via ZIP**
- Build Path: `/backend`

**Domains:**
- Adicione: `api.autoeita.space`

**Environment Variables** (adicione todas):
```
DATABASE_URL=postgresql://postgres:SUASENHA@postgres-ml:5432/postgres
JWT_SECRET=coloque-uma-string-aleatoria-longa-aqui
WEBHOOK_SECRET=outra-chave-secreta-para-o-n8n
ADMIN_PASSWORD=SuaSenhaDeAcesso
NODE_ENV=production
PORT=3001
```

**Ports:**
- Container Port: `3001`

---

## PASSO 3 — Frontend

No EasyPanel, vá em **"New Service" → "App"**:

**General:**
- Nome: `dashboard-ml-frontend`
- Source: mesma pasta do repositório
- Build Path: `/frontend`

**Build Args:**
```
REACT_APP_API_URL=https://api.autoeita.space
```

**Domains:**
- Adicione: `dash.autoeita.space`

**Ports:**
- Container Port: `80`

---

## PASSO 4 — DNS (no seu registrador de domínio)

Adicione dois registros tipo **A** ou **CNAME** apontando para o IP da sua VPS:

| Subdomínio         | Tipo | Valor        |
|--------------------|------|--------------|
| `api.autoeita.space`  | A    | IP_DA_SUA_VPS |
| `dash.autoeita.space` | A    | IP_DA_SUA_VPS |

---

## PASSO 5 — Configurar o n8n

No final do seu fluxo n8n (após o nó "Code in JavaScript1"), adicione um nó **HTTP Request**:

- **Method:** POST
- **URL:** `https://api.autoeita.space/api/webhook/pedido`
- **Headers:**
  - `x-webhook-secret`: (o mesmo valor de WEBHOOK_SECRET)
  - `Content-Type`: application/json
- **Body:** `={{ $json }}` (envia o JSON completo do pedido calculado)

---

## PASSO 6 — Primeiro Acesso

Acesse: **https://dash.autoeita.space**

- Usuário: `admin`
- Senha: o valor que você colocou em `ADMIN_PASSWORD`

---

## 🔒 Segurança Recomendada

- Troque o `JWT_SECRET` por uma string aleatória longa (ex: use `openssl rand -hex 32` no terminal)
- Troque o `WEBHOOK_SECRET` por outra string aleatória
- Use sempre HTTPS (EasyPanel já provisiona SSL automaticamente via Let's Encrypt)

---

## 📁 Estrutura de Arquivos

```
dashboard-ml/
├── backend/
│   ├── server.js         ← API REST + webhook
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── Login.js
    │   └── Dashboard.js
    ├── public/
    │   └── index.html
    ├── package.json
    ├── Dockerfile
    └── nginx.conf
```
