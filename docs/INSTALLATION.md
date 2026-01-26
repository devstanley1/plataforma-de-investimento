# Guia de Instalação e Configuração

## ✅ Pré-requisitos
- Conta no Supabase
- Node.js 18+ (para as funções em api/)

## 🔧 Configuração do Supabase
1. Crie um projeto no Supabase.
2. Copie as credenciais do projeto:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`

## 🌐 Front-end (páginas estáticas)
Edite [assets/supabase.js](../assets/supabase.js) e substitua os placeholders:
- `https://SEU-PROJETO.supabase.co`
- `SUA_SUPABASE_ANON_KEY`

## ⚡ API (Vercel Functions)
Configure as variáveis de ambiente no ambiente de deploy:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

As rotas em [api](../api) usam Supabase Auth para login, cadastro e sessão.

## ℹ️ Observações
- O backend legado foi removido.
- Autenticação e banco de dados são geridos pelo Supabase.
