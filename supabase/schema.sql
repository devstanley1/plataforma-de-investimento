-- Schema base para Supabase
-- Executar no SQL Editor do Supabase

-- Extensões
create extension if not exists "pgcrypto";

-- Função de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Perfis (relacionado ao auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  phone text,
  is_email_verified boolean default false,
  kyc_status text default 'PENDING',
  referral_code_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists profiles_name_unique on public.profiles (lower(name));

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Carteiras
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  balance numeric(14,2) not null default 0,
  currency text not null default 'BRL',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists wallets_set_updated_at on public.wallets;

create trigger wallets_set_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

-- Produtos de investimento
create table if not exists public.investment_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text,
  nominal_rate numeric(8,4) not null,
  currency text not null default 'BRL',
  min_investment numeric(14,2) not null default 0,
  maturity_days integer not null,
  status text not null default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists investment_products_set_updated_at on public.investment_products;

create trigger investment_products_set_updated_at
before update on public.investment_products
for each row execute function public.set_updated_at();

-- Investimentos
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.investment_products(id),
  amount numeric(14,2) not null,
  earned_amount numeric(14,2) not null default 0,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists investments_set_updated_at on public.investments;

create trigger investments_set_updated_at
before update on public.investments
for each row execute function public.set_updated_at();

-- Transações
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount numeric(14,2) not null,
  currency text not null default 'BRL',
  status text not null default 'PENDING',
  ghostpay_reference text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists transactions_set_updated_at on public.transactions;

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- Referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  uses_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists referrals_set_updated_at on public.referrals;

create trigger referrals_set_updated_at
before update on public.referrals
for each row execute function public.set_updated_at();

alter table public.profiles
  drop constraint if exists profiles_referral_code_fk;

alter table public.profiles
  add constraint profiles_referral_code_fk
  foreign key (referral_code_id) references public.referrals(id);

-- Comissões de referral
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'BRL',
  status text not null default 'PENDING',
  gateway_reference text,
  payment_method text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists payments_set_updated_at on public.payments;

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- Comissões de referral
create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  percent numeric(6,4) not null,
  deposit_id uuid references public.payments(id),
  status text not null default 'PENDING',
  created_at timestamptz default now(),
  settled_at timestamptz
);

-- Webhooks
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload_json jsonb not null,
  received_at timestamptz default now(),
  processed_at timestamptz,
  status text not null default 'PENDING'
);

-- RLS
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.investments enable row level security;
alter table public.transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.payments enable row level security;

-- Políticas básicas
drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;
drop policy if exists "Wallets are readable by owner" on public.wallets;
drop policy if exists "Wallets are updatable by owner" on public.wallets;
drop policy if exists "Investments are readable by owner" on public.investments;
drop policy if exists "Investments are insertable by owner" on public.investments;
drop policy if exists "Investments are updatable by owner" on public.investments;
drop policy if exists "Transactions are readable by owner" on public.transactions;
drop policy if exists "Transactions are insertable by owner" on public.transactions;
drop policy if exists "Referrals are readable by anyone" on public.referrals;
drop policy if exists "Referrals are manageable by owner" on public.referrals;
drop policy if exists "Referral commissions are readable by owner" on public.referral_commissions;
drop policy if exists "Payments are readable by owner" on public.payments;
drop policy if exists "Payments are insertable by owner" on public.payments;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Wallets are readable by owner"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "Wallets are updatable by owner"
  on public.wallets for update
  using (auth.uid() = user_id);

create policy "Investments are readable by owner"
  on public.investments for select
  using (auth.uid() = user_id);

create policy "Investments are insertable by owner"
  on public.investments for insert
  with check (auth.uid() = user_id);

create policy "Investments are updatable by owner"
  on public.investments for update
  using (auth.uid() = user_id);

create policy "Transactions are readable by owner"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Transactions are insertable by owner"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Referrals are readable by anyone"
  on public.referrals for select
  using (true);

create policy "Referrals are manageable by owner"
  on public.referrals for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Referral commissions are readable by owner"
  on public.referral_commissions for select
  using (auth.uid() = referred_user_id);

create policy "Payments are readable by owner"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Payments are insertable by owner"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Produtos públicos (sem RLS)
alter table public.investment_products disable row level security;

-- Trigger para criar profile e wallet ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, name, is_email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', null),
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Índices recomendados
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_investments_user_id on public.investments(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_referral_commissions_user_id on public.referral_commissions(referred_user_id);
create index if not exists idx_webhooks_event_type on public.webhooks(event_type);
create index if not exists idx_webhooks_received_at on public.webhooks(received_at);
