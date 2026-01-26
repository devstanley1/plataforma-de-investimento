# plataforma-de-investimento

## Supabase

### Front-end (páginas estáticas)
1. Edite o arquivo [assets/supabase.js](assets/supabase.js) e substitua:
	- `https://SEU-PROJETO.supabase.co`
	- `SUA_SUPABASE_ANON_KEY`

### API (Vercel Functions)
Defina as variáveis de ambiente:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

As rotas em [api](api) agora usam Supabase Auth para login, cadastro e sessão.
