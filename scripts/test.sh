#!/bin/bash

# Script para executar testes

echo "🧪 Executando testes..."

# Testes do backend
echo "📊 Executando testes do backend..."
cd backend
npm run test
BACKEND_TEST_EXIT_CODE=$?
cd ..

# Testes do frontend
echo "🎨 Executando testes do frontend..."
cd frontend
npm run test
FRONTEND_TEST_EXIT_CODE=$?
cd ..

# Verificar resultados
if [ $BACKEND_TEST_EXIT_CODE -eq 0 ] && [ $FRONTEND_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
    exit 0
else
    echo "❌ Alguns testes falharam!"
    exit 1
fi
