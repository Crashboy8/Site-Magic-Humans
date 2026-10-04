-- Boussole de décision : un invité dont l'email a déjà un compte se connecte à ce compte
-- et son essai y est ajouté (rien n'est perdu).
--
-- 1. Pendant l'essai, create_guest_transfer() délivre un jeton secret lié à l'invité.
-- 2. Une fois connecté à son compte, claim_guest_transfer(jeton) rattache tous les profils
--    de l'essai au compte, puis supprime le compte invité.

create table public.guest_transfers (
  token uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.app_users (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '1 day'
);
-- Accès uniquement par les fonctions ci-dessous.
alter table public.guest_transfers enable row level security;
revoke all on public.guest_transfers from anon, authenticated;

create function public.create_guest_transfer() returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_token uuid;
begin
  if not exists (select 1 from app_users where id = auth.uid() and is_guest) then
    raise exception 'RESERVE_AUX_ESSAIS';
  end if;
  delete from guest_transfers where guest_id = auth.uid() or expires_at < now();
  insert into guest_transfers (guest_id) values (auth.uid()) returning token into v_token;
  return v_token;
end $$;

-- Le verrou des versions finalisées laisse passer le transfert de propriétaire.
create or replace function public.guard_finalized_content() returns trigger
language plpgsql set search_path = public as $$
declare
  v_version uuid := coalesce(new.version_id, old.version_id);
begin
  if current_setting('boussole.transfert', true) = 'on' then
    return coalesce(new, old);
  end if;
  -- Pendant la suppression en cascade d'une version, la version n'existe plus : on laisse passer.
  if exists (select 1 from versions where id = v_version and status = 'finalisee') then
    raise exception 'VERSION_FINALISEE' using hint = 'Rouvre ou duplique la version pour la modifier.';
  end if;
  return coalesce(new, old);
end $$;

create function public.claim_guest_transfer(p_token uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_guest uuid;
  v_count integer;
begin
  if v_user is null or exists (select 1 from app_users where id = v_user and is_guest) then
    raise exception 'COMPTE_REQUIS';
  end if;

  delete from guest_transfers where token = p_token and expires_at > now() returning guest_id into v_guest;
  if v_guest is null then
    return 0; -- jeton inconnu, expiré ou déjà utilisé
  end if;
  if v_guest = v_user or not exists (select 1 from app_users where id = v_guest and is_guest) then
    return 0;
  end if;

  perform set_config('boussole.transfert', 'on', true);
  update profiles set user_id = v_user, shared_with_coach = false where user_id = v_guest;
  get diagnostics v_count = row_count;
  update versions set user_id = v_user where user_id = v_guest;
  update categories set user_id = v_user where user_id = v_guest;
  update criteria set user_id = v_user where user_id = v_guest;
  update opportunities set user_id = v_user where user_id = v_guest;
  update evaluations set user_id = v_user where user_id = v_guest;
  perform set_config('boussole.transfert', 'off', true);

  -- Le compte invité, désormais vide, disparaît.
  delete from auth.users where id = v_guest;
  return v_count;
end $$;

revoke execute on function public.create_guest_transfer(), public.claim_guest_transfer(uuid) from public, anon;
grant execute on function public.create_guest_transfer(), public.claim_guest_transfer(uuid) to authenticated;
