-- Inserir Produtos Padrão (Baseados no HTML atual)
insert into public.investment_products (name, type, nominal_rate, min_investment, maturity_days, status, description) values
('Série Original - Temporada 1', 'fixed_income', 20.00, 70.00, 70, 'ACTIVE', 'Lucro diário fixo. Retorno total R$ 700,00.'),
('Filme Original - Lançamento', 'fixed_income', 20.00, 150.00, 50, 'ACTIVE', 'Alta demanda. Retorno total R$ 1.500,00.'),
('Série Original - Nova Temporada', 'fixed_income', 2.24, 890.00, 30, 'ACTIVE', 'Retorno diário R$ 20,00. Ciclo curto.'),
('Filme Original - Premiado', 'fixed_income', 2.20, 1450.00, 30, 'ACTIVE', 'Retorno diário R$ 32,00.'),
('Série Original - Top 10', 'fixed_income', 2.27, 1980.00, 30, 'ACTIVE', 'Retorno diário R$ 45,00.'),
('Filme Original - Blockbuster', 'fixed_income', 2.24, 2450.00, 30, 'ACTIVE', 'Retorno diário R$ 55,00.'),
('Série Original - Ultra HD', 'fixed_income', 2.18, 3200.00, 30, 'ACTIVE', 'Retorno diário R$ 70,00.'),
('Filme Original - Ação', 'fixed_income', 2.13, 3980.00, 30, 'ACTIVE', 'Retorno diário R$ 85,00.'),
('Série Original - Suspense', 'fixed_income', 2.21, 4750.00, 30, 'ACTIVE', 'Retorno diário R$ 105,00.'),
('Filme Original - Clássico', 'fixed_income', 2.15, 6500.00, 30, 'ACTIVE', 'Retorno diário R$ 140,00.')
on conflict do nothing;

-- Nota: As taxas nominais (nominal_rate) foram aproximadas baseadas no retorno diário / investimento inicial * 100
-- Ex: 14/70 = 20%. 20/890 = ~2.24%.
