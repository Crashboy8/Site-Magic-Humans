-- Boussole de décision : tableau de décision façon feuille de calcul.
--
-- Chaque critère reçoit un niveau d'importance à 6 crans (Critique ×5, Très important ×4,
-- Important ×3, Moyennement important ×2, Bof ×1, Bonus : ajoute des points sans jamais en retirer)
-- et une case « non négociable » indépendante, que la personne coche où elle veut.
-- La direction (TOWARDS / AWAY_FROM, « à éviter ») est conservée.

create type public.importance_level as enum ('critique', 'tres_important', 'important', 'moyen', 'bof', 'bonus');

alter table public.criteria
  add column importance public.importance_level not null default 'important',
  add column non_negotiable boolean not null default false;

update public.criteria set
  non_negotiable = (kind = 'DEALBREAKER'),
  importance = (case
    when kind = 'DEALBREAKER' then 'critique'
    when weight = 5 then 'critique'
    when weight = 4 then 'tres_important'
    when weight = 3 then 'important'
    when weight = 2 then 'moyen'
    else 'bof'
  end)::public.importance_level;

alter table public.criteria
  drop constraint criteria_weight_check,
  drop column kind,
  drop column weight;
drop type public.criterion_kind;

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

  insert into criteria (id, version_id, category_id, label, description, importance, non_negotiable, direction, position)
    select m.new_id, v_new, mc.new_id, c.label, c.description, c.importance, c.non_negotiable, c.direction, c.position
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
