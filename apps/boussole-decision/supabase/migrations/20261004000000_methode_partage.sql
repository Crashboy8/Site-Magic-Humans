-- Boussole de décision : méthode Talent Unique de Magic Humans, partage avec accord, commentaires du coach.
--
-- 1. Le coach ne voit RIEN tant que le coaché n'a pas partagé un profil (interrupteur révocable).
-- 2. Codes d'invitation à usage unique, désactivables.
-- 3. Talent Unique (Mécanisme, Contexte Déclencheur, Super bénéfice) et Anti-Contexte sur chaque profil.
-- 4. Catégories de la matrice ; critères DEALBREAKER / WEIGHTED (1 à 5) et TOWARDS / AWAY_FROM.
-- 5. Commentaires du coach sur une version, un critère ou une opportunité.

-- ---------------------------------------------------------------------------
-- 1. Partage d'un profil avec le coach
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column shared_with_coach boolean not null default false,
  add column shared_at timestamptz;

create function public.track_profile_sharing() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.shared_with_coach and (tg_op = 'INSERT' or not old.shared_with_coach) then
    new.shared_at := now();
  elsif not new.shared_with_coach then
    new.shared_at := null;
  end if;
  return new;
end $$;

create trigger profiles_sharing before insert or update of shared_with_coach on public.profiles
  for each row execute function public.track_profile_sharing();

-- Vrai si l'utilisateur connecté est le coach du propriétaire ET que le profil est partagé.
create function public.coach_can_read_profile(p_profile_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p join app_users u on u.id = p.user_id
     where p.id = p_profile_id and p.shared_with_coach and u.coach_id = auth.uid()
  );
$$;

create function public.coach_can_read_version(p_version_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from versions v
      join profiles p on p.id = v.profile_id
      join app_users u on u.id = p.user_id
     where v.id = p_version_id and p.shared_with_coach and u.coach_id = auth.uid()
  );
$$;

-- Remplace la lecture « tout ce qui appartient à mes coachés » par « ce qu'ils ont partagé ».
drop policy "lecture par le coach" on public.profiles;
drop policy "lecture par le coach" on public.versions;
drop policy "lecture par le coach" on public.categories;
drop policy "lecture par le coach" on public.criteria;
drop policy "lecture par le coach" on public.opportunities;
drop policy "lecture par le coach" on public.evaluations;

create policy "lecture par le coach si partagé" on public.profiles for select
  using (public.coach_can_read_profile(id));
create policy "lecture par le coach si partagé" on public.versions for select
  using (public.coach_can_read_version(id));
create policy "lecture par le coach si partagé" on public.categories for select
  using (public.coach_can_read_version(version_id));
create policy "lecture par le coach si partagé" on public.criteria for select
  using (public.coach_can_read_version(version_id));
create policy "lecture par le coach si partagé" on public.opportunities for select
  using (public.coach_can_read_version(version_id));
create policy "lecture par le coach si partagé" on public.evaluations for select
  using (public.coach_can_read_version(version_id));

drop function public.is_coach_of(uuid);

-- Tableau de bord du coach : ses coachés, leur dernière activité et le nombre de profils partagés.
-- Ne révèle aucun contenu non partagé (seulement une date d'activité).
create function public.coach_dashboard()
returns table (
  id uuid,
  first_name text,
  email text,
  created_at timestamptz,
  last_activity_at timestamptz,
  shared_profiles integer
)
language sql stable security definer set search_path = public as $$
  select u.id, u.first_name, u.email, u.created_at,
         greatest(u.created_at, (select max(v.updated_at) from versions v where v.user_id = u.id),
                  (select max(p.updated_at) from profiles p where p.user_id = u.id)) as last_activity_at,
         (select count(*)::int from profiles p where p.user_id = u.id and p.shared_with_coach) as shared_profiles
    from app_users u
   where u.coach_id = auth.uid() and public.is_coach()
   order by last_activity_at desc;
$$;

-- ---------------------------------------------------------------------------
-- 2. Codes d'invitation : usage unique par défaut, désactivables
-- ---------------------------------------------------------------------------

alter table public.invitation_codes
  alter column max_uses set default 1,
  add column disabled_at timestamptz;

create or replace function public.check_invitation_code(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from invitation_codes
     where code = upper(trim(p_code))
       and disabled_at is null
       and used_count < max_uses
       and (expires_at is null or expires_at > now())
  );
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(new.raw_user_meta_data ->> 'invitation_code', '')));
  v_invitation invitation_codes;
begin
  select * into v_invitation from invitation_codes where code = v_code for update;
  if not found
     or v_invitation.disabled_at is not null
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

-- ---------------------------------------------------------------------------
-- 3. Talent Unique et Anti-Contexte, propres à chaque profil
-- ---------------------------------------------------------------------------
-- Formulation officielle : « Je [Mécanisme] dans un environnement où [Contexte Déclencheur],
-- afin de [Super bénéfice]. »

alter table public.profiles
  add column talent_mecanisme text not null default '',
  add column talent_contexte_declencheur text not null default '',
  add column talent_super_benefice text not null default '',
  add column anti_contexte text not null default '';

-- ---------------------------------------------------------------------------
-- 4. Catégories et paramètres des critères
-- ---------------------------------------------------------------------------

alter table public.categories drop constraint categories_key_check;
update public.categories set key = case key
    when 'talent' then 'contexte_declencheur'
    when 'valeurs' then 'valeurs_culture'
    when 'logistique' then 'conditions_vie'
    when 'remuneration' then 'remuneration'
    else null
  end;
update public.categories set label = case key
    when 'contexte_declencheur' then 'Contexte Déclencheur & Flow'
    when 'valeurs_culture' then 'Alignement Valeurs & Culture'
    when 'conditions_vie' then 'Conditions de Vie & QVT'
    when 'remuneration' then 'Rémunération & Viabilité Financière'
    else label
  end;
alter table public.categories add constraint categories_key_check
  check (key in ('contexte_declencheur', 'anti_contexte', 'valeurs_culture', 'conditions_vie', 'remuneration'));

-- Chaque version possède au plus une catégorie de chaque type.
create unique index categories_version_key_idx on public.categories (version_id, key) where key is not null;

-- Les versions existantes reçoivent la catégorie « Anti-Contexte & Lignes Rouges ».
insert into public.categories (version_id, user_id, key, label, position)
  select v.id, v.user_id, 'anti_contexte', 'Anti-Contexte & Lignes Rouges', 1
    from public.versions v
   where v.status = 'brouillon'
     and not exists (select 1 from public.categories c where c.version_id = v.id and c.key = 'anti_contexte');

create or replace function public.add_default_categories(p_version_id uuid) returns void
language sql security invoker set search_path = public as $$
  insert into categories (version_id, key, label, position) values
    (p_version_id, 'contexte_declencheur', 'Contexte Déclencheur & Flow', 0),
    (p_version_id, 'anti_contexte', 'Anti-Contexte & Lignes Rouges', 1),
    (p_version_id, 'valeurs_culture', 'Alignement Valeurs & Culture', 2),
    (p_version_id, 'conditions_vie', 'Conditions de Vie & QVT', 3),
    (p_version_id, 'remuneration', 'Rémunération & Viabilité Financière', 4);
$$;

create type public.criterion_kind as enum ('DEALBREAKER', 'WEIGHTED');
create type public.criterion_direction as enum ('TOWARDS', 'AWAY_FROM');

alter table public.criteria
  add column kind public.criterion_kind not null default 'WEIGHTED',
  add column weight smallint,
  add column direction public.criterion_direction not null default 'TOWARDS';

update public.criteria set
  kind = case when importance = 'eliminatoire' then 'DEALBREAKER' else 'WEIGHTED' end::public.criterion_kind,
  weight = case importance
    when 'crucial' then 5 when 'tres_important' then 4 when 'important' then 3
    when 'souhaitable' then 2 when 'bonus' then 1 else null end;
update public.criteria set weight = 3 where kind = 'WEIGHTED' and weight is null;

alter table public.criteria
  drop column importance,
  add constraint criteria_weight_check check (
    (kind = 'DEALBREAKER' and weight is null) or (kind = 'WEIGHTED' and weight between 1 and 5)
  );
drop type public.importance_level;

create or replace function public.duplicate_version(p_version_id uuid, p_name text) returns uuid
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

  insert into criteria (id, version_id, category_id, label, description, kind, weight, direction, position)
    select m.new_id, v_new, mc.new_id, c.label, c.description, c.kind, c.weight, c.direction, c.position
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
-- 5. Commentaires du coach
-- ---------------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.versions (id) on delete cascade,
  owner_id uuid not null references public.app_users (id) on delete cascade, -- le coaché
  author_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  target_type text not null check (target_type in ('version', 'criterion', 'opportunity')),
  target_id uuid not null,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index comments_version_id_idx on public.comments (version_id);
create index comments_owner_unread_idx on public.comments (owner_id) where read_at is null;

-- Le destinataire est toujours le propriétaire de la version ; la cible doit appartenir à la version.
create function public.prepare_comment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select user_id into new.owner_id from versions where id = new.version_id;
  if (new.target_type = 'version' and new.target_id <> new.version_id)
     or (new.target_type = 'criterion'
         and not exists (select 1 from criteria where id = new.target_id and version_id = new.version_id))
     or (new.target_type = 'opportunity'
         and not exists (select 1 from opportunities where id = new.target_id and version_id = new.version_id)) then
    raise exception 'CIBLE_INVALIDE';
  end if;
  new.author_id := auth.uid();
  new.created_at := now();
  new.read_at := null;
  return new;
end $$;

create trigger comments_prepare before insert on public.comments
  for each row execute function public.prepare_comment();

alter table public.comments enable row level security;

create policy "le coach commente ce qui lui est partagé" on public.comments for insert
  with check (author_id = auth.uid() and public.coach_can_read_version(version_id));
-- Le coach relit ses commentaires seulement tant que le profil reste partagé.
create policy "lecture des commentaires" on public.comments for select
  using (owner_id = auth.uid() or (author_id = auth.uid() and public.coach_can_read_version(version_id)));
create policy "le coaché marque comme lu" on public.comments for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "l'auteur supprime son commentaire" on public.comments for delete
  using (author_id = auth.uid());

revoke all on public.comments from anon;
revoke update on public.comments from authenticated;
grant update (read_at) on public.comments to authenticated;
