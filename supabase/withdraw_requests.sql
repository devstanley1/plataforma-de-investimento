-- Tabela de solicitações de saque
create table if not exists public.withdraw_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'BRL',
  pix_key text not null,
  pix_key_type text not null default 'CPF',
  document text not null,
  status text not null default 'PENDING', -- PENDING, APPROVED, REJECTED, PAID, FAILED
  admin_reason text,
  vizzion_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists withdraw_requests_set_updated_at on public.withdraw_requests;

create trigger withdraw_requests_set_updated_at
before update on public.withdraw_requests
for each row execute function public.set_updated_at();

create index if not exists idx_withdraw_requests_user_id on public.withdraw_requests(user_id);
create index if not exists idx_withdraw_requests_status on public.withdraw_requests(status);