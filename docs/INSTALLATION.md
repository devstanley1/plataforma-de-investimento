# Guia de Instalação e Configuração

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- Docker e Docker Compose (opcional)
- Git

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
git clone <repository-url>
cd projeto-7
```

### 2. Execute o script de configuração
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configure as variáveis de ambiente

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/investment_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
GHOSTPAY_API_KEY="your-ghostpay-api-key"
GHOSTPAY_API_SECRET="your-ghostpay-api-secret"
GHOSTPAY_WEBHOOK_SECRET="your-ghostpay-webhook-secret"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Inicie o desenvolvimento
```bash
npm run dev
```

## 🐳 Usando Docker

### Iniciar todos os serviços
```bash
docker-compose up -d
```

### Parar serviços
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

## 🗄️ Banco de Dados

### Migrações
```bash
cd backend
npm run prisma:migrate
```

### Seed (dados iniciais)
```bash
cd backend
npm run prisma:seed
```

### Prisma Studio
```bash
cd backend
npm run prisma:studio
```

## 🧪 Testes

### Executar todos os testes
```bash
./scripts/test.sh
```

### Testes do backend
```bash
cd backend
npm run test
```

### Testes do frontend
```bash
cd frontend
npm run test
```

## 📊 Monitoramento

### Logs do backend
```bash
cd backend
npm run start:dev
```

### Logs do frontend
```bash
cd frontend
npm run dev
```

## 🔧 Comandos Úteis

### Backend
```bash
cd backend
npm run build          # Build para produção
npm run start:prod     # Iniciar em produção
npm run lint           # Linter
npm run format         # Formatar código
```

### Frontend
```bash
cd frontend
npm run build          # Build para produção
npm run start          # Iniciar em produção
npm run lint           # Linter
npm run type-check     # Verificar tipos
```

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Documentação API:** http://localhost:3001/api/docs
- **Prisma Studio:** http://localhost:5555

## 🔑 Credenciais Padrão

- **Email:** admin@example.com
- **Senha:** password123

## 📱 Funcionalidades Implementadas

### ✅ Autenticação
- Login/Registro com JWT
- Recuperação de senha
- Refresh tokens
- Middleware de autenticação

### ✅ Usuários
- Perfil do usuário
- Verificação KYC básica
- Carteira digital
- Histórico de transações

### ✅ Produtos de Investimento
- CDB, LCI, LCA
- Tesouro Direto (Selic, IPCA+, Prefixado)
- Cálculo de rendimento
- Simulação de investimentos

### ✅ Sistema de Investimentos
- Criação de investimentos
- Carteira de investimentos
- Histórico de investimentos
- Processamento de vencimentos

### ✅ Sistema de Referrals
- Criação de códigos de convite
- Comissões automáticas
- Estatísticas de referrals
- Gestão de comissões

### ✅ Pagamentos (Ghostpay)
- Depósitos via PIX/Cartão
- Saques para conta bancária
- Webhooks de confirmação
- Histórico de transações

### ✅ Painel Administrativo
- Dashboard com estatísticas
- Gestão de usuários
- Gestão de produtos
- Logs de webhooks

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- JWT com expiração curta
- Rate limiting
- Validação de entrada
- CORS configurado
- Headers de segurança

## 📈 Performance

- Cache de produtos
- Paginação de resultados
- Lazy loading
- Otimização de imagens
- Compressão gzip

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente de produção
2. Execute `npm run build` em ambos os projetos
3. Configure servidor web (Nginx)
4. Configure SSL/TLS
5. Configure backup do banco de dados

### Variáveis de Ambiente de Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=super-secret-production-key
GHOSTPAY_API_KEY=production-api-key
GHOSTPAY_API_SECRET=production-api-secret
```

## 🆘 Solução de Problemas

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U postgres -d investment_platform
```

### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de migração
```bash
# Reset do banco (CUIDADO: apaga todos os dados)
cd backend
npx prisma migrate reset
npm run prisma:seed
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Consulte a documentação da API
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento
