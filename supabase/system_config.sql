-- Tabela de Configurações do Sistema (Taxas, Limites, etc)
create table if not exists public.system_config (
  key text primary key,
  value text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS (apenas admin pode alterar)
alter table public.system_config enable row level security;

-- Política de leitura pública (para o frontend saber taxas)
create policy "Config is readable by anyone"
  on public.system_config for select
  using (true);

-- Política de escrita apenas para admin (verificação via app level ou trigger se tiver role)
-- Por enquanto, permissiva para facilitar o desenvolvimento do admin panel
create policy "Config is updatable by everyone" 
  on public.system_config for all
  using (true)
  with check (true);

-- Inserir valores padrão se não existirem
insert into public.system_config (key, value, description) values
('withdraw_tax_percent', '5', 'Porcentagem descontada no saque'),
('min_withdraw_amount', '10.00', 'Valor mínimo para saque'),
('welcome_bonus', '0.00', 'Bônus de boas-vindas'),
('pix_gateway_url', 'https://app.vizzionpay.com/api/v1', 'URL base do gateway de pagamento')
on conflict (key) do nothing;
