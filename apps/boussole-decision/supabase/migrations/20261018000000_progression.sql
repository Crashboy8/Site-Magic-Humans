-- Progression : un seul jeu relié au compte (le jeu talent-game et les points de « Où j'en suis ? »).
--
-- Une ligne par compte : xp (points du jeu + points de « Où j'en suis ? »), niveau Réussir dans le Plaisir
-- (code de l'échelle, de 0 à 7, avec 5A et 5B ; null au point de départ), badges gagnés, série de jours
-- et mis_a_jour (dernière fois que la personne a gagné des points ou répondu, sert aussi à compter la série).
-- Chaque personne ne voit et ne modifie que sa ligne : pas de classement, rien n'est montré à quelqu'un d'autre,
-- pas même au coach. Sans compte, tout reste dans le navigateur. Sans cette table, rien ne casse : le jeu et
-- « Où j'en suis ? » gardent tout dans le navigateur, et Mon espace n'affiche pas le bloc « Ton aventure ».
-- supprimer_mon_compte() efface aussi la progression.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds, après 20261017000000_vip_consentement.sql. Rejouable.

create table if not exists public.progression (
  user_id uuid primary key default auth.uid() references public.app_users (id) on delete cascade,
  xp integer not null default 0 check (xp between 0 and 1000000),
  niveau text check (niveau is null or niveau ~ '^[0-9][A-Z]?$'),
  badges text[] not null default '{}'
    check (cardinality(badges) <= 20 and array_to_string(badges, ',') ~ '^[a-z0-9,-]*$'),
  serie_jours integer not null default 0 check (serie_jours between 0 and 100000),
  mis_a_jour timestamptz not null default now()
);

alter table public.progression enable row level security;
revoke all on public.progression from anon;
grant select, insert, update, delete on public.progression to authenticated;

drop policy if exists "propriétaire" on public.progression;
create policy "propriétaire" on public.progression for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Suppression de son propre compte : la progression part avec lui, comme la fiche préparée pour son code.
create or replace function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  if exists (select 1 from public.app_users where id = auth.uid() and role = 'coach') then
    raise exception 'COMPTE_COACH';
  end if;
  delete from public.progression where user_id = auth.uid();
  delete from public.fiches_preparees f
   using public.app_users u, public.invitation_codes i
   where u.id = auth.uid() and f.code = u.invitation_code and i.code = f.code and i.max_uses = 1;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

notify pgrst, 'reload schema';
