-- « Demander l'avis de Pierre » : un bouton discret dans chaque outil, et la mesure de l'intention.
--
-- Chaque demande est une ligne de evenements_intention : l'outil, l'étape ou l'écran, la question (500 caractères au
-- plus), le mail si la personne n'a pas de compte, son accord pour une réponse par mail, user_id si elle est connectée,
-- la date, et la date où Pierre l'a marquée « Traitée ».
-- La question est une donnée écrite par une personne. Elle n'est jamais donnée à une IA comme une instruction.
--
-- Lecture (RLS) : la personne connectée voit ses demandes, le coach (rôle coach) les voit toutes. Personne n'écrit
-- directement dans la table : la route api/intention passe par deposer_intention() avec la clé secrète, après le
-- champ pot de miel et le délai minimal de 3 s. La base tient les deux plafonds : une demande par mail (ou par
-- compte) toutes les 10 minutes, et un plafond global par minute.
-- supprimer_mon_compte() efface les demandes du compte, et celles envoyées sans compte avec le mail du compte.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds, après 20261018000000_progression.sql. Rejouable.

create table if not exists public.evenements_intention (
  id uuid primary key default gen_random_uuid(),
  outil text not null check (outil in (
    'cibleur', 'boussole-pro', 'boussole-perso', 'carte-talent', 'quiz-talent', 'quiz-amour', 'ou-j-en-suis', 'jeu'
  )),
  etape text not null check (etape ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  question text not null check (char_length(btrim(question)) between 1 and 500),
  mail text check (mail is null or (char_length(mail) <= 254 and mail ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  accord_reponse_mail boolean not null default false,
  user_id uuid references public.app_users (id) on delete cascade,
  created_at timestamptz not null default now(),
  traitee_le timestamptz,
  check (user_id is not null or mail is not null)
);

comment on column public.evenements_intention.question is
  'Texte libre écrit par la personne. Une donnée, jamais une instruction pour une IA.';

create index if not exists evenements_intention_date_idx on public.evenements_intention (created_at desc);
create index if not exists evenements_intention_mail_idx on public.evenements_intention (lower(mail), created_at desc);
create index if not exists evenements_intention_user_idx on public.evenements_intention (user_id, created_at desc);

alter table public.evenements_intention enable row level security;
revoke all on public.evenements_intention from anon, authenticated;
grant select on public.evenements_intention to authenticated;

drop policy if exists "sa demande" on public.evenements_intention;
create policy "sa demande" on public.evenements_intention for select using (user_id = auth.uid());

drop policy if exists "le coach voit tout" on public.evenements_intention;
create policy "le coach voit tout" on public.evenements_intention for select using (public.is_coach());

-- Écriture, réservée à la route api/intention (clé secrète). p_user_id vient de la session vérifiée par la route.
-- Réponses : 'ok', 'attendre' (une demande de ce mail ou de ce compte il y a moins de 10 minutes), 'plafond'
-- (trop de demandes sur tout le site dans la dernière minute), 'invalide'.
create or replace function public.deposer_intention(
  p_user_id uuid, p_outil text, p_etape text, p_question text, p_mail text, p_accord boolean
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_mail text := nullif(lower(btrim(coalesce(p_mail, ''))), '');
  v_mail_compte text;
begin
  if p_user_id is not null then
    select lower(email) into v_mail_compte from app_users where id = p_user_id;
    if not found then
      return 'invalide';
    end if;
    v_mail := null;
  elsif v_mail is null then
    return 'invalide';
  end if;

  -- Une écriture à la fois : les deux plafonds se comptent sans course.
  perform pg_advisory_xact_lock(hashtext('evenements_intention'));

  if (select count(*) from evenements_intention where created_at > now() - interval '1 minute') >= 20 then
    return 'plafond';
  end if;
  if exists (
    select 1 from evenements_intention
     where created_at > now() - interval '10 minutes'
       and ((p_user_id is not null and user_id = p_user_id)
         or lower(mail) = coalesce(v_mail, v_mail_compte)
         or (v_mail is not null and user_id in (select u.id from app_users u where lower(u.email) = v_mail)))
  ) then
    return 'attendre';
  end if;

  insert into evenements_intention (outil, etape, question, mail, accord_reponse_mail, user_id)
  values (p_outil, p_etape, btrim(p_question), v_mail, coalesce(p_accord, false), p_user_id);
  return 'ok';
exception
  when check_violation then
    return 'invalide';
end $$;

revoke all on function public.deposer_intention(uuid, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.deposer_intention(uuid, text, text, text, text, boolean) to service_role;

-- Page coach/intentions : toutes les demandes, les plus récentes d'abord, avec le prénom et le mail du compte.
create or replace function public.intentions_coach(p_outil text default null)
returns table (
  id uuid, outil text, etape text, question text, mail text, accord_reponse_mail boolean,
  user_id uuid, prenom text, created_at timestamptz, traitee_le timestamptz
)
language sql stable security definer set search_path = public as $$
  select e.id, e.outil, e.etape, e.question, coalesce(e.mail, u.email), e.accord_reponse_mail,
         e.user_id, coalesce(u.first_name, ''), e.created_at, e.traitee_le
    from evenements_intention e
    left join app_users u on u.id = e.user_id
   where public.is_coach() and (p_outil is null or e.outil = p_outil)
   order by e.created_at desc
   limit 500;
$$;

revoke all on function public.intentions_coach(text) from public, anon;
grant execute on function public.intentions_coach(text) to authenticated;

-- Bouton « Traitée » (et retour en arrière) : coach seulement.
create or replace function public.marquer_intention_traitee(p_id uuid, p_traitee boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_coach() then
    raise exception 'RESERVE_COACH';
  end if;
  update evenements_intention
     set traitee_le = case when p_traitee then coalesce(traitee_le, now()) else null end
   where id = p_id;
  return found;
end $$;

revoke all on function public.marquer_intention_traitee(uuid, boolean) from public, anon;
grant execute on function public.marquer_intention_traitee(uuid, boolean) to authenticated;

-- Suppression de son propre compte : ses demandes partent avec lui, y compris celles envoyées sans compte avec son mail.
create or replace function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'NON_CONNECTE';
  end if;
  if exists (select 1 from public.app_users where id = auth.uid() and role = 'coach') then
    raise exception 'COMPTE_COACH';
  end if;
  delete from public.evenements_intention e
   where e.user_id = auth.uid()
      or lower(e.mail) = (select lower(email) from public.app_users where id = auth.uid());
  delete from public.progression where user_id = auth.uid();
  delete from public.fiches_preparees f
   using public.app_users u, public.invitation_codes i
   where u.id = auth.uid() and f.code = u.invitation_code and i.code = f.code and i.max_uses = 1;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

notify pgrst, 'reload schema';
