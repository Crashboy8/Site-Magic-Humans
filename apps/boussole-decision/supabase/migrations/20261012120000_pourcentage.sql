-- Pourcentage libre d'une case (0 à 100, pas de 5).
-- Colonne optionnelle : si elle manque encore, l'application écrit la note en mots
-- la plus proche et garde le pourcentage exact dans le navigateur.
-- Aucun critère n'est ajouté aux boussoles déjà créées.

alter table public.evaluations
  add column if not exists percent smallint;

alter table public.evaluations
  drop constraint if exists evaluations_percent_pas;

alter table public.evaluations
  add constraint evaluations_percent_pas
  check (percent is null or (percent between 0 and 100 and percent % 5 = 0));

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

  insert into versions (profile_id, name, source_version_id, insight_note, ranking_feedback, current_step, importance_weights,
                        ranking_agreement, projection_feeling, projection_note, next_steps)
  values (v_src.profile_id, trim(p_name), v_src.id, v_src.insight_note, v_src.ranking_feedback, v_src.current_step,
          v_src.importance_weights, v_src.ranking_agreement, v_src.projection_feeling, v_src.projection_note, v_src.next_steps)
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

  insert into evaluations (criterion_id, opportunity_id, version_id, value, percent)
    select mc.new_id, mo.new_id, v_new, e.value, e.percent
      from evaluations e
      join map_criteria mc on mc.old_id = e.criterion_id
      join map_opportunities mo on mo.old_id = e.opportunity_id;

  update versions set chosen_opportunity_id = (select new_id from map_opportunities where old_id = v_src.chosen_opportunity_id)
   where id = v_new and v_src.chosen_opportunity_id is not null;

  drop table map_categories, map_criteria, map_opportunities;
  return v_new;
end $$;
