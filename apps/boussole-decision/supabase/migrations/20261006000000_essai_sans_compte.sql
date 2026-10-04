-- Boussole de décision : deux portes d'entrée.
--
-- 1. « Essayer tout de suite » : compte invité (connexion anonyme Supabase), sans email ni code.
-- 2. « Créer mon compte » : le code d'invitation devient facultatif.
-- Un invité qui ajoute son email devient un compte normal et garde tout son travail.
-- Toute personne inscrite sans code est rattachée au coach principal (le premier compte coach).
-- Les essais jamais sauvegardés sont supprimés au bout de 30 jours.

alter table public.app_users add column is_guest boolean not null default false;

-- Coach principal : le premier compte devenu coach.
create function public.default_coach_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from app_users where role = 'coach' order by created_at limit 1;
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(new.raw_user_meta_data ->> 'invitation_code', '')));
  v_invitation invitation_codes;
  v_coach uuid;
begin
  if v_code <> '' then
    -- Un code a été saisi : il doit être valable.
    select * into v_invitation from invitation_codes where code = v_code for update;
    if not found
       or v_invitation.disabled_at is not null
       or v_invitation.used_count >= v_invitation.max_uses
       or (v_invitation.expires_at is not null and v_invitation.expires_at < now()) then
      raise exception 'CODE_INVITATION_INVALIDE';
    end if;
    update invitation_codes set used_count = used_count + 1 where code = v_code;
    v_coach := v_invitation.coach_id;
  end if;

  insert into app_users (id, email, first_name, coach_id, invitation_code, is_guest)
  values (
    new.id,
    coalesce(new.email, ''),
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 60),
    coalesce(v_coach, default_coach_id()),
    nullif(v_code, ''),
    coalesce(new.is_anonymous, false)
  );
  return new;
end $$;

-- Un invité qui confirme son email devient un compte normal.
create function public.handle_user_updated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update app_users
     set email = coalesce(new.email, email),
         is_guest = coalesce(new.is_anonymous, false)
   where id = new.id;
  return new;
end $$;

create trigger on_auth_user_updated after update of email, is_anonymous on auth.users
  for each row execute function public.handle_user_updated();

-- Le code d'invitation saisi dans le formulaire reste vérifié s'il est fourni.
-- (check_invitation_code est inchangée.)

-- Le tableau de bord du coach n'affiche pas les essais non sauvegardés.
create or replace function public.coach_dashboard()
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
   where u.coach_id = auth.uid() and public.is_coach() and not u.is_guest
   order by last_activity_at desc;
$$;

-- Un invité ne partage rien avec le coach tant qu'il n'a pas sauvegardé son travail.
create or replace function public.coach_can_read_profile(p_profile_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p join app_users u on u.id = p.user_id
     where p.id = p_profile_id and p.shared_with_coach and u.coach_id = auth.uid() and not u.is_guest
  );
$$;

create or replace function public.coach_can_read_version(p_version_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from versions v
      join profiles p on p.id = v.profile_id
      join app_users u on u.id = p.user_id
     where v.id = p_version_id and p.shared_with_coach and u.coach_id = auth.uid() and not u.is_guest
  );
$$;

-- Suppression des essais jamais sauvegardés depuis plus de 30 jours (avec tout leur contenu).
create function public.purge_stale_guests(p_days integer default 30) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  with deleted as (
    delete from auth.users
     where is_anonymous
       and created_at < now() - make_interval(days => p_days)
    returning 1
  )
  select count(*) into v_count from deleted;
  return v_count;
end $$;

revoke execute on function public.purge_stale_guests(integer) from public, anon, authenticated;

-- Planification quotidienne (4 h du matin) si l'extension pg_cron est disponible.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('boussole-purge-essais', '0 4 * * *', 'select public.purge_stale_guests(30)');
exception when others then
  raise notice 'pg_cron indisponible : lancer « select public.purge_stale_guests(30); » manuellement de temps en temps.';
end $$;

