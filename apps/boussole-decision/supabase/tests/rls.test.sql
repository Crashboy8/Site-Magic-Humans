-- Tests de sécurité et d'intégrité du schéma, sur un Postgres nu.
-- Lancement : npm run test:db  (voir scripts/test-db.sh)
\set ON_ERROR_STOP 1
\pset tuples_only on
set client_min_messages = warning;

create or replace function pg_temp.expect_error(p_sql text, p_fragment text) returns void
language plpgsql as $$
begin
  execute p_sql;
  raise exception 'ÉCHEC : aucune erreur pour « % »', p_sql;
exception when others then
  if sqlerrm like 'ÉCHEC%' then raise; end if;
  if position(p_fragment in sqlerrm) = 0 then
    raise exception 'ÉCHEC : erreur inattendue pour « % » : %', p_sql, sqlerrm;
  end if;
end $$;

create or replace function pg_temp.check(p_ok boolean, p_label text) returns void
language plpgsql as $$
begin
  if not coalesce(p_ok, false) then raise exception 'ÉCHEC : %', p_label; end if;
  raise notice 'ok - %', p_label;
end $$;
set client_min_messages = notice;

-- Inscription -----------------------------------------------------------------
select pg_temp.expect_error(
  $$insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-00000000000f', 'x@test.fr', '{"invitation_code":"FAUX-CODE"}')$$,
  'CODE_INVITATION_INVALIDE');

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000c0', 'coach@test.fr', '{"invitation_code":"boussole-test-2026","first_name":"Pierre"}'),
  ('00000000-0000-0000-0000-0000000000a1', 'alice@test.fr', '{"invitation_code":"BOUSSOLE-TEST-2026","first_name":"Alice"}'),
  ('00000000-0000-0000-0000-0000000000b2', 'bob@test.fr', '{"invitation_code":"BOUSSOLE-TEST-2026","first_name":"Bob"}');

select pg_temp.check((select used_count from invitation_codes where code = 'BOUSSOLE-TEST-2026') = 3,
  'le compteur du code augmente à chaque inscription');
select pg_temp.check((select first_name from app_users where email = 'alice@test.fr') = 'Alice',
  'le prénom est repris des métadonnées');

select public.promote_to_coach('COACH@test.fr');
select pg_temp.check((select count(*) from app_users where coach_id = '00000000-0000-0000-0000-0000000000c0') = 2,
  'les coachés sont rattachés au coach');

insert into invitation_codes (code, max_uses, used_count) values ('PLEIN-0001', 1, 1);
select pg_temp.expect_error(
  $$insert into auth.users (email, raw_user_meta_data) values ('y@test.fr', '{"invitation_code":"PLEIN-0001"}')$$,
  'CODE_INVITATION_INVALIDE');

-- Alice crée ses données -----------------------------------------------------------
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select pg_temp.check(public.check_invitation_code('boussole-test-2026'), 'vérification du code valide');
select pg_temp.check(not public.check_invitation_code('PLEIN-0001'), 'un code épuisé est refusé');

select public.create_profile('Reconversion 2026', 'Phase de test') as profile_id \gset
select pg_temp.check((select count(*) from versions where profile_id = :'profile_id') = 1,
  'un profil naît avec une version Brouillon');
select id as version_id from versions where profile_id = :'profile_id' \gset
select pg_temp.check((select count(*) from categories where version_id = :'version_id') = 5,
  'une version naît avec les 5 catégories par défaut');

select pg_temp.check(
  (select array_agg(key order by position) from categories where version_id = :'version_id')
    = array['contexte_declencheur', 'anti_contexte', 'valeurs_culture', 'conditions_vie', 'remuneration'],
  'les catégories MO2I sont créées dans l''ordre');

insert into criteria (version_id, category_id, label, importance, non_negotiable, direction)
  select :'version_id', id, 'Raconter des histoires qui donnent envie d''agir', 'critique', true, 'TOWARDS'
    from categories where version_id = :'version_id' and key = 'contexte_declencheur';
select pg_temp.expect_error(
  format($$insert into criteria (version_id, category_id, label, importance)
           select %L, id, 'Importance inconnue', 'essentiel' from categories
            where version_id = %L and key = 'anti_contexte'$$, :'version_id', :'version_id'),
  'invalid input value');
insert into opportunities (version_id, name) values (:'version_id', 'PME éco-construction');
insert into evaluations (criterion_id, opportunity_id, version_id, value)
  select c.id, o.id, :'version_id', 'p75' from criteria c, opportunities o
   where c.version_id = :'version_id' and o.version_id = :'version_id';
select pg_temp.check((select user_id from evaluations limit 1) = '00000000-0000-0000-0000-0000000000a1',
  'le propriétaire est déduit de la version');

-- Bob ne voit rien et ne peut rien écrire chez Alice -----------------------------------
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select count(*) from profiles) = 0, 'Bob ne voit pas les profils d''Alice');
select pg_temp.check((select count(*) from evaluations) = 0, 'Bob ne voit pas les évaluations d''Alice');
select pg_temp.check((select count(*) from app_users) = 1, 'Bob ne voit que sa fiche');
select pg_temp.expect_error(
  format($$insert into opportunities (version_id, name) values (%L, 'Intrus')$$, :'version_id'),
  'row-level security');
select pg_temp.expect_error(
  format($$select public.duplicate_version(%L, 'V-intrus')$$, :'version_id'), 'VERSION_INTROUVABLE');
update profiles set name = 'piraté' where id = :'profile_id';
select pg_temp.expect_error($$update app_users set role = 'coach'$$, 'permission denied');

-- Sans partage, le coach ne voit RIEN ----------------------------------------------
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) from profiles) = 0, 'profil non partagé : le coach ne voit pas le profil');
select pg_temp.check((select count(*) from versions) = 0, 'profil non partagé : le coach ne voit pas les versions');
select pg_temp.check((select count(*) from criteria) = 0, 'profil non partagé : le coach ne voit pas les critères');
select pg_temp.check((select count(*) from evaluations) = 0, 'profil non partagé : le coach ne voit pas les évaluations');
select pg_temp.check((select count(*) from app_users) = 3, 'le coach voit la fiche (nom, email) de ses coachés');
select pg_temp.check(
  (select shared_profiles from public.coach_dashboard() where first_name = 'Alice') = 0
  and (select last_activity_at is not null from public.coach_dashboard() where first_name = 'Alice'),
  'tableau de bord : dernière activité visible, aucun profil partagé');
select pg_temp.expect_error(
  format($$insert into comments (version_id, target_type, target_id, body) values (%L, 'version', %L, 'Bravo')$$,
         :'version_id', :'version_id'),
  'row-level security');
update profiles set shared_with_coach = true where id = :'profile_id';
insert into invitation_codes (code, coach_id, label) values ('NOUVEAU-CODE', auth.uid(), 'Pour Claire');
select pg_temp.check((select count(*) from invitation_codes) = 2, 'le coach gère ses codes (et ne voit pas ceux des autres)');
select pg_temp.check((select max_uses from invitation_codes where code = 'NOUVEAU-CODE') = 1, 'un nouveau code est à usage unique');
update invitation_codes set disabled_at = now() where code = 'NOUVEAU-CODE';
select pg_temp.check(not public.check_invitation_code('NOUVEAU-CODE'), 'un code désactivé est refusé au formulaire');
reset role;
select pg_temp.expect_error(
  $$insert into auth.users (email, raw_user_meta_data) values ('claire@test.fr', '{"invitation_code":"NOUVEAU-CODE"}')$$,
  'CODE_INVITATION_INVALIDE');
set role authenticated;

-- Alice partage son profil -------------------------------------------------------------
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.check((select not shared_with_coach from profiles where id = :'profile_id'),
  'le coach ne peut pas activer le partage à la place du coaché');
update profiles set shared_with_coach = true where id = :'profile_id';
select pg_temp.check((select shared_at is not null from profiles where id = :'profile_id'), 'la date de partage est posée');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) from profiles) = 1, 'profil partagé : le coach voit le profil');
select pg_temp.check((select count(*) from criteria) = 1, 'profil partagé : le coach voit les critères');
select pg_temp.check((select count(*) from evaluations) = 1, 'profil partagé : le coach voit les évaluations');
select pg_temp.check((select shared_profiles from public.coach_dashboard() where first_name = 'Alice') = 1,
  'tableau de bord : un profil partagé');
update profiles set name = 'modifié par le coach' where id = :'profile_id';
update criteria set label = 'modifié par le coach';
delete from evaluations;
select pg_temp.expect_error(
  format($$insert into opportunities (version_id, name) values (%L, 'Ajout du coach')$$, :'version_id'),
  'row-level security');

insert into comments (version_id, target_type, target_id, body)
  values (:'version_id', 'version', :'version_id', 'Belle progression depuis la dernière séance.');
insert into comments (version_id, target_type, target_id, body)
  select :'version_id', 'criterion', id, 'Ce critère mérite-t-il vraiment 5 ?' from criteria limit 1;
select pg_temp.expect_error(
  format($$insert into comments (version_id, target_type, target_id, body) values (%L, 'criterion', %L, 'x')$$,
         :'version_id', :'version_id'),
  'CIBLE_INVALIDE');
select pg_temp.check((select count(*) from comments) = 2, 'le coach commente une version et un critère');
select pg_temp.check((select bool_and(owner_id = '00000000-0000-0000-0000-0000000000a1') from comments),
  'le destinataire est le coaché propriétaire');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select count(*) from comments) = 0, 'Bob ne voit pas les commentaires adressés à Alice');
select pg_temp.expect_error(
  format($$insert into comments (version_id, target_type, target_id, body) values (%L, 'version', %L, 'Intrus')$$,
         :'version_id', :'version_id'),
  'row-level security');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.check((select count(*) from comments where read_at is null) = 2, 'Alice a 2 commentaires non lus');
update comments set read_at = now();
select pg_temp.check((select count(*) from comments where read_at is null) = 0, 'Alice marque les commentaires comme lus');
select pg_temp.expect_error($$update comments set body = 'réécrit'$$, 'permission denied');
select pg_temp.expect_error(
  format($$insert into comments (version_id, target_type, target_id, body) values (%L, 'version', %L, 'auto')$$,
         :'version_id', :'version_id'),
  'row-level security');

-- Alice : duplication, verrou, suppression ---------------------------------------------
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.check((select name from profiles where id = :'profile_id') = 'Reconversion 2026',
  'ni Bob ni le coach n''ont pu renommer le profil');
select pg_temp.check((select label from criteria limit 1) like 'Raconter%' and (select count(*) from evaluations) = 1,
  'le coach n''a pu ni modifier un critère ni supprimer une évaluation');
select pg_temp.expect_error($$insert into invitation_codes (code, coach_id) values ('ALICE-CODE', auth.uid())$$,
  'row-level security');

select public.duplicate_version(:'version_id', 'V1') as v1_id \gset
select pg_temp.check(
  (select count(*) from categories where version_id = :'v1_id') = 5
  and (select count(*) from criteria where version_id = :'v1_id') = 1
  and (select count(*) from opportunities where version_id = :'v1_id') = 1
  and (select count(*) from evaluations where version_id = :'v1_id' and value = 'p75') = 1,
  'la duplication copie tout le contenu');
select pg_temp.check(
  (select category_id from criteria where version_id = :'v1_id')
    in (select id from categories where version_id = :'v1_id'),
  'les critères copiés pointent vers les catégories copiées');
select pg_temp.check(
  (select importance = 'critique' and non_negotiable and direction = 'TOWARDS' from criteria where version_id = :'v1_id'),
  'la duplication conserve importance, non-négociable et direction des critères');

update versions set status = 'finalisee' where id = :'version_id';
select pg_temp.check((select finalized_at is not null from versions where id = :'version_id'),
  'la date de finalisation est posée');
select pg_temp.expect_error(
  format($$update evaluations set value = 'oui' where version_id = %L$$, :'version_id'), 'VERSION_FINALISEE');
select pg_temp.expect_error(
  format($$update versions set insight_note = 'x' where id = %L$$, :'version_id'), 'VERSION_FINALISEE');
update versions set name = 'Brouillon (final)' where id = :'version_id';
update versions set status = 'brouillon' where id = :'version_id';
update evaluations set value = 'oui' where version_id = :'version_id';
select pg_temp.check((select value from evaluations where version_id = :'version_id') = 'oui',
  'une version rouverte redevient modifiable');

update versions set status = 'finalisee' where id = :'version_id';
delete from versions where id = :'version_id';
select pg_temp.check((select count(*) from criteria where version_id = :'version_id') = 0,
  'une version finalisée peut être supprimée avec son contenu');

-- Révocation du partage ------------------------------------------------------------
update profiles set shared_with_coach = false where id = :'profile_id';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) from profiles) = 0 and (select count(*) from versions) = 0,
  'partage révoqué : le coach ne voit plus rien');
select pg_temp.check((select count(*) from comments) = 0, 'partage révoqué : ni ses commentaires');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

delete from profiles where id = :'profile_id';
select pg_temp.check((select count(*) from versions) = 0, 'supprimer un profil supprime ses versions');


-- Inscription sans code et essais sans compte ------------------------------------------
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000d4', 'dora@test.fr', '{"first_name":"Dora"}');
select pg_temp.check((select coach_id from app_users where email = 'dora@test.fr') = '00000000-0000-0000-0000-0000000000c0',
  'inscription sans code : rattachée au coach principal');
select pg_temp.check((select invitation_code is null from app_users where email = 'dora@test.fr'), 'aucun code enregistré');

insert into auth.users (id, email, is_anonymous) values ('00000000-0000-0000-0000-0000000000e5', null, true);
select pg_temp.check((select is_guest and email = '' and coach_id = '00000000-0000-0000-0000-0000000000c0'
                        from app_users where id = '00000000-0000-0000-0000-0000000000e5'),
  'essai sans compte : invité créé sans email ni code');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e5';
select public.create_profile('Mon premier essai') as guest_profile \gset
update profiles set shared_with_coach = true where id = :'guest_profile';
select pg_temp.check((select count(*) from profiles) = 1, 'l''invité travaille normalement dans son espace');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check(not exists (select 1 from public.coach_dashboard() where id = '00000000-0000-0000-0000-0000000000e5'),
  'le coach ne voit pas les essais non sauvegardés dans son tableau de bord');
select pg_temp.check((select count(*) from profiles where id = :'guest_profile') = 0,
  'le coach ne voit pas le travail d''un invité, même partagé');

reset role;
update auth.users set email = 'eve@test.fr', is_anonymous = false where id = '00000000-0000-0000-0000-0000000000e5';
select pg_temp.check((select not is_guest and email = 'eve@test.fr' from app_users where id = '00000000-0000-0000-0000-0000000000e5'),
  'l''invité qui confirme son email devient un compte normal');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e5';
select pg_temp.check((select count(*) from profiles) = 1, 'il garde tout son travail');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) from profiles where id = :'guest_profile') = 1,
  'une fois sauvegardé et partagé, le coach voit le profil');

reset role;
insert into auth.users (id, is_anonymous, created_at) values
  ('00000000-0000-0000-0000-0000000000f6', true, now() - interval '40 days'),
  ('00000000-0000-0000-0000-0000000000f7', true, now() - interval '5 days');
select pg_temp.check(public.purge_stale_guests(30) = 1, 'les essais de plus de 30 jours sont supprimés');
select pg_temp.check(
  not exists (select 1 from app_users where id = '00000000-0000-0000-0000-0000000000f6')
  and exists (select 1 from app_users where id = '00000000-0000-0000-0000-0000000000f7'),
  'seuls les essais anciens disparaissent, avec leur fiche');
set role authenticated;
select pg_temp.expect_error($$select public.purge_stale_guests(0)$$, 'permission denied');

reset role;

-- Essai rattaché à un compte existant ------------------------------------------------------
insert into auth.users (id, email, is_anonymous) values ('00000000-0000-0000-0000-0000000000a9', null, true);
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a9';
select public.create_profile('Essai à rattacher') as essai_profile \gset
select id as essai_version from versions where profile_id = :'essai_profile' \gset
insert into opportunities (version_id, name) values (:'essai_version', 'Poste A');
update versions set status = 'finalisee' where id = :'essai_version';
select public.create_guest_transfer() as jeton \gset
select pg_temp.expect_error($$select public.claim_guest_transfer(gen_random_uuid())$$, 'COMPTE_REQUIS');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.expect_error($$select public.create_guest_transfer()$$, 'RESERVE_AUX_ESSAIS');
select pg_temp.check(public.claim_guest_transfer(gen_random_uuid()) = 0, 'un jeton inconnu ne transfère rien');
select pg_temp.check(public.claim_guest_transfer(:'jeton') = 1, 'Bob récupère le profil de son essai');
select pg_temp.check(
  (select count(*) from profiles where id = :'essai_profile') = 1
  and (select count(*) from opportunities where version_id = :'essai_version') = 1
  and (select user_id from categories where version_id = :'essai_version' limit 1) = '00000000-0000-0000-0000-0000000000b2',
  'tout le contenu de l''essai (même finalisé) appartient maintenant à Bob');
select pg_temp.check(public.claim_guest_transfer(:'jeton') = 0, 'un jeton ne sert qu''une fois');
reset role;
select pg_temp.check(not exists (select 1 from app_users where id = '00000000-0000-0000-0000-0000000000a9'),
  'le compte invité vide est supprimé');
select pg_temp.check((select status from versions where id = :'essai_version') = 'finalisee', 'le verrou reste actif après transfert');

-- Barème personnalisé ---------------------------------------------------------------------
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select public.create_profile('Barème') as bareme_profile \gset
select id as bareme_version from versions where profile_id = :'bareme_profile' \gset
select pg_temp.check((select importance_weights ->> 'critique' from versions where id = :'bareme_version') = '5',
  'une nouvelle version reçoit le barème conseillé');
update versions set importance_weights = importance_weights || '{"critique": 8}' where id = :'bareme_version';
select public.duplicate_version(:'bareme_version', 'Copie') as bareme_copie \gset
select pg_temp.check((select importance_weights ->> 'critique' from versions where id = :'bareme_copie') = '8',
  'une copie reprend le barème de l''originale');
insert into opportunities (version_id, name) values (:'bareme_copie', 'Ailleurs') returning id as bareme_copie_opp \gset
update versions set status = 'finalisee' where id = :'bareme_version';
select pg_temp.expect_error(
  format($$update versions set importance_weights = '{"critique": 1}' where id = %L$$, :'bareme_version'), 'VERSION_FINALISEE');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
update versions set importance_weights = '{"critique": 0}' where id = :'bareme_copie';
reset role;
select pg_temp.check((select importance_weights ->> 'critique' from versions where id = :'bareme_copie') = '8',
  'personne d''autre ne peut changer le barème');

-- Résultats : ressenti, projection, prochains pas -------------------------------------------
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select public.create_profile('Résultats') as res_profile \gset
select id as res_version from versions where profile_id = :'res_profile' \gset
insert into opportunities (version_id, name) values (:'res_version', 'Choisie') returning id as res_opp \gset
update versions set ranking_agreement = 'pas_vraiment', projection_feeling = 'soulagement', chosen_opportunity_id = :'res_opp',
  next_steps = '["Appeler Marie", "Journée d''immersion"]' where id = :'res_version';
select pg_temp.check((select ranking_agreement from versions where id = :'res_version') = 'pas_vraiment', 'le ressenti est enregistré');
select pg_temp.expect_error(
  format($$update versions set ranking_agreement = 'peut-etre' where id = %L$$, :'res_version'), 'ranking_agreement');
select pg_temp.expect_error(
  format($$update versions set chosen_opportunity_id = %L where id = %L$$, :'bareme_copie_opp', :'res_version'), 'versions_chosen_opportunity_fk');
select public.duplicate_version(:'res_version', 'Copie résultats') as res_copie \gset
select pg_temp.check(
  (select o.name from versions v join opportunities o on o.id = v.chosen_opportunity_id where v.id = :'res_copie') = 'Choisie'
  and (select chosen_opportunity_id from versions where id = :'res_copie') <> :'res_opp'
  and (select jsonb_array_length(next_steps) from versions where id = :'res_copie') = 2,
  'une copie reprend le ressenti, les prochains pas et pointe vers sa propre opportunité choisie');
delete from opportunities where id = :'res_opp';
select pg_temp.check((select chosen_opportunity_id from versions where id = :'res_version') is null,
  'supprimer l''opportunité choisie la retire des prochains pas');
update versions set status = 'finalisee' where id = :'res_copie';
select pg_temp.expect_error(
  format($$update versions set next_steps = '[]' where id = %L$$, :'res_copie'), 'VERSION_FINALISEE');
update profiles set failure_situations = 'Trop isolé, derrière un écran' where id = :'res_profile';
select pg_temp.check((select failure_situations from profiles where id = :'res_profile') like 'Trop isolé%', 'les contextes d''échec vécus sont enregistrés');
reset role;

\echo 'Tous les tests de base de données sont passés.'
