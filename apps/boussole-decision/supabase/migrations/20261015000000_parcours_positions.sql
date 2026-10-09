-- « Où j'en suis ? » : la position de chaque personne sur son parcours (une ligne par compte).
-- Seulement la voie, l'autodiagnostic argent, les deux options et les réponses (oui, en_partie, pas_encore) par critère.
-- Sans cette table, l'outil garde les réponses dans le navigateur, sans erreur visible.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds. Rejouable.

create table if not exists public.parcours_positions (
  user_id uuid primary key default auth.uid() references public.app_users (id) on delete cascade,
  voie text check (voie in ('A', 'B', 'C', 'D', 'E', 'K', 'inconnue')),
  argent smallint check (argent between 1 and 5),
  parallele boolean,
  raccourci boolean not null default false,
  reponses jsonb not null default '{}'::jsonb
    check (jsonb_typeof(reponses) = 'object' and octet_length(reponses::text) <= 12000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parcours_positions enable row level security;
revoke all on public.parcours_positions from anon;
grant select, insert, update, delete on public.parcours_positions to authenticated;

drop policy if exists "propriétaire" on public.parcours_positions;
create policy "propriétaire" on public.parcours_positions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists parcours_positions_touch on public.parcours_positions;
create trigger parcours_positions_touch before update on public.parcours_positions
  for each row execute function public.touch_updated_at();

notify pgrst, 'reload schema';
