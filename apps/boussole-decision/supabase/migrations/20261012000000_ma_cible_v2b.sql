-- Le Cibleur V2b : deux nouvelles étapes comptées, « synthese » (lecture des notes) et « approfondir »
-- (portrait complet ou piste creusée). Reprend la correction de ma_cible_consommer (valeur après incrément).
-- Rejouable. Aucun contenu n'est stocké : seulement une empreinte et un nombre.

alter table public.ma_cible_quota drop constraint if exists ma_cible_quota_etape_check;
alter table public.ma_cible_quota add constraint ma_cible_quota_etape_check
  check (etape in ('cadrage', 'resultat', 'synthese', 'approfondir'));

create or replace function public.ma_cible_consommer(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat', 'synthese', 'approfondir') or p_cle !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalide'::text, 0, 0; return;
  end if;
  delete from ma_cible_quota where jour < v_jour - 1;
  insert into ma_cible_quota as q (cle, jour, etape, n) values ('global', v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_g;
  if v_g > p_max_global then return query select false, 'global'::text, 0, v_g; return; end if;
  insert into ma_cible_quota as q (cle, jour, etape, n) values (p_cle, v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_n;
  return query select v_n <= p_max_ip, case when v_n <= p_max_ip then null else 'ip' end, v_n, v_g;
end $$;

create or replace function public.ma_cible_autoriser(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat', 'synthese', 'approfondir') or p_cle !~ '^[0-9a-f]{64}$' then
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

revoke all on function public.ma_cible_consommer(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_consommer(text, text, integer, integer) to service_role;
revoke all on function public.ma_cible_autoriser(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_autoriser(text, text, integer, integer) to service_role;

notify pgrst, 'reload schema';
