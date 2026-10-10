-- Le Cibleur : plan d'action modifiable, gardé dans le compte.
--
-- Une ligne par compte : le plan tel que la personne l'a modifié (titres, actions, cases « fait »), et la date du
-- résultat auquel il appartient. Un plan ne se rattache jamais à un autre résultat. Chaque personne ne voit et ne
-- modifie que sa ligne. Sans compte, ou sans cette table, le plan reste dans le navigateur et rien ne casse.
-- La ligne part avec le compte (suppression en cascade). Rejouable.

create table if not exists public.ma_cible_plan (
  user_id uuid primary key default auth.uid() references public.app_users (id) on delete cascade,
  resultat_le text check (resultat_le is null or char_length(resultat_le) <= 40),
  plan jsonb not null check (jsonb_typeof(plan) = 'object' and pg_column_size(plan) <= 60000),
  mis_a_jour timestamptz not null default now()
);

alter table public.ma_cible_plan enable row level security;
revoke all on public.ma_cible_plan from anon;
grant select, insert, update, delete on public.ma_cible_plan to authenticated;

drop policy if exists "propriétaire" on public.ma_cible_plan;
create policy "propriétaire" on public.ma_cible_plan for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

notify pgrst, 'reload schema';
