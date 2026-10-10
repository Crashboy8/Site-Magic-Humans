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

-- Ma Cible : compteur anti-abus ---------------------------------------------------
set role anon;
select pg_temp.expect_error(
  $$select * from public.ma_cible_consommer(repeat('a', 64), 'resultat', 3, 10)$$, 'permission denied');
select pg_temp.expect_error(
  $$select * from public.ma_cible_autoriser(repeat('a', 64), 'resultat', 3, 10)$$, 'permission denied');
reset role;
set role authenticated;
select pg_temp.expect_error(
  $$select * from public.ma_cible_consommer(repeat('a', 64), 'resultat', 3, 10)$$, 'permission denied');
select pg_temp.expect_error(
  $$select * from public.ma_cible_autoriser(repeat('a', 64), 'resultat', 3, 10)$$, 'permission denied');
reset role;

set role service_role;
select ok as r_ok from public.ma_cible_consommer(repeat('a', 64), 'resultat', 2, 10) \gset
select pg_temp.check(:'r_ok' = 't', 'ma cible : le premier appel est accepté');
select ok as r_ok from public.ma_cible_consommer(repeat('a', 64), 'resultat', 2, 10) \gset
select pg_temp.check(:'r_ok' = 't', 'ma cible : le deuxième appel est accepté (plafond de 2)');
select ok as r_ok, motif as r_motif, n_ip as r_n from public.ma_cible_consommer(repeat('a', 64), 'resultat', 2, 10) \gset
select pg_temp.check(:'r_ok' = 'f' and :'r_motif' = 'ip' and :'r_n' = '3', 'ma cible : au-delà du plafond par IP, refus avec le motif ip');
select ok as r_ok, motif as r_motif from public.ma_cible_consommer(repeat('b', 64), 'cadrage', 5, 10) \gset
select pg_temp.check(:'r_ok' = 't', 'ma cible : les étapes ont des compteurs séparés');
select ok as r_ok, motif as r_motif from public.ma_cible_consommer(repeat('c', 64), 'resultat', 5, 3) \gset
select pg_temp.check(:'r_ok' = 'f' and :'r_motif' = 'global', 'ma cible : au-delà du plafond global, refus avec le motif global');
select ok as r_ok, motif as r_motif from public.ma_cible_consommer('pas-une-empreinte', 'resultat', 5, 10) \gset
select pg_temp.check(:'r_ok' = 'f' and :'r_motif' = 'invalide', 'ma cible : une clé qui n''est pas une empreinte sha256 est refusée');
select ok as syn1_ok from public.ma_cible_consommer(repeat('d', 64), 'synthese', 2, 10) \gset
select pg_temp.check(:'syn1_ok' = 't', 'ma cible : synthese, premier appel accepté');
select ok as syn2_ok from public.ma_cible_consommer(repeat('d', 64), 'synthese', 2, 10) \gset
select pg_temp.check(:'syn2_ok' = 't', 'ma cible : synthese, deuxième appel accepté');
select ok as syn3_ok, motif as syn3_motif from public.ma_cible_consommer(repeat('d', 64), 'synthese', 2, 10) \gset
select pg_temp.check(:'syn3_ok' = 'f' and :'syn3_motif' = 'ip', 'ma cible : synthese, au-delà du plafond, motif ip');
select ok as app_ok from public.ma_cible_consommer(repeat('f', 64), 'approfondir', 2, 10) \gset
select pg_temp.check(:'app_ok' = 't', 'ma cible : approfondir est accepté');
select ok as autre_ok, motif as autre_motif from public.ma_cible_consommer(repeat('e', 64), 'autre', 5, 10) \gset
select pg_temp.check(:'autre_ok' = 'f' and :'autre_motif' = 'invalide', 'ma cible : une étape inconnue est refusée');
reset role;
select pg_temp.check((select count(*) from ma_cible_quota where cle <> 'global' and cle !~ '^[0-9a-f]{64}$') = 0,
  'ma cible : la table ne contient que des empreintes et des nombres');

set role anon;
select pg_temp.check((select count(*) from ma_cible_quota) = 0, 'ma cible : anon ne voit aucune ligne du compteur');
reset role;
set role authenticated;
select pg_temp.check((select count(*) from ma_cible_quota) = 0, 'ma cible : authenticated ne voit aucune ligne du compteur');
reset role;
select pg_temp.check((select count(*) from ma_cible_quota) > 0, 'ma cible : le compteur est bien alimenté');

set role service_role;
select ok as a_ok, n_ip as a_n from public.ma_cible_autoriser(repeat('e', 64), 'resultat', 3, 10) \gset
select pg_temp.check(:'a_ok' = 't' and :'a_n' = '0', 'ma cible : autoriser accepte sans avoir compté');
select pg_temp.check((select count(*) from ma_cible_quota where cle = repeat('e', 64)) = 0, 'ma cible : autoriser n''écrit rien');
reset role;

insert into ma_cible_reprise (cle, corps, expire) values (repeat('d', 64), '{"ok":true}'::jsonb, now() + interval '10 minutes');
set role anon;
select pg_temp.check((select count(*) from ma_cible_reprise) = 0, 'ma cible : anon ne voit pas les reprises');
reset role;
set role authenticated;
select pg_temp.check((select count(*) from ma_cible_reprise) = 0, 'ma cible : authenticated ne voit pas les reprises');
reset role;
select pg_temp.check((select count(*) from ma_cible_reprise) = 1, 'ma cible : la reprise est bien enregistrée');


-- Mon espace : fiche Talent Unique et suppression de compte -------------------------
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
insert into talent_fiches (fiche, source, methode) values ('{"v":1,"prenom":"Alice"}'::jsonb, 'manuel', 'manuel');
select pg_temp.check((select count(*) from talent_fiches) = 1, 'fiche : Alice enregistre sa fiche');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select count(*) from talent_fiches) = 0, 'fiche : Bob ne voit pas la fiche d''Alice');
with u as (update talent_fiches set source = 'collage' returning 1) select count(*) as n_maj from u \gset
select pg_temp.check(:'n_maj' = '0', 'fiche : Bob ne modifie pas la fiche d''Alice');
reset role;
select pg_temp.check((select source from talent_fiches where user_id = '00000000-0000-0000-0000-0000000000a1') = 'manuel', 'fiche : la fiche d''Alice est intacte');
set role anon;
select pg_temp.expect_error($$select count(*) from talent_fiches$$, 'permission denied');
reset role;

-- Un invité enregistre sa fiche.
insert into auth.users (id, email, is_anonymous) values ('00000000-0000-0000-0000-0000000000d3', null, true);
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000d3';
insert into talent_fiches (fiche, source, methode) values ('{"v":1,"prenom":"Invite"}'::jsonb, 'collage', 'modele');
select pg_temp.check((select count(*) from talent_fiches) = 1, 'fiche : un invité enregistre sa fiche');
reset role;

-- Où j'en suis ? : la position de chacun sur son parcours ----------------------------
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
insert into parcours_positions (voie, argent, parallele, reponses) values ('E', 2, true, '{"connaitre.quiz":"oui"}'::jsonb);
select pg_temp.check((select count(*) from parcours_positions) = 1, 'parcours : Alice enregistre sa position');
update parcours_positions set voie = 'A', raccourci = true;
select pg_temp.check((select voie = 'A' and raccourci from parcours_positions), 'parcours : Alice modifie sa position');
select pg_temp.check((select not freelance from parcours_positions), 'parcours : freelance vaut faux par défaut');
select pg_temp.expect_error($$update parcours_positions set freelance = true$$, 'parcours_positions_freelance_check');
update parcours_positions set voie = 'E', freelance = true;
select pg_temp.check((select voie = 'E' and freelance from parcours_positions), 'parcours : Alice se marque freelance qui cherche un poste en voie E');
select pg_temp.expect_error($$update parcours_positions set voie = 'A'$$, 'parcours_positions_freelance_check');
update parcours_positions set voie = 'A', freelance = false;
select pg_temp.expect_error($$insert into parcours_positions (user_id, voie) values ('00000000-0000-0000-0000-0000000000b2', 'B')$$, 'row-level security');
select pg_temp.expect_error($$update parcours_positions set voie = 'Z'$$, 'parcours_positions_voie_check');
select pg_temp.expect_error($$update parcours_positions set argent = 6$$, 'parcours_positions_argent_check');
select pg_temp.expect_error($$update parcours_positions set reponses = '[]'::jsonb$$, 'parcours_positions_reponses_check');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select count(*) from parcours_positions) = 0, 'parcours : Bob ne voit pas la position d''Alice');
with u as (update parcours_positions set voie = 'K' returning 1) select count(*) as n_maj from u \gset
select pg_temp.check(:'n_maj' = '0', 'parcours : Bob ne modifie pas la position d''Alice');
with d as (delete from parcours_positions returning 1) select count(*) as n_suppr from d \gset
select pg_temp.check(:'n_suppr' = '0', 'parcours : Bob ne supprime pas la position d''Alice');
reset role;
select pg_temp.check((select voie from parcours_positions where user_id = '00000000-0000-0000-0000-0000000000a1') = 'A', 'parcours : la position d''Alice est intacte');
set role anon;
select pg_temp.expect_error($$select count(*) from parcours_positions$$, 'permission denied');
reset role;

-- Progression : le jeu et « Où j'en suis ? », une ligne par compte, visible par la personne seule (20261018000000_progression.sql)
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
insert into progression (xp, niveau, badges, serie_jours) values (42, '2', array['premier-pas'], 3);
select pg_temp.check((select xp = 42 and niveau = '2' and badges = array['premier-pas'] and serie_jours = 3 and user_id = auth.uid() from progression),
  'progression : Alice enregistre sa progression');
update progression set xp = 60, badges = array['premier-pas', 'en-mouvement'], niveau = '5A', mis_a_jour = now();
select pg_temp.check((select xp = 60 and niveau = '5A' and cardinality(badges) = 2 from progression), 'progression : Alice modifie sa progression');
select pg_temp.expect_error($$insert into progression (user_id, xp) values ('00000000-0000-0000-0000-0000000000b2', 999)$$, 'row-level security');
select pg_temp.expect_error($$update progression set xp = -1$$, 'progression_xp_check');
select pg_temp.expect_error($$update progression set niveau = 'Expert'$$, 'progression_niveau_check');
select pg_temp.expect_error($$update progression set badges = array['<script>']$$, 'progression_badges_check');
select pg_temp.expect_error($$update progression set serie_jours = -2$$, 'progression_serie_jours_check');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select count(*) from progression) = 0, 'progression : Bob ne voit pas la progression d''Alice');
with u as (update progression set xp = 0 returning 1) select count(*) as n_maj from u \gset
select pg_temp.check(:'n_maj' = '0', 'progression : Bob ne modifie pas la progression d''Alice');
with d as (delete from progression returning 1) select count(*) as n_suppr from d \gset
select pg_temp.check(:'n_suppr' = '0', 'progression : Bob ne supprime pas la progression d''Alice');
insert into progression (xp) values (5);
select pg_temp.check((select count(*) from progression) = 1, 'progression : Bob ne voit que la sienne');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) from progression) = 0, 'progression : le coach ne voit la progression de personne');
reset role;
select pg_temp.check((select xp from progression where user_id = '00000000-0000-0000-0000-0000000000a1') = 60, 'progression : celle d''Alice est intacte');
set role anon;
select pg_temp.expect_error($$select count(*) from progression$$, 'permission denied');
reset role;

-- Suppression de compte : tout part, le voisin reste.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
select public.supprimer_mon_compte();
reset role;
select pg_temp.check((select count(*) from app_users where id = '00000000-0000-0000-0000-0000000000a1') = 0, 'suppression : le compte d''Alice est effacé');
select pg_temp.check((select count(*) from talent_fiches where user_id = '00000000-0000-0000-0000-0000000000a1') = 0, 'suppression : la fiche d''Alice est effacée');
select pg_temp.check((select count(*) from parcours_positions where user_id = '00000000-0000-0000-0000-0000000000a1') = 0, 'suppression : la position d''Alice sur son parcours est effacée');
select pg_temp.check((select count(*) from progression where user_id = '00000000-0000-0000-0000-0000000000a1') = 0, 'suppression : la progression d''Alice est effacée');
select pg_temp.check((select count(*) from progression where user_id = '00000000-0000-0000-0000-0000000000b2') = 1, 'suppression : la progression de Bob est intacte');
select pg_temp.check((select count(*) from profiles where user_id = '00000000-0000-0000-0000-0000000000a1') = 0, 'suppression : les profils d''Alice sont effacés');
select pg_temp.check((select count(*) from app_users where id = '00000000-0000-0000-0000-0000000000b2') = 1, 'suppression : le compte de Bob est intact');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.expect_error($$select public.supprimer_mon_compte()$$, 'COMPTE_COACH');
reset role;
select pg_temp.check((select count(*) from app_users where id = '00000000-0000-0000-0000-0000000000c0') = 1, 'suppression : le compte coach est intact');

-- Quota de lecture par lien Notion.
set role anon;
select pg_temp.expect_error($$select public.notion_lien_consommer()$$, 'permission denied');
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select bool_and(public.notion_lien_consommer()) as q from generate_series(1, 10) \gset
select pg_temp.check(:'q' = 't', 'notion : les 10 premières lectures de Bob passent');
select public.notion_lien_consommer() as q \gset
select pg_temp.check(:'q' = 'f', 'notion : la 11e lecture de Bob est refusée');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000d3';
select public.notion_lien_consommer() as q \gset
select pg_temp.check(:'q' = 't', 'notion : le quota de Bob ne compte pas pour les autres');
select pg_temp.expect_error($$select count(*) from notion_lien_quota$$, 'permission denied');
reset role;
select pg_temp.check((select sum(n) from notion_lien_quota) = 11, 'notion : le compteur est bien alimenté');


-- Accès client par code (20261014000000_acces_client.sql) -------------------------
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000f1', 'fanny@test.fr', '{"first_name":"Fanny"}');
insert into auth.users (id, email, is_anonymous) values ('00000000-0000-0000-0000-0000000000f2', null, true);
select pg_temp.check((select invitation_code is null from app_users where id = '00000000-0000-0000-0000-0000000000f1'),
  'client : Fanny a un compte sans code');

set role anon;
select pg_temp.expect_error($$select public.activer_code_client('MH-FANNY-01')$$, 'permission denied');
select pg_temp.expect_error($$select * from public.mon_acces_client()$$, 'permission denied');

reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
insert into invitation_codes (code, coach_id, label, lien_fiche)
  values ('MH-FANNY-01', auth.uid(), 'Fanny', 'https://fanny.notion.site/Talent-Unique-123');
select pg_temp.expect_error($$insert into invitation_codes (code, coach_id, max_uses, lien_fiche)
  values ('MH-GROUPE-01', auth.uid(), 5, 'https://fanny.notion.site/Talent')$$, 'invitation_codes_lien_fiche_check');
select pg_temp.expect_error($$insert into invitation_codes (code, coach_id, lien_fiche)
  values ('MH-MAUVAIS-01', auth.uid(), 'https://exemple.fr/notion.so/')$$, 'invitation_codes_lien_fiche_check');
insert into invitation_codes (code, coach_id, label, max_uses) values ('MH-GROUPE-02', auth.uid(), 'Groupe', 5);

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f1';
select pg_temp.check(not exists (select 1 from public.mon_acces_client()), 'client : pas encore client, rien à lire');
select pg_temp.check(public.activer_code_client('NIMPORTE-QUOI') = 'invalide', 'client : un code inconnu est refusé');
select pg_temp.check(public.activer_code_client(' mh-fanny-01 ') = 'ok', 'client : Fanny active son code (minuscules et espaces acceptés)');
select pg_temp.check(public.activer_code_client('MH-FANNY-01') = 'deja', 'client : activer deux fois ne change rien');
select pg_temp.check(public.activer_code_client('MH-GROUPE-02') = 'deja', 'client : déjà client, un autre code n''est pas consommé');
select pg_temp.check((select code = 'MH-FANNY-01' and coach_prenom = 'Pierre' and lien_fiche = 'https://fanny.notion.site/Talent-Unique-123'
                        from public.mon_acces_client()), 'client : Fanny lit son code, son coach et le lien de sa fiche');
select pg_temp.check((select count(*) from invitation_codes where code = 'MH-FANNY-01') = 0, 'client : Fanny ne voit pas la table des codes');

reset role;
select pg_temp.check((select invitation_code = 'MH-FANNY-01' and coach_id = '00000000-0000-0000-0000-0000000000c0'
                        from app_users where id = '00000000-0000-0000-0000-0000000000f1'), 'client : le compte est marqué client et rattaché à Pierre');
select pg_temp.check((select used_count from invitation_codes where code = 'MH-FANNY-01') = 1, 'client : le code compte une seule utilisation');
select pg_temp.check((select used_count from invitation_codes where code = 'MH-GROUPE-02') = 0, 'client : le code du groupe n''a pas été consommé');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f2';
select pg_temp.check(public.activer_code_client('MH-GROUPE-02') = 'invite', 'client : un essai sans compte ne peut pas activer de code');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000d4';
select pg_temp.check(public.activer_code_client('MH-FANNY-01') = 'invalide', 'client : un code à usage unique déjà pris est refusé');
select pg_temp.check(public.activer_code_client('MH-GROUPE-02') = 'ok', 'client : Dora rejoint le code du groupe');
select pg_temp.check((select lien_fiche is null from public.mon_acces_client()), 'client : un code de groupe ne porte pas de lien de fiche');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check((select code = 'BOUSSOLE-TEST-2026' from public.mon_acces_client()), 'client : un compte ouvert avec un code est déjà client');
reset role;

-- Accord pour la fiche, niveaux VIP, fiches préparées, groupes M3 (20261017000000_vip_consentement.sql) -----------
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000e1', 'emma@test.fr', '{"first_name":"Emma"}'),
  ('00000000-0000-0000-0000-0000000000e2', 'eric@test.fr', '{"first_name":"Eric"}'),
  ('00000000-0000-0000-0000-0000000000e3', 'paula@test.fr', '{"first_name":"Paula"}');

set role anon;
select pg_temp.expect_error($$select public.est_vip()$$, 'permission denied');
select pg_temp.expect_error($$select public.accepter_stockage_fiche()$$, 'permission denied');
select pg_temp.expect_error($$select public.recevoir_fiche_preparee()$$, 'permission denied');
select pg_temp.expect_error($$select public.demander_groupe_m3()$$, 'permission denied');
select pg_temp.expect_error($$select count(*) from fiches_preparees$$, 'permission denied');
select pg_temp.expect_error($$select count(*) from demandes_groupe_m3$$, 'permission denied');

reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
insert into invitation_codes (code, coach_id, label, niveau, acces_jusqu_au) values
  ('MH-EMMA-01', auth.uid(), 'Emma', 'vip12', now() + interval '1 year'),
  ('MH-ERIC-01', auth.uid(), 'Eric', 'membre', now() - interval '1 day'),
  ('MH-PAULA-01', auth.uid(), 'Paula', 'pionnier', null);
select pg_temp.expect_error($$insert into invitation_codes (code, coach_id, niveau) values ('MH-NIVEAU-01', auth.uid(), 'or')$$,
  'invitation_codes_niveau_check');
insert into fiches_preparees (code, fiche) values ('MH-EMMA-01', '{"v":1,"prenom":"Emma","mecanisme":"Je relie les gens"}'::jsonb);
select pg_temp.expect_error($$insert into fiches_preparees (code, fiche) values ('MH-GROUPE-02', '{"v":1}'::jsonb)$$, 'row-level security');
select pg_temp.check((select count(*) from fiches_preparees) = 1, 'préparée : Pierre voit la fiche qu''il a déposée');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.check((select count(*) from fiches_preparees) = 0, 'préparée : un autre compte ne lit pas les fiches préparées');
select pg_temp.expect_error($$insert into fiches_preparees (code, fiche) values ('MH-EMMA-01', '{"v":1}'::jsonb)$$, 'row-level security');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e1';
select pg_temp.check(not public.est_vip(), 'vip : Emma n''est pas encore cliente');
select pg_temp.check(public.recevoir_fiche_preparee() = 'aucune', 'préparée : rien tant que le code n''est pas activé');
select pg_temp.check(public.activer_code_client('MH-EMMA-01') = 'ok', 'vip : Emma active son code');
select pg_temp.check(public.est_vip(), 'vip : un code vip12 encore valable rend VIP');
select pg_temp.check((select niveau = 'vip12' and acces_jusqu_au > now() from public.mon_niveau_acces()), 'vip : Emma lit son niveau et sa date');
select pg_temp.check((select count(*) from fiches_preparees) = 0, 'préparée : Emma ne lit pas la table des fiches préparées');
select pg_temp.check(public.recevoir_fiche_preparee() = 'en_attente', 'accord : une fiche attend l''accord d''Emma');
select pg_temp.check((select count(*) from talent_fiches) = 0, 'accord : sans accord, rien n''est copié');
select pg_temp.expect_error($$update app_users set consentement_fiche_at = now() where id = auth.uid()$$, 'permission denied');
select pg_temp.check(public.accepter_stockage_fiche() = 'copiee', 'accord : la case cochée copie la fiche préparée');
select pg_temp.check((select source = 'coach' and fiche ->> 'prenom' = 'Emma' and consentement_at is not null from talent_fiches),
  'accord : la fiche est dans l''espace d''Emma');
select pg_temp.check((select consentement_fiche_at is not null from app_users where id = auth.uid()), 'accord : la date est gardée');
select consentement_fiche_at as accord_emma from app_users where id = auth.uid() \gset
select pg_temp.check(public.accepter_stockage_fiche() = 'deja', 'accord : un second accord ne recopie rien');
select pg_temp.check((select consentement_fiche_at = :'accord_emma' from app_users where id = auth.uid()), 'accord : la date du premier accord ne bouge pas');
delete from talent_fiches;
select pg_temp.check(public.recevoir_fiche_preparee() = 'deja', 'accord : une fiche supprimée par Emma ne revient pas');
select pg_temp.check((select count(*) from talent_fiches) = 0, 'accord : la fiche d''Emma reste supprimée');

select pg_temp.check(public.demander_groupe_m3() is not null, 'm3 : Emma demande à rejoindre un groupe');
select pg_temp.check(public.demander_groupe_m3() is not null, 'm3 : une seconde demande ne casse rien');
select pg_temp.check((select count(*) from demandes_groupe_m3) = 1, 'm3 : Emma voit sa demande, une seule fois');
select pg_temp.expect_error($$insert into demandes_groupe_m3 (user_id) values (auth.uid())$$, 'permission denied');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e2';
select pg_temp.check(public.accepter_stockage_fiche() = 'aucune', 'accord : Eric accepte avant d''avoir un code');
select pg_temp.check(public.activer_code_client('MH-ERIC-01') = 'ok', 'vip : Eric active son code');
select pg_temp.check(not public.est_vip(), 'vip : un accès échu n''est plus VIP');
select pg_temp.expect_error($$select public.demander_groupe_m3()$$, 'RESERVE_VIP');
select pg_temp.check((select count(*) from demandes_groupe_m3) = 0, 'm3 : Eric ne voit pas la demande d''Emma');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
insert into fiches_preparees (code, fiche, methode) values ('MH-ERIC-01', '{"v":1,"prenom":"Eric"}'::jsonb, 'mots_cles');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e2';
select pg_temp.check(public.recevoir_fiche_preparee() = 'copiee', 'accord : déjà d''accord, Eric reçoit la fiche déposée après');
select pg_temp.check((select methode = 'mots_cles' from talent_fiches), 'accord : la méthode de lecture suit la fiche');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e3';
select pg_temp.check(public.activer_code_client('MH-PAULA-01') = 'ok', 'vip : Paula active son code pionnier');
select pg_temp.check(public.est_vip(), 'vip : pionnier sans date, VIP à vie');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000b2';
select pg_temp.check(not public.est_vip(), 'vip : un code sans niveau ne rend pas VIP');
select pg_temp.check(not exists (select 1 from public.mon_niveau_acces()), 'vip : sans niveau, rien à lire');
select pg_temp.check(not exists (select 1 from public.demandes_groupe_m3_coach()), 'm3 : seul le coach lit les demandes');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000f2';
select pg_temp.check(public.accepter_stockage_fiche() = 'invite', 'accord : un essai sans compte ne donne pas d''accord');
select pg_temp.check(not public.est_vip(), 'vip : un essai sans compte n''est pas VIP');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c0';
select pg_temp.check((select count(*) = 1 and bool_and(first_name = 'Emma' and niveau = 'vip12') from public.demandes_groupe_m3_coach()),
  'm3 : Pierre voit la demande d''Emma et son niveau');
select pg_temp.check((select copiee_at is not null from fiches_preparees where code = 'MH-EMMA-01'), 'préparée : Pierre voit qu''elle est copiée');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e1';
insert into progression (xp, badges, serie_jours) values (150, array['premier-pas', 'en-mouvement', 'sur-la-lancee'], 7);
select public.supprimer_mon_compte();
reset role;
select pg_temp.check(not exists (select 1 from progression where user_id = '00000000-0000-0000-0000-0000000000e1'), 'suppression : la progression d''Emma est effacée');
select pg_temp.check(not exists (select 1 from fiches_preparees where code = 'MH-EMMA-01'), 'suppression : la fiche préparée pour Emma est effacée');
select pg_temp.check(not exists (select 1 from demandes_groupe_m3), 'suppression : la demande M3 d''Emma est effacée');
select pg_temp.check(exists (select 1 from fiches_preparees where code = 'MH-ERIC-01'), 'suppression : les autres fiches préparées restent');

\echo 'Tous les tests de base de données sont passés.'
