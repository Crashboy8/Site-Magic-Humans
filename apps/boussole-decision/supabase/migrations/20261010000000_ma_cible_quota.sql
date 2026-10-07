-- Ma Cible : compteur anti-abus. Aucun contenu, seulement une empreinte (IP + sel + jour) et un nombre.
create table if not exists public.ma_cible_quota (
  cle   text not null,                       -- empreinte sha256 en hexadécimal, ou 'global'
  jour  date not null,
  etape text not null check (etape in ('cadrage', 'resultat')),
  n     integer not null default 0,
  primary key (cle, jour, etape)
);
alter table public.ma_cible_quota enable row level security;  -- aucune règle : table invisible pour anon et authenticated

create or replace function public.ma_cible_consommer(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat') or p_cle !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalide'::text, 0, 0; return;
  end if;
  delete from ma_cible_quota where jour < v_jour - 1;          -- rien n'est gardé plus de 2 jours
  insert into ma_cible_quota as q (cle, jour, etape, n) values ('global', v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning q.n into v_g;
  if v_g > p_max_global then return query select false, 'global'::text, 0, v_g; return; end if;
  insert into ma_cible_quota as q (cle, jour, etape, n) values (p_cle, v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning q.n into v_n;
  return query select v_n <= p_max_ip, case when v_n <= p_max_ip then null else 'ip' end, v_n, v_g;
end $$;

revoke all on function public.ma_cible_consommer(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_consommer(text, text, integer, integer) to service_role;
