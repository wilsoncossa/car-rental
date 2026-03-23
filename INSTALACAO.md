# 🚀 Guia Rápido de Instalação - VSCode

## Passo 1: Pré-requisitos

### Instalar Node.js
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (20.x ou superior)
3. Instale seguindo o assistente
4. Verifique a instalação:
   ```bash
   node --version
   npm --version
   ```

### Instalar Yarn
```bash
npm install -g yarn
```

### Instalar PostgreSQL

#### Windows:
1. Baixe: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação:
   - Defina uma senha (anote-a!)
   - Porta padrão: 5432
   - Locale: Portuguese, Brazil
4. Após instalação, abra "SQL Shell (psql)"
5. Pressione Enter até pedir senha
6. Digite a senha que você definiu
7. Execute:
   ```sql
   CREATE DATABASE carrental;
   \q
   ```

#### macOS:
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Criar banco
createdb carrental
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres createdb carrental
```

## Passo 2: Configurar o Projeto

### 1. Descompactar o ZIP
```bash
unzip car-rental-system.zip
cd car-rental-system
```

### 2. Abrir no VSCode
```bash
code .
```
Ou abra o VSCode e vá em: **File → Open Folder** → Selecione a pasta

### 3. Instalar extensões recomendadas no VSCode

Pressione `Ctrl+Shift+X` (ou `Cmd+Shift+X` no macOS) e instale:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier - Code formatter**
- **PostgreSQL** (opcional, para gerenciar banco)

### 4. Instalar dependências
Abra o Terminal no VSCode (`Ctrl+` ou `Cmd+`) e execute:
```bash
yarn install
```
⏱️ Isso pode levar alguns minutos...

### 5. Configurar variáveis de ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Ou crie manualmente um arquivo `.env` na raiz com:
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/carrental
JWT_SECRET=uma-string-super-secreta-aleatoria-123456
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANTE:** 
- Troque `SUA_SENHA` pela senha do PostgreSQL que você definiu
- Troque `JWT_SECRET` por uma string aleatória (pode usar: `openssl rand -base64 32`)

### 6. Criar tabelas no banco
```bash
yarn db:push
```

Se der erro, verifique:
- PostgreSQL está rodando?
- Senha no `.env` está correta?
- Banco `carrental` foi criado?

## Passo 3: Rodar o Projeto

### Modo Desenvolvimento (com hot reload):
```bash
yarn dev
```

Aguarde até ver:
```
serving on port 5000
```

### Abrir no navegador:
Acesse: **http://localhost:5000**

## Passo 4: Criar Primeiro Usuário Admin

### Opção 1: Via Interface Web
1. Abra http://localhost:5000
2. Clique em "Registar" ou "Sign Up"
3. Preencha os dados
4. Após registro, você precisará ativar manualmente no banco

### Opção 2: Via API (recomendado)

Abra um novo terminal e execute:

```bash
# Registrar usuário
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carrental.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "Sistema",
    "contacto": "840000000"
  }'
```

Você receberá um **token**. Copie-o!

### Opção 3: Tornar usuário Admin via SQL

1. Abra SQL Shell (psql) ou pgAdmin
2. Conecte ao banco `carrental`
3. Execute:

```sql
-- Ver usuários
SELECT id, email, role, status FROM users;

-- Tornar admin e ativar
UPDATE users 
SET role = 'admin', status = 'active' 
WHERE email = 'admin@carrental.com';
```

## Passo 5: Testar a API

### Com cURL:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carrental.com",
    "password": "admin123"
  }'

# Copie o token da resposta

# Testar rota protegida
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Navegador:
1. Abra: http://localhost:5000
2. Faça login
3. Navegue pelas páginas

## 🎉 Pronto!

Seu sistema está rodando! Agora você pode:
- ✅ Registrar usuários
- ✅ Fazer login/logout
- ✅ Gerenciar carros (se for admin)
- ✅ Criar reservas
- ✅ Ver dashboard

## 🐛 Problemas Comuns

### "Cannot find module..."
```bash
rm -rf node_modules yarn.lock
yarn install
```

### "Port 5000 is already in use"
Mude no `.env`:
```env
PORT=3001
```

### PostgreSQL não inicia (Windows)
1. Pressione `Win+R`
2. Digite `services.msc`
3. Procure "postgresql-x64-16"
4. Clique direito → Iniciar

### PostgreSQL não inicia (macOS)
```bash
brew services restart postgresql@16
```

### PostgreSQL não inicia (Linux)
```bash
sudo systemctl restart postgresql
```

### "password authentication failed"
Verifique:
1. Senha no `.env` está correta?
2. Usuário é `postgres`?
3. Porta é `5432`?

### Erro "Cannot connect to database"
1. PostgreSQL está rodando?
   ```bash
   # Windows
   Abra Services e verifique "postgresql"
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Banco foi criado?
   ```bash
   psql -U postgres -l
   ```

## 📚 Próximos Passos

1. **Explorar o código**: Abra `/client/src/App.tsx` e `/server/routes.ts`
2. **Personalizar**: Mude cores no `tailwind.config.ts`
3. **Adicionar dados**: Use o Postman para criar carros via API
4. **Deploy**: Siga o README.md para deploy em produção

## 🆘 Precisa de Ajuda?

- Abra uma issue no GitHub
- Consulte o README.md principal
- Verifique os logs do terminal

---

**Boa sorte com seu projeto! 🚀**
