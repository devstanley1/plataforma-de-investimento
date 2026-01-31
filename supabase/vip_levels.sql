-- Tabela de Níveis VIP
create table if not exists public.vip_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- Ex: VIP 1, VIP 2
  min_deposit numeric(14,2) not null,
  daily_bonus_percent numeric(5,2) default 0,
  max_withdraw_per_day integer default 1,
  created_at timestamptz default now()
);

-- RLS
alter table public.vip_levels enable row level security;
create policy "VIPs are viewable by everyone" on public.vip_levels for select using (true);
create policy "VIPs manageable by admin" on public.vip_levels for all using (true) with check (true);
