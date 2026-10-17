-- Panel "Her şeyi imha et" işlevi: public şemadaki TÜM tabloların içini boşaltır (tablolar/yapı kalır).
-- Yalnızca service_role çağırabilir; panel tarafında tam yetki + "imha et" onayı gerekir.
create or replace function public.imha_verileri()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('truncate table public.%I restart identity cascade', r.relname);
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.imha_verileri() from public, anon, authenticated;
grant execute on function public.imha_verileri() to service_role;
