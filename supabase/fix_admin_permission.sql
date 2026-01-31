# Solução para Erro 403 - Acesso Negado
O erro 403 indica que você está logado,
mas seu usuário não tem a permissão de administrador no banco de dados.## Como Corrigir
Execute este comando SQL no * * SQL Editor * * do Supabase: ```sql
-- Substitua 'SEU_EMAIL@EXEMPLO.COM' pelo email que você usa para fazer login no admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'SEU_EMAIL@EXEMPLO.COM';
``` * * Exemplo: * * ```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@netflix.com';
``` ## Verificar se Funcionou
Depois de executar o comando,
faça logout e login novamente no painel admin.## Alternativa: Verificar Todos os Usuários
Para ver todos os usuários e quem é admin: ```sql
SELECT id, email, is_admin 
FROM profiles 
ORDER BY created_at DESC;
``` Isso mostrará uma lista de todos os usuários.Encontre o seu email e veja se `is_admin` está como `true`.