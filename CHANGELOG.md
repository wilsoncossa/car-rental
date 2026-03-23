# 📋 Changelog - Sistema de Aluguer de Carros

## [1.0.0] - 2025-03-11

### ✨ Adicionado
- Sistema completo de autenticação JWT
  - Registro de usuários (`POST /api/auth/register`)
  - Login com JWT (`POST /api/auth/login`)
  - Logout (`POST /api/auth/logout`)
  - Obter dados do usuário (`GET /api/auth/me`)
- Hash de senhas com bcrypt (10 rounds)
- Tokens JWT com expiração de 7 dias
- Middleware `isAuthenticated` baseado em JWT
- Campo `passwordHash` adicionado ao schema de usuários
- Campo `email` agora é obrigatório (`notNull()`)
- Métodos `getUserByEmail()` e `createUser()` no storage
- Documentação completa em português
- Guia de instalação para VSCode (`INSTALACAO.md`)
- Arquivo `.env.example` com configurações
- Configurações do VSCode (`.vscode/settings.json`)
- Extensões recomendadas do VSCode

### 🔧 Modificado
- Substituído sistema de autenticação Replit OAuth por JWT
- Atualizado `package.json` com novos scripts úteis
- Nome do projeto alterado para `car-rental-system`
- Atualizado `.gitignore` para incluir `.env` e arquivos sensíveis
- Rotas de autenticação agora usam JWT em vez de sessões
- Middleware `requireRole()` adaptado para JWT

### 🗑️ Removido
- Pasta `/server/replit_integrations/` completamente removida
- Dependências do Replit OAuth:
  - `openid-client` (removido do código, mantido no package.json para compatibilidade)
  - `passport` (removido do código)
  - Sessões baseadas em cookies
- Arquivo `.replit` removido
- Integração `javascript_log_in_with_replit` removida

### 🔐 Segurança
- Senhas agora são hasheadas com bcrypt
- Tokens JWT assinados com secret key
- Validação de inputs com Zod
- Proteção contra SQL injection (Drizzle ORM)
- Headers de autorização com Bearer token

### 📦 Dependências Adicionadas
- `bcrypt@^6.0.0` - Hash de senhas
- `jsonwebtoken@^9.0.3` - Geração e validação de JWT
- `@types/bcrypt@^6.0.0` - Types para TypeScript
- `@types/jsonwebtoken@^9.0.10` - Types para TypeScript

### 📚 Documentação
- README.md completo em português
- Guia de instalação detalhado (INSTALACAO.md)
- Instruções de troubleshooting
- Exemplos de uso da API com cURL
- Guia de configuração do PostgreSQL
- Instruções de deploy

### 🎯 Compatibilidade
- Node.js 20.x ou superior
- PostgreSQL 14.x ou superior
- Funciona em Windows, macOS e Linux
- Compatível com VSCode

### ⚠️ Breaking Changes
- **IMPORTANTE**: Sistema de autenticação completamente diferente
- Frontend precisa ser atualizado para usar novas rotas de auth
- Tokens devem ser enviados via header `Authorization: Bearer <token>`
- Rotas antigas do Replit (`/api/login`, `/api/callback`) não existem mais
- Schema do banco alterado: campo `passwordHash` adicionado
- Necessário executar `yarn db:push` para atualizar banco

### 🔄 Migração da Versão Anterior
Se você tinha a versão com Replit Auth:

1. **Backup do banco de dados**:
   ```bash
   pg_dump carrental > backup.sql
   ```

2. **Atualizar schema**:
   ```bash
   yarn db:push
   ```

3. **Usuários existentes**: Precisarão redefinir senhas pois o campo `passwordHash` é novo

4. **Frontend**: Atualizar para usar novas rotas de autenticação

### 📝 Notas de Desenvolvimento
- Projeto agora é totalmente standalone (não depende do Replit)
- Pode ser rodado localmente no VSCode
- Suporta hot reload em desenvolvimento
- Build otimizado para produção

### 🐛 Correções
- Removida dependência de ambiente Replit
- Corrigidas importações de autenticação
- Ajustados tipos TypeScript

---

## Roadmap Futuro

### [1.1.0] - Planejado
- [ ] Refresh tokens
- [ ] Recuperação de senha via email
- [ ] Verificação de email
- [ ] Rate limiting
- [ ] Logs de auditoria
- [ ] Autenticação de dois fatores (2FA)

### [1.2.0] - Planejado
- [ ] API de notificações
- [ ] Sistema de avaliações
- [ ] Chat de suporte
- [ ] Integração com pagamentos online
- [ ] Dashboard de analytics

---

**Desenvolvido com ❤️ para a comunidade**
