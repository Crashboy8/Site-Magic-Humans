-- Accord pour la fiche, niveaux VIP, fiches préparées par Pierre, groupes M3.
--
-- 1. app_users.consentement_fiche_at : date de l'accord « J'accepte que ma fiche talent soit stockée dans mon espace ».
--    Posée seulement par accepter_stockage_fiche() : un compte ne modifie toujours que son prénom.
-- 2. invitation_codes.niveau (pionnier, vip12, membre) et invitation_codes.acces_jusqu_au (null = à vie).
--    La durée par défaut est proposée par la page coach/codes : 1 an pour vip12 et membre, à vie pour pionnier.
--    est_vip() : vrai pour un compte ouvert ou activé avec un code qui porte un niveau, tant que l'accès court.
-- 3. fiches_preparees : la fiche que Pierre dépose avec un code pour une seule personne. Lisible par le coach seul.
--    recevoir_fiche_preparee() la copie dans talent_fiches, seulement après l'accord, et sans jamais écraser
--    une fiche déjà présente.
-- 4. demandes_groupe_m3 : « Rejoins un groupe M3 », une demande par personne, réservée aux comptes VIP.
-- 5. supprimer_mon_compte() efface aussi la fiche préparée rattachée au code de la personne.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds. Rejouable.

-- 1. Accord pour stocker la fiche
alter table public.app_users add column if not exists consentement_fiche_at timestamptz;

-- 2. Niveaux d'accès sur les codes
alter table public.invitation_codes add column if not exists niveau text;
alter table public.invitation_codes add column if not exists acces_jusqu_au timestamptz;
alter table public.invitation_codes drop constraint if exists invitation_codes_niveau_check;
alter table public.invitation_codes add constraint invitation_codes_niveau_check
  check (niveau is null or niveau in ('pionnier', 'vip12', 'membre'));

create or replace function public.est_vip() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from app_users u
      join invitation_codes i on i.code = u.invitation_code
     where u.id = auth.uid()
       and not u.is_guest
       and i.niveau is not null
       and (i.acces_jusqu_au is null or i.acces_jusqu_au > now())
  );
$$;

revoke all on function public.est_vip() from public, anon;
grant execute on function public.est_vip() to authenticated;

-- Son propre niveau (export « Tes données ») : la personne ne lit pas la table des codes.
create or replace function public.mon_niveau_acces()
returns table (niveau text, acces_jusqu_au timestamptz)
language sql stable security definer set search_path = public as $$
  select i.niveau, i.acces_jusqu_au
    from app_users u
    join invitation_codes i on i.code = u.invitation_code
   where u.id = auth.uid() and not u.is_guest and i.niveau is not null;
$$;

revoke all on function public.mon_niveau_acces() from public, anon;
grant execute on function public.mon_niveau_acces() to authenticated;

-- 3. Fiches préparées par Pierre
alter table public.talent_fiches drop constraint if exists talent_fiches_source_check;
alter table public.talent_fiches add constraint talent_fiches_source_check
  check (source in ('collage', 'notion', 'lien_notion', 'word', 'pdf', 'qcm', 'manuel', 'coach'));

create table if not exists public.fiches_preparees (
  code text primary key references public.invitation_codes (code) on delete cascade,
  coach_id uuid not null default auth.uid() references public.app_users (id) on delete cascade,
  fiche jsonb not null check (jsonb_typeof(fiche) = 'object' and octet_length(fiche::text) <= 60000),
  methode text not null default 'modele' check (methode in ('modele', 'mots_cles', 'ia', 'manuel')),
  copiee_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fiches_preparees enable row level security;
revoke all on public.fiches_preparees from anon;
grant select, insert, update, delete on public.fiches_preparees to authenticated;

-- Le coach du code seul, et seulement sur un code pour une personne.
drop policy if exists "coach du code" on public.fiches_preparees;
create policy "coach du code" on public.fiches_preparees for all
  using (coach_id = auth.uid() and public.is_coach())
  with check (
    coach_id = auth.uid() and public.is_coach()
    and exists (
      select 1 from public.invitation_codes i
       where i.code = fiches_preparees.code and i.coach_id = auth.uid() and i.max_uses = 1
    )
  );

drop trigger if exists fiches_preparees_touch on public.fiches_preparees;
create trigger fiches_preparees_touch before update on public.fiches_preparees
  for each row execute function public.touch_updated_at();

-- Copie de la fiche préparée dans l'espace de la personne connectée.
-- aucune : pas de fiche préparée pour son code ; en_attente : une fiche attend son accord ;
-- copiee : la fiche vient d'arriver dans son espace ; deja : déjà copiée une fois, ou la personne a déjà sa fiche.
create or replace function public.recevoir_fiche_preparee() returns text
language plpgsql security definer set search_path = public as $$
declare
  v_moi app_users;
  v_fiche fiches_preparees;
begin
  if auth.uid() is null then
    return 'non_connecte';
  end if;
  select * into v_moi from app_users where id = auth.uid();
  if not found or v_moi.is_guest or v_moi.invitation_code is null then
    return 'aucune';
  end if;
  select f.* into v_fiche
    from fiches_preparees f
    join invitation_codes i on i.code = f.code
   where f.code = v_moi.invitation_code and i.max_uses = 1
   for update of f;
  if not found then
    return 'aucune';
  end if;
  if v_fiche.copiee_at is not null then
    return 'deja';
  end if;
  if v_moi.consentement_fiche_at is null then
    return 'en_attente';
  end if;
  insert into talent_fiches (user_id, fiche, source, methode, consentement_at)
    values (v_moi.id, v_fiche.fiche, 'coach', v_fiche.methode, v_moi.consentement_fiche_at)
    on conflict (user_id) do nothing;
  if not found then
    return 'deja';
  end if;
  update fiches_preparees set copiee_at = now() where code = v_fiche.code;
  return 'copiee';
end $$;

revoke all on function public.recevoir_fiche_preparee() from public, anon;
grant execute on function public.recevoir_fiche_preparee() to authenticated;

-- La case cochée : garde la date du premier accord, puis copie la fiche préparée s'il y en a une.
create or replace function public.accepter_stockage_fiche() returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return 'non_connecte';
  end if;
  update app_users set consentement_fiche_at = coalesce(consentement_fiche_at, now())
   where id = auth.uid() and not is_guest;
  if not found then
    return 'invite';
  end if;
  return public.recevoir_fiche_preparee();
end $$;

revoke all on function public.accepter_stockage_fiche() from public, anon;
grant execute on function public.accepter_stockage_fiche() to authenticated;

-- 4. Demandes pour rejoindre un groupe M3
create table if not exists public.demandes_groupe_m3 (
  user_id uuid primary key references public.app_users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.demandes_groupe_m3 enable row level security;
revoke all on public.demandes_groupe_m3 from anon, authenticated;
grant select on public.demandes_groupe_m3 to authenticated;

drop policy if exists "sa demande" on public.demandes_groupe_m3;
create policy "sa demande" on public.demandes_groupe_m3 for select using (user_id = auth.uid());

create or replace function public.demander_groupe_m3() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_le timestamptz;
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  if not public.est_vip() then
    raise exception 'RESERVE_VIP';
  end if;
  insert into demandes_groupe_m3 (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select created_at into v_le from demandes_groupe_m3 where user_id = auth.uid();
  return v_le;
end $$;

revoke all on function public.demander_groupe_m3() from public, anon;
grant execute on function public.demander_groupe_m3() to authenticated;

-- Les demandes reçues par le coach (ses clients seulement), les plus récentes d'abord.
create or replace function public.demandes_groupe_m3_coach()
returns table (user_id uuid, first_name text, email text, niveau text, demande_le timestamptz)
language sql stable security definer set search_path = public as $$
  select d.user_id, u.first_name, u.email, i.niveau, d.created_at
    from demandes_groupe_m3 d
    join app_users u on u.id = d.user_id
    left join invitation_codes i on i.code = u.invitation_code
   where public.is_coach() and u.coach_id = auth.uid()
   order by d.created_at desc;
$$;

revoke all on function public.demandes_groupe_m3_coach() from public, anon;
grant execute on function public.demandes_groupe_m3_coach() to authenticated;

-- 5. Suppression de son propre compte : la fiche préparée pour son code part avec lui.
create or replace function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  if exists (select 1 from public.app_users where id = auth.uid() and role = 'coach') then
    raise exception 'COMPTE_COACH';
  end if;
  delete from public.fiches_preparees f
   using public.app_users u, public.invitation_codes i
   where u.id = auth.uid() and f.code = u.invitation_code and i.code = f.code and i.max_uses = 1;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

notify pgrst, 'reload schema';
