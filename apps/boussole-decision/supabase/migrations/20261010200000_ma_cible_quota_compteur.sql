-- Corrige ma_cible_consommer : `returning q.n` renvoyait la valeur d'avant l'incrément.
-- Deux résultats réussis d'affilée affichaient donc le même restant (par exemple 14 puis 14).
-- La ligne en base montait bien, mais la réponse HTTP non. À jouer dans le SQL editor, puis le cache PostgREST est rechargé.

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
  delete from ma_cible_quota where jour < v_jour - 1;
  insert into ma_cible_quota as q (cle, jour, etape, n) values ('global', v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_g;
  if v_g > p_max_global then return query select false, 'global'::text, 0, v_g; return; end if;
  insert into ma_cible_quota as q (cle, jour, etape, n) values (p_cle, v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_n;
  return query select v_n <= p_max_ip, case when v_n <= p_max_ip then null else 'ip' end, v_n, v_g;
end $$;

revoke all on function public.ma_cible_consommer(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_consommer(text, text, integer, integer) to service_role;

notify pgrst, 'reload schema';
