-- Adicionar colunas para taxa e valor líquido
alter table public.withdraw_requests 
add column if not exists tax_amount numeric(14,2) default 0,
add column if not exists net_amount numeric(14,2) default 0;

-- Atualizar registros antigos (assumindo taxa 0 para o passado)
update public.withdraw_requests 
set net_amount = amount, tax_amount = 0 
where net_amount = 0;
