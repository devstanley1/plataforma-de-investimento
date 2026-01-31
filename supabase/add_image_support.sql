-- Adicionar coluna de imagem
alter table public.investment_products
add column if not exists image_url text;
-- Criar bucket de storage 'products' (Requer permissão de admin)
-- Nota: Criação de bucket via SQL nem sempre funciona dependendo da config do Supabase.
-- Se falhar, o usuário deve criar manualmente pelo painel: Storage -> New Bucket -> 'products' (Public).
insert into storage.buckets (id, name, public)
values ('products', 'products', true) on conflict (id) do nothing;
-- Políticas de Storage (Simplificadas para permitir tudo a usuários autenticados por enquanto)
create policy "Public Access" on storage.objects for
select using (bucket_id = 'products');
create policy "Auth Users Upload" on storage.objects for
insert with check (
        bucket_id = 'products'
        and auth.role() = 'authenticated'
    );
create policy "Auth Users Update" on storage.objects for
update using (
        bucket_id = 'products'
        and auth.role() = 'authenticated'
    );