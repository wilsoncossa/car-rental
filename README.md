# 🚗 Sistema de Aluguer de Carros (Car Rental)

Sistema completo de gestão de aluguer de carros com autenticação JWT, desenvolvido com React (frontend) e Node.js/Express (backend).

## 🎯 Funcionalidades

### 👤 Autenticação (JWT)
- ✅ Registro de utilizadores
- ✅ Login/Logout com JWT tokens
- ✅ Gestão de perfis
- ✅ Controle de acesso por roles (Admin, Funcionário, Cliente)

### 🚗 Gestão de Carros
- ✅ Catálogo de veículos
- ✅ Filtros por cidade, tipo e disponibilidade
- ✅ CRUD completo (Admin)
- ✅ Upload de imagens

### 📅 Reservas
- ✅ Sistema de reservas com datas
- ✅ Cálculo automático de preços
- ✅ Gestão de status (Pendente, Confirmado, Cancelado)
- ✅ Histórico de reservas

### 💰 Multas
- ✅ Registro de multas por reserva
- ✅ Controle de pagamentos

### 📊 Dashboard Admin
- ✅ Estatísticas de receita
- ✅ Gestão de utilizadores
- ✅ Aprovação de contas

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** (build tool)
- **TailwindCSS** (estilização)
- **Radix UI** (componentes)
- **React Query** (gestão de estado)
- **Wouter** (roteamento)

### Backend
- **Node.js** com Express 5
- **TypeScript**
- **PostgreSQL** (banco de dados)
- **Drizzle ORM**
- **JWT** (autenticação)
- **bcrypt** (hash de senhas)
- **Multer** (upload de arquivos)

## 📋 Pré-requisitos

- **Node.js** 20.x ou superior
- **PostgreSQL** 14.x ou superior
- **Yarn** (gerenciador de pacotes)

## 🚀 Instalação e Configuração

### 1. Clone o projeto
```bash
# Descompactar o arquivo ZIP
unzip car-rental-system.zip
cd car-rental-system
```

### 2. Instalar dependências
```bash
yarn install
```

### 3. Configurar PostgreSQL

#### No Windows:
1. Baixe e instale PostgreSQL: https://www.postgresql.org/download/windows/
2. Durante a instalação, defina uma senha para o usuário `postgres`
3. Abra o SQL Shell (psql) e crie o banco:

```sql
CREATE DATABASE carrental;
```

#### No macOS:
```bash
# Instalar PostgreSQL com Homebrew
brew install postgresql@16
brew services start postgresql@16

# Criar banco de dados
createdb carrental
```

#### No Linux (Ubuntu/Debian):
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres createdb carrental
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/carrental

# JWT
JWT_SECRET=seu-segredo-jwt-super-secreto-aqui-mude-isso

# Server
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Troque `sua_senha` pela senha do PostgreSQL e `JWT_SECRET` por uma string aleatória segura!

### 5. Criar tabelas no banco de dados
```bash
yarn db:push
```

### 6. Iniciar o projeto
```bash
# Modo desenvolvimento (hot reload)
yarn dev

# Ou em produção
yarn build
yarn start
```

O servidor estará rodando em: **http://localhost:5000**

## 📁 Estrutura do Projeto

```
car-rental-system/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   ├── pages/         # Páginas
│   │   ├── App.tsx        # App principal
│   │   └── main.tsx       # Entry point
│   └── public/            # Arquivos estáticos
│
├── server/                # Backend Express
│   ├── auth.ts           # Sistema de autenticação JWT
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   ├── db.ts             # Configuração do banco
│   └── index.ts          # Entry point
│
├── shared/               # Código compartilhado
│   ├── models/          # Models do banco
│   ├── routes.ts        # Definição de rotas
│   └── schema.ts        # Schema Drizzle
│
├── uploads/             # Imagens enviadas
├── package.json
├── tsconfig.json
└── .env                 # Variáveis de ambiente
```

## 🔐 API - Autenticação

### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva",
  "contacto": "84123456789"
}
```

**Resposta:**
```json
{
  "message": "Usuário registrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "role": "cliente",
    "status": "pending"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Obter dados do utilizador
```http
GET /api/auth/me
Authorization: Bearer {token}
```

## 📡 API - Principais Endpoints

### Carros
- `GET /api/cars/list` - Listar carros (com filtros)
- `GET /api/cars/:id` - Obter carro por ID
- `POST /api/cars` - Criar carro (Admin)
- `PATCH /api/cars/:id` - Atualizar carro (Admin)
- `DELETE /api/cars/:id` - Deletar carro (Admin)

### Reservas
- `GET /api/bookings/list` - Listar reservas
- `GET /api/bookings/:id` - Obter reserva por ID
- `POST /api/bookings` - Criar reserva
- `PATCH /api/bookings/:id/status` - Atualizar status (Admin/Funcionário)

### Utilizadores
- `GET /api/users/list` - Listar utilizadores (Admin)
- `GET /api/users/:id` - Obter utilizador
- `PATCH /api/users/:id` - Atualizar utilizador
- `PATCH /api/users/:id/profile` - Atualizar perfil próprio

### Multas
- `GET /api/fines/list` - Listar multas
- `POST /api/fines` - Criar multa (Admin/Funcionário)

### Estatísticas
- `GET /api/stats` - Obter estatísticas (Admin)

## 👥 Roles de Utilizadores

### Cliente (`cliente`)
- Ver carros disponíveis
- Criar reservas
- Ver suas próprias reservas e multas
- Atualizar seu perfil

### Funcionário (`funcionario`)
- Tudo do cliente +
- Ver todas as reservas
- Alterar status de reservas
- Criar multas
- Editar dados de clientes

### Admin (`admin`)
- Acesso total ao sistema
- Gestão de carros (CRUD)
- Gestão de utilizadores
- Aprovar/rejeitar contas
- Ver estatísticas

## 🧪 Testando a API

### Com cURL:
```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "Sistema"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "admin123"
  }'

# Listar carros (público)
curl http://localhost:5000/api/cars/list

# Obter dados do utilizador (autenticado)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Postman ou Insomnia:
1. Importe a coleção de endpoints
2. Configure a variável `{{baseUrl}}` = `http://localhost:5000`
3. Após login, salve o token em uma variável `{{token}}`
4. Use `Authorization: Bearer {{token}}` nas requisições protegidas

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Tokens JWT com expiração (7 dias)
- ✅ Validação de inputs com Zod
- ✅ Proteção contra SQL injection (Drizzle ORM)
- ✅ CORS configurado
- ✅ Rate limiting (recomendado adicionar em produção)

## 🐛 Troubleshooting

### Erro: "DATABASE_URL must be set"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que a variável `DATABASE_URL` está configurada corretamente

### Erro: "connect ECONNREFUSED"
- PostgreSQL não está rodando. Inicie o serviço:
  - Windows: Abra "Services" e inicie "postgresql-x64-XX"
  - macOS: `brew services start postgresql@16`
  - Linux: `sudo systemctl start postgresql`

### Erro: "password authentication failed"
- Senha incorreta no `DATABASE_URL`
- Verifique a senha do usuário postgres

### Erro: "Port 5000 is already in use"
- Porta 5000 está ocupada. Mude no `.env`:
  ```env
  PORT=3001
  ```

### Problemas com Yarn
```bash
# Limpar cache e reinstalar
rm -rf node_modules yarn.lock
yarn install
```

## 📦 Build para Produção

```bash
# Gerar build otimizado
yarn build

# Rodar em produção
NODE_ENV=production yarn start
```

O build irá gerar:
- `/dist/` - Código do servidor otimizado
- `/dist/public/` - Assets do frontend minificados

## 🌐 Deploy

### Opções de Deploy:
- **Heroku** (com Heroku Postgres)
- **Railway** (recomendado - setup fácil)
- **DigitalOcean App Platform**
- **AWS EC2** + RDS
- **Vercel** (frontend) + Railway (backend)

### Variáveis de Ambiente em Produção:
```env
DATABASE_URL=postgresql://...  # URL do banco em produção
JWT_SECRET=...                  # String aleatória segura
NODE_ENV=production
PORT=5000
```

## 📄 Licença

MIT License - Sinta-se livre para usar em projetos pessoais e comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Email: suporte@carrental.com

---

**Desenvolvido com ❤️ usando React + Node.js + PostgreSQL**
