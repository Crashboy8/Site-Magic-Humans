-- Boussole de décision : barème personnalisable.
--
-- Chaque version garde son propre barème : le poids de chaque niveau d'importance
-- (Critique ×5, Très important ×4, Important ×3, Moyennement important ×2, Bof ×1)
-- et le poids du Bonus (ajoute des points sans jamais en retirer). La personne peut
-- les changer ; une version finalisée garde le sien, et une copie reprend celui de l'originale.

alter table public.versions
  add column importance_weights jsonb not null
    default '{"critique": 5, "tres_important": 4, "important": 3, "moyen": 2, "bof": 1, "bonus": 1}'::jsonb
    check (jsonb_typeof(importance_weights) = 'object');

-- Sur une version finalisée, seuls le nom et le statut (rouvrir) peuvent changer.
create or replace function public.guard_finalized_version() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.status = 'finalisee' and new.status = 'finalisee'
     and (new.insight_note is distinct from old.insight_note
          or new.ranking_feedback is distinct from old.ranking_feedback
          or new.importance_weights is distinct from old.importance_weights) then
    raise exception 'VERSION_FINALISEE' using hint = 'Rouvre ou duplique la version pour la modifier.';
  end if;
  if new.status = 'finalisee' and old.status <> 'finalisee' then
    new.finalized_at := now();
  elsif new.status = 'brouillon' then
    new.finalized_at := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

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

  insert into versions (profile_id, name, source_version_id, insight_note, ranking_feedback, current_step, importance_weights)
  values (v_src.profile_id, trim(p_name), v_src.id, v_src.insight_note, v_src.ranking_feedback, v_src.current_step,
          v_src.importance_weights)
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
