#!/bin/bash

# Script para configurar o ambiente de desenvolvimento

echo "🚀 Configurando ambiente de desenvolvimento..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivos de ambiente se não existirem
if [ ! -f backend/.env ]; then
    echo "📝 Criando arquivo .env para o backend..."
    cp backend/env.example backend/.env
    echo "⚠️  Configure as variáveis de ambiente no arquivo backend/.env"
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Criando arquivo .env.local para o frontend..."
    cp frontend/env.example frontend/.env.local
    echo "⚠️  Configure as variáveis de ambiente no arquivo frontend/.env.local"
fi

# Instalar dependências
echo "📦 Instalando dependências do backend..."
cd backend && npm install && cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend && npm install && cd ..

# Iniciar serviços com Docker Compose
echo "🐳 Iniciando serviços com Docker Compose..."
docker-compose up -d postgres redis

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando o banco de dados estar pronto..."
sleep 10

# Executar migrações
echo "🗄️ Executando migrações do banco de dados..."
cd backend && npm run prisma:migrate && cd ..

# Executar seed
echo "🌱 Populando banco com dados iniciais..."
cd backend && npm run prisma:seed && cd ..

echo "✅ Ambiente configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente nos arquivos .env"
echo "2. Execute 'npm run dev' para iniciar o desenvolvimento"
echo "3. Acesse http://localhost:3000 para o frontend"
echo "4. Acesse http://localhost:3001/api/docs para a documentação da API"
echo ""
echo "🔑 Credenciais padrão:"
echo "Email: admin@example.com"
echo "Senha: password123"
