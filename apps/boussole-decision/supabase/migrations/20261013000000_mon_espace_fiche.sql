-- Mon espace : la fiche Talent Unique de chaque personne (une par compte) et la suppression de compte.
-- Rien d'autre que les champs utiles aux outils : pas de fichier, pas de lien, pas de nom de famille.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds. Rejouable.

create table if not exists public.talent_fiches (
  user_id uuid primary key default auth.uid() references public.app_users (id) on delete cascade,
  fiche jsonb not null check (jsonb_typeof(fiche) = 'object' and octet_length(fiche::text) <= 60000),
  source text not null check (source in ('collage', 'notion', 'lien_notion', 'word', 'pdf', 'qcm', 'manuel')),
  methode text not null check (methode in ('modele', 'mots_cles', 'ia', 'manuel')),
  consentement_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.talent_fiches enable row level security;
revoke all on public.talent_fiches from anon;
grant select, insert, update, delete on public.talent_fiches to authenticated;

drop policy if exists "propriétaire" on public.talent_fiches;
create policy "propriétaire" on public.talent_fiches for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists talent_fiches_touch on public.talent_fiches;
create trigger talent_fiches_touch before update on public.talent_fiches
  for each row execute function public.touch_updated_at();

-- Suppression de son propre compte : tout part en cascade (app_users, profils, versions, fiche...).
-- Un compte coach ne peut pas se supprimer ainsi (ses codes d'invitation et ses coachés en dépendent).
create or replace function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  if exists (select 1 from public.app_users where id = auth.uid() and role = 'coach') then
    raise exception 'COMPTE_COACH';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- Lecture d'une page Notion par lien (D.6) : compteur par personne et par jour, heure de Paris.
-- Limites écrites ici (et non passées en paramètre) : appeler la fonction soi-même ne peut que consommer son propre quota.
create table if not exists public.notion_lien_quota (
  user_id uuid not null references public.app_users (id) on delete cascade,
  jour date not null,
  n integer not null default 0,
  primary key (user_id, jour)
);
alter table public.notion_lien_quota enable row level security;
revoke all on public.notion_lien_quota from anon, authenticated;

create or replace function public.notion_lien_consommer() returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_total integer;
  v_n integer;
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  perform pg_advisory_xact_lock(hashtext('notion_lien_quota'));
  delete from public.notion_lien_quota where jour < v_jour - 7;
  select coalesce(sum(n), 0) into v_total from public.notion_lien_quota where jour = v_jour;
  if v_total >= 300 then
    return false;
  end if;
  insert into public.notion_lien_quota as q (user_id, jour, n) values (auth.uid(), v_jour, 1)
    on conflict (user_id, jour) do update set n = q.n + 1 where q.n < 10
    returning q.n into v_n;
  return v_n is not null;
end $$;

revoke all on function public.notion_lien_consommer() from public, anon;
grant execute on function public.notion_lien_consommer() to authenticated;

notify pgrst, 'reload schema';
