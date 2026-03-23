# 🚀 Quick Start Guide

## Pré-requisitos
- Node.js 20+ instalado
- PostgreSQL 14+ instalado e rodando
- Yarn instalado globalmente: `npm install -g yarn`

## 5 Passos para Começar

### 1️⃣ Descompactar e entrar na pasta
```bash
unzip car-rental-system.zip
cd car-rental-system
```

### 2️⃣ Instalar dependências
```bash
yarn install
```
⏱️ Isso pode levar 2-3 minutos...

### 3️⃣ Criar banco de dados PostgreSQL
```bash
# Windows (SQL Shell - psql)
CREATE DATABASE carrental;

# macOS/Linux
createdb carrental
```

### 4️⃣ Configurar .env
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/carrental
JWT_SECRET=uma-string-super-secreta-123456
PORT=5000
NODE_ENV=development
```

### 5️⃣ Criar tabelas e iniciar
```bash
# Criar tabelas
yarn db:push

# Iniciar servidor
yarn dev
```

## ✅ Pronto!

Abra no navegador: **http://localhost:5000**

---

## Primeiro Login

### Criar usuário Admin via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carrental.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "Sistema"
  }'
```

### Tornar Admin via SQL:
```sql
-- Conectar ao banco
psql -U postgres -d carrental

-- Atualizar role e status
UPDATE users 
SET role = 'admin', status = 'active' 
WHERE email = 'admin@carrental.com';
```

### Fazer Login:
1. Abra http://localhost:5000
2. Clique em "Login"
3. Use: `admin@carrental.com` / `admin123`

---

## 🆘 Problemas?

### PostgreSQL não está rodando?
```bash
# Windows: Services → postgresql → Start
# macOS:
brew services start postgresql@16
# Linux:
sudo systemctl start postgresql
```

### Porta 5000 ocupada?
Mude no `.env`: `PORT=3001`

### Erro "Cannot find module"?
```bash
rm -rf node_modules yarn.lock
yarn install
```

---

## 📚 Documentação Completa

- **README.md** - Documentação completa
- **INSTALACAO.md** - Guia detalhado de instalação
- **CHANGELOG.md** - Histórico de mudanças

---

**Boa sorte! 🚀**
