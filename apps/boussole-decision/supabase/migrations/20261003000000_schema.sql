-- Boussole de décision : schéma initial
-- Utilisateurs, codes d'invitation, profils, versions, catégories, critères,
-- opportunités, évaluations. Chaque utilisateur ne voit que ses données ;
-- son coach peut les consulter en lecture seule.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('coache', 'coach');
create type public.version_status as enum ('brouillon', 'finalisee');
create type public.importance_level as enum (
  'eliminatoire', 'crucial', 'tres_important', 'important', 'souhaitable', 'bonus'
);
create type public.evaluation_value as enum ('non', 'p25', 'p50', 'p75', 'oui', 'inconnu');

-- ---------------------------------------------------------------------------
-- Utilisateurs et codes d'invitation
-- ---------------------------------------------------------------------------

create table public.app_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  role public.user_role not null default 'coache',
  coach_id uuid references public.app_users (id) on delete set null,
  invitation_code text,
  tutorial_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invitation_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{6,40}$'),
  -- null : code « orphelin », rattaché au premier coach déclaré (voir promote_to_coach)
  coach_id uuid references public.app_users (id) on delete cascade,
  label text not null default '',
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profils, versions et contenu d'une version
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_user_id_idx on public.profiles (user_id);

create table public.versions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  status public.version_status not null default 'brouillon',
  source_version_id uuid references public.versions (id) on delete set null,
  insight_note text not null default '',      -- « Ressenti / prise de conscience »
  ranking_feedback text not null default '',  -- « Ce classement correspond-il à ton ressenti ? »
  current_step text not null default 'criteres'
    check (current_step in ('criteres', 'opportunites', 'evaluation', 'resultats')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz
);
create index versions_profile_id_idx on public.versions (profile_id);
create index versions_user_id_idx on public.versions (user_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.versions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  key text check (key in ('talent', 'valeurs', 'logistique', 'remuneration', 'autre')),
  label text not null check (char_length(label) between 1 and 60),
  position integer not null default 0,
  unique (id, version_id)
);
create index categories_version_id_idx on public.categories (version_id);

create table public.criteria (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.versions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  category_id uuid not null,
  label text not null check (char_length(label) between 1 and 200),
  description text not null default '',
  importance public.importance_level not null default 'important',
  position integer not null default 0,
  unique (id, version_id),
  foreign key (category_id, version_id) references public.categories (id, version_id) on delete cascade
);
create index criteria_version_id_idx on public.criteria (version_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.versions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  summary text not null default '',
  url text not null default '',
  notes text not null default '',
  position integer not null default 0,
  unique (id, version_id)
);
create index opportunities_version_id_idx on public.opportunities (version_id);

create table public.evaluations (
  criterion_id uuid not null,
  opportunity_id uuid not null,
  version_id uuid not null references public.versions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  value public.evaluation_value not null,
  updated_at timestamptz not null default now(),
  primary key (criterion_id, opportunity_id),
  foreign key (criterion_id, version_id) references public.criteria (id, version_id) on delete cascade,
  foreign key (opportunity_id, version_id) references public.opportunities (id, version_id) on delete cascade
);
create index evaluations_version_id_idx on public.evaluations (version_id);

-- ---------------------------------------------------------------------------
-- Fonctions d'aide aux règles de sécurité
-- ---------------------------------------------------------------------------

create function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users where id = auth.uid() and role = 'coach');
$$;

-- Vrai si l'utilisateur connecté est le coach du propriétaire des données.
create function public.is_coach_of(owner uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users where id = owner and coach_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Cohérence : le propriétaire d'une ligne est toujours celui de sa version
-- ---------------------------------------------------------------------------

create function public.set_owner_from_profile() returns trigger
language plpgsql set search_path = public as $$
begin
  select user_id into new.user_id from profiles where id = new.profile_id;
  return new;
end $$;

create function public.set_owner_from_version() returns trigger
language plpgsql set search_path = public as $$
begin
  select user_id into new.user_id from versions where id = new.version_id;
  return new;
end $$;

create trigger versions_owner before insert or update of profile_id, user_id on public.versions
  for each row execute function public.set_owner_from_profile();
create trigger categories_owner before insert or update of version_id, user_id on public.categories
  for each row execute function public.set_owner_from_version();
create trigger criteria_owner before insert or update of version_id, user_id on public.criteria
  for each row execute function public.set_owner_from_version();
create trigger opportunities_owner before insert or update of version_id, user_id on public.opportunities
  for each row execute function public.set_owner_from_version();
create trigger evaluations_owner before insert or update of version_id, user_id on public.evaluations
  for each row execute function public.set_owner_from_version();

-- ---------------------------------------------------------------------------
-- Verrou : le contenu d'une version finalisée ne se modifie plus
-- ---------------------------------------------------------------------------

create function public.guard_finalized_content() returns trigger
language plpgsql set search_path = public as $$
declare
  v_version uuid := coalesce(new.version_id, old.version_id);
begin
  -- Pendant la suppression en cascade d'une version, la version n'existe plus : on laisse passer.
  if exists (select 1 from versions where id = v_version and status = 'finalisee') then
    raise exception 'VERSION_FINALISEE' using hint = 'Rouvre ou duplique la version pour la modifier.';
  end if;
  return coalesce(new, old);
end $$;

create trigger categories_lock before insert or update or delete on public.categories
  for each row execute function public.guard_finalized_content();
create trigger criteria_lock before insert or update or delete on public.criteria
  for each row execute function public.guard_finalized_content();
create trigger opportunities_lock before insert or update or delete on public.opportunities
  for each row execute function public.guard_finalized_content();
create trigger evaluations_lock before insert or update or delete on public.evaluations
  for each row execute function public.guard_finalized_content();

-- Sur une version finalisée, seuls le nom et le statut (rouvrir) peuvent changer.
create function public.guard_finalized_version() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.status = 'finalisee' and new.status = 'finalisee'
     and (new.insight_note is distinct from old.insight_note
          or new.ranking_feedback is distinct from old.ranking_feedback) then
    raise exception 'VERSION_FINALISEE' using hint = 'Rouvre ou duplique la version pour la modifier.';
  end if;
  if new.status = 'finalisee' and old.status <> 'finalisee' then
    new.finalized_at := now();
  elsif new.status = 'brouillon' then
    new.finalized_at := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger versions_guard before update on public.versions
  for each row execute function public.guard_finalized_version();

-- « Modifié le » d'une version : mis à jour à chaque changement de son contenu.
create function public.touch_version() returns trigger
language plpgsql set search_path = public as $$
begin
  update versions set updated_at = now()
   where id = coalesce(new.version_id, old.version_id) and status = 'brouillon';
  return null;
end $$;

create trigger categories_touch after insert or update or delete on public.categories
  for each row execute function public.touch_version();
create trigger criteria_touch after insert or update or delete on public.criteria
  for each row execute function public.touch_version();
create trigger opportunities_touch after insert or update or delete on public.opportunities
  for each row execute function public.touch_version();
create trigger evaluations_touch after insert or update or delete on public.evaluations
  for each row execute function public.touch_version();

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Inscription : uniquement avec un code d'invitation valide
-- ---------------------------------------------------------------------------

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(new.raw_user_meta_data ->> 'invitation_code', '')));
  v_invitation invitation_codes;
begin
  select * into v_invitation from invitation_codes where code = v_code for update;
  if not found
     or v_invitation.used_count >= v_invitation.max_uses
     or (v_invitation.expires_at is not null and v_invitation.expires_at < now()) then
    raise exception 'CODE_INVITATION_INVALIDE';
  end if;

  update invitation_codes set used_count = used_count + 1 where code = v_code;

  insert into app_users (id, email, first_name, coach_id, invitation_code)
  values (
    new.id,
    new.email,
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 60),
    v_invitation.coach_id,
    v_code
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Vérification préalable (formulaire d'inscription), accessible sans être connecté.
create function public.check_invitation_code(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from invitation_codes
     where code = upper(trim(p_code))
       and used_count < max_uses
       and (expires_at is null or expires_at > now())
  );
$$;

-- À lancer une fois dans l'éditeur SQL de Supabase, après avoir créé son compte :
--   select public.promote_to_coach('ton-email@exemple.fr');
-- Le compte devient coach et récupère les codes et coachés encore sans coach.
create function public.promote_to_coach(p_email text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select id into v_id from app_users where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'Aucun compte avec cet email';
  end if;
  update app_users set role = 'coach', coach_id = null where id = v_id;
  update invitation_codes set coach_id = v_id where coach_id is null;
  update app_users set coach_id = v_id where coach_id is null and id <> v_id;
end $$;

revoke execute on function public.promote_to_coach(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Opérations groupées (une seule transaction, droits de l'utilisateur)
-- ---------------------------------------------------------------------------

create function public.add_default_categories(p_version_id uuid) returns void
language sql security invoker set search_path = public as $$
  insert into categories (version_id, key, label, position) values
    (p_version_id, 'talent', 'Talent unique', 0),
    (p_version_id, 'valeurs', 'Valeurs', 1),
    (p_version_id, 'logistique', 'Logistique', 2),
    (p_version_id, 'remuneration', 'Rémunération', 3),
    (p_version_id, 'autre', 'Autre', 4);
$$;

create function public.create_version(p_profile_id uuid, p_name text) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_id uuid;
begin
  insert into versions (profile_id, name) values (p_profile_id, trim(p_name)) returning id into v_id;
  perform add_default_categories(v_id);
  return v_id;
end $$;

create function public.create_profile(p_name text, p_description text default '') returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_id uuid;
begin
  insert into profiles (name, description) values (trim(p_name), coalesce(p_description, ''))
  returning id into v_id;
  perform create_version(v_id, 'Brouillon');
  return v_id;
end $$;

create function public.duplicate_version(p_version_id uuid, p_name text) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_src versions;
  v_new uuid;
begin
  select * into v_src from versions where id = p_version_id and user_id = auth.uid();
  if not found then
    raise exception 'VERSION_INTROUVABLE';
  end if;

  insert into versions (profile_id, name, source_version_id, insight_note, ranking_feedback, current_step)
  values (v_src.profile_id, trim(p_name), v_src.id, v_src.insight_note, v_src.ranking_feedback, v_src.current_step)
  returning id into v_new;

  create temp table map_categories on commit drop as
    select id as old_id, gen_random_uuid() as new_id from categories where version_id = v_src.id;
  create temp table map_criteria on commit drop as
    select id as old_id, gen_random_uuid() as new_id from criteria where version_id = v_src.id;
  create temp table map_opportunities on commit drop as
    select id as old_id, gen_random_uuid() as new_id from opportunities where version_id = v_src.id;

  insert into categories (id, version_id, key, label, position)
    select m.new_id, v_new, c.key, c.label, c.position
      from categories c join map_categories m on m.old_id = c.id;

  insert into criteria (id, version_id, category_id, label, description, importance, position)
    select m.new_id, v_new, mc.new_id, c.label, c.description, c.importance, c.position
      from criteria c
      join map_criteria m on m.old_id = c.id
      join map_categories mc on mc.old_id = c.category_id;

  insert into opportunities (id, version_id, name, summary, url, notes, position)
    select m.new_id, v_new, o.name, o.summary, o.url, o.notes, o.position
      from opportunities o join map_opportunities m on m.old_id = o.id;

  insert into evaluations (criterion_id, opportunity_id, version_id, value)
    select mc.new_id, mo.new_id, v_new, e.value
      from evaluations e
      join map_criteria mc on mc.old_id = e.criterion_id
      join map_opportunities mo on mo.old_id = e.opportunity_id;

  drop table map_categories, map_criteria, map_opportunities;
  return v_new;
end $$;

-- ---------------------------------------------------------------------------
-- Droits et règles de sécurité (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.app_users enable row level security;
alter table public.invitation_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.versions enable row level security;
alter table public.categories enable row level security;
alter table public.criteria enable row level security;
alter table public.opportunities enable row level security;
alter table public.evaluations enable row level security;

-- Utilisateurs : on lit sa fiche (et le coach celles de ses coachés) ;
-- on ne modifie que son prénom et l'état du tutoriel.
create policy "lecture de sa fiche" on public.app_users for select
  using (id = auth.uid() or coach_id = auth.uid());
create policy "modification de sa fiche" on public.app_users for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.app_users from anon, authenticated;
grant update (first_name, tutorial_seen_at) on public.app_users to authenticated;

-- Codes d'invitation : gérés par le coach qui les a créés.
create policy "codes du coach" on public.invitation_codes for all
  using (coach_id = auth.uid() and public.is_coach())
  with check (coach_id = auth.uid() and public.is_coach());
revoke all on public.invitation_codes from anon;

-- Données de coaching : le propriétaire fait tout, son coach lit.
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'versions', 'categories', 'criteria', 'opportunities', 'evaluations'] loop
    execute format(
      'create policy "propriétaire" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format(
      'create policy "lecture par le coach" on public.%I for select using (public.is_coach_of(user_id))', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

revoke execute on function public.create_profile(text, text), public.create_version(uuid, text),
  public.duplicate_version(uuid, text), public.add_default_categories(uuid) from public, anon;
grant execute on function public.check_invitation_code(text) to anon, authenticated;
