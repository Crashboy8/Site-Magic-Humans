-- Accès client par code (Mon espace).
--
-- Un compte est « client » quand il a été ouvert ou activé avec un code de Pierre (app_users.invitation_code).
-- À l'inscription, rien ne change : handle_new_user garde déjà le code et rattache le compte au coach du code.
-- Ce fichier ajoute :
-- 1. activer_code_client(code) : un compte qui existe déjà active un code (lien /client/ reçu par mail).
-- 2. invitation_codes.lien_fiche : le lien Notion de la fiche du client, mis par Pierre en créant le code
--    (un code pour une seule personne uniquement), prérempli sur l'écran d'import.
-- 3. mon_acces_client() : le client lit son propre code, le prénom de son coach et ce lien.
-- Rejouable sans risque.

-- 2. Lien Notion de la fiche, rattaché au code
alter table public.invitation_codes add column if not exists lien_fiche text;
alter table public.invitation_codes drop constraint if exists invitation_codes_lien_fiche_check;
alter table public.invitation_codes add constraint invitation_codes_lien_fiche_check
  check (
    lien_fiche is null
    or (max_uses = 1 and length(lien_fiche) <= 500 and lien_fiche ~* '^https://([a-z0-9-]+\.)*notion\.(so|site)/')
  );

-- 1. Activer un code sur son compte
create or replace function public.activer_code_client(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_moi app_users;
  v_invitation invitation_codes;
begin
  if auth.uid() is null then
    return 'non_connecte';
  end if;
  select * into v_moi from app_users where id = auth.uid() for update;
  if not found or v_moi.is_guest then
    return 'invite';
  end if;
  -- Déjà client (ce code ou un autre) : rien ne change, aucun usage n'est compté.
  if v_moi.invitation_code is not null then
    return 'deja';
  end if;
  select * into v_invitation from invitation_codes where code = v_code for update;
  if not found
     or v_invitation.disabled_at is not null
     or v_invitation.used_count >= v_invitation.max_uses
     or (v_invitation.expires_at is not null and v_invitation.expires_at < now()) then
    return 'invalide';
  end if;
  update invitation_codes set used_count = used_count + 1 where code = v_code;
  update app_users
     set invitation_code = v_code,
         coach_id = case when role = 'coach' then coach_id else coalesce(v_invitation.coach_id, coach_id) end
   where id = auth.uid();
  return 'ok';
end $$;

revoke all on function public.activer_code_client(text) from public, anon;
grant execute on function public.activer_code_client(text) to authenticated;

-- 3. Son propre accès client
create or replace function public.mon_acces_client()
returns table (code text, coach_prenom text, lien_fiche text)
language sql stable security definer set search_path = public as $$
  select u.invitation_code, coalesce(c.first_name, ''), i.lien_fiche
    from app_users u
    left join invitation_codes i on i.code = u.invitation_code
    left join app_users c on c.id = u.coach_id
   where u.id = auth.uid() and u.invitation_code is not null;
$$;

revoke all on function public.mon_acces_client() from public, anon;
grant execute on function public.mon_acces_client() to authenticated;

notify pgrst, 'reload schema';
