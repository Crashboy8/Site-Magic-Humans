-- Photo de la salle (Quiz Amour). Compteur anonyme : session + profil + nombre.
-- Aucune réponse, aucun prénom, aucun email, aucune adresse IP.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds.
-- Le site n'écrit ici que via la clé service_role, par la fonction ci-dessous.

create table if not exists public.quiz_salle (
  session text not null check (session ~ '^webinaire-[a-z0-9][a-z0-9-]{0,40}$'),
  profil  text not null check (profil in ('securite', 'profondeur', 'admiration', 'liberte', 'harmonie', 'complicite', 'intensite')),
  n       integer not null default 0 check (n >= 0),
  primary key (session, profil)
);

alter table public.quiz_salle enable row level security;
revoke all on table public.quiz_salle from public, anon, authenticated;

create or replace function public.quiz_salle_increment(p_session text, p_profil text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if p_session !~ '^webinaire-[a-z0-9][a-z0-9-]{0,40}$' then
    return null;
  end if;
  if p_profil not in ('securite', 'profondeur', 'admiration', 'liberte', 'harmonie', 'complicite', 'intensite') then
    return null;
  end if;
  insert into public.quiz_salle as q (session, profil, n)
  values (p_session, p_profil, 1)
  on conflict (session, profil) do update set n = q.n + 1
  returning q.n into v_n;
  return v_n;
end $$;

revoke all on function public.quiz_salle_increment(text, text) from public, anon, authenticated;
grant execute on function public.quiz_salle_increment(text, text) to service_role;
