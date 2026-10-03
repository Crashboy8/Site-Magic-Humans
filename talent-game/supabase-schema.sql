-- Schéma Supabase pour Talent Unique — le jeu.
-- À exécuter une seule fois dans Supabase : SQL Editor > New query > Run.
--
-- Une ligne par joueur, tout le profil/progression en JSONB (même forme que
-- l'objet "user" déjà utilisé côté client) : ça permet de brancher Supabase
-- sans changer le modèle de données ni le reste de l'app.

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

-- Chaque joueur ne peut lire/écrire que sa propre ligne (auth.uid() = id).
create policy "Players can read own data"
  on public.players for select
  using (auth.uid() = id);

create policy "Players can insert own data"
  on public.players for insert
  with check (auth.uid() = id);

create policy "Players can update own data"
  on public.players for update
  using (auth.uid() = id);
