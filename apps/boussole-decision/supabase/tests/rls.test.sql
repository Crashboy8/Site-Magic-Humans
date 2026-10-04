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

reset role;
\echo 'Tous les tests de base de données sont passés.'
