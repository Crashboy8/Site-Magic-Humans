-- Ma Cible : lecture du quota sans l'incrémenter, et reprise courte d'un résultat réussi
-- dont le navigateur n'a pas reçu la réponse. Aucune donnée au-delà de 20 minutes.

create or replace function public.ma_cible_autoriser(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat') or p_cle !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalide'::text, 0, 0; return;
  end if;
  select q.n into v_g from ma_cible_quota q where q.cle = 'global' and q.jour = v_jour and q.etape = p_etape;
  select q.n into v_n from ma_cible_quota q where q.cle = p_cle and q.jour = v_jour and q.etape = p_etape;
  v_g := coalesce(v_g, 0);
  v_n := coalesce(v_n, 0);
  if v_g >= p_max_global then return query select false, 'global'::text, v_n, v_g; return; end if;
  if v_n >= p_max_ip then return query select false, 'ip'::text, v_n, v_g; return; end if;
  return query select true, null::text, v_n, v_g;
end $$;

revoke all on function public.ma_cible_autoriser(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_autoriser(text, text, integer, integer) to service_role;

create table if not exists public.ma_cible_reprise (
  cle    text primary key check (cle ~ '^[0-9a-f]{64}$'),
  corps  jsonb not null,
  expire timestamptz not null
);
alter table public.ma_cible_reprise enable row level security;
