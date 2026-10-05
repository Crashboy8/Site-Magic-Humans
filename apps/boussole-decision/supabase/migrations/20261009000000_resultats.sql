-- Boussole de décision : page Résultats et contextes vécus.
--
-- 1. Profil : « Mes contextes de réussite » et « Mes contextes d'échec », décrits avec des situations
--    vécues (ex. « trop isolé, derrière un écran toute la journée »). Ils complètent le Talent Unique
--    et l'Anti-Contexte, et sont rappelés dans les résultats.
-- 2. Version : le ressenti face au classement, l'exercice de projection (« tu as signé demain :
--    soulagement ou déception ? »), et les prochains pas pour l'opportunité choisie.

alter table public.profiles
  add column success_situations text not null default '',
  add column failure_situations text not null default '';

alter table public.versions
  add column ranking_agreement text check (ranking_agreement in ('oui', 'pas_vraiment', 'non')),
  add column projection_feeling text check (projection_feeling in ('soulagement', 'mitige', 'deception')),
  add column projection_note text not null default '',
  add column chosen_opportunity_id uuid,
  add column next_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(next_steps) = 'array'),
  -- L'opportunité choisie appartient forcément à la même version.
  add constraint versions_chosen_opportunity_fk foreign key (chosen_opportunity_id, id)
    references public.opportunities (id, version_id) on delete set null (chosen_opportunity_id);

-- Sur une version finalisée, seuls le nom et le statut (rouvrir) peuvent changer.
create or replace function public.guard_finalized_version() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.status = 'finalisee' and new.status = 'finalisee'
     and (new.insight_note is distinct from old.insight_note
          or new.ranking_feedback is distinct from old.ranking_feedback
          or new.importance_weights is distinct from old.importance_weights
          or new.ranking_agreement is distinct from old.ranking_agreement
          or new.projection_feeling is distinct from old.projection_feeling
          or new.projection_note is distinct from old.projection_note
          or new.chosen_opportunity_id is distinct from old.chosen_opportunity_id
          or new.next_steps is distinct from old.next_steps) then
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

  insert into evaluations (criterion_id, opportunity_id, version_id, value)
    select mc.new_id, mo.new_id, v_new, e.value
      from evaluations e
      join map_criteria mc on mc.old_id = e.criterion_id
      join map_opportunities mo on mo.old_id = e.opportunity_id;

  -- L'opportunité choisie suit sa copie.
  update versions set chosen_opportunity_id = (select new_id from map_opportunities where old_id = v_src.chosen_opportunity_id)
   where id = v_new and v_src.chosen_opportunity_id is not null;

  drop table map_categories, map_criteria, map_opportunities;
  return v_new;
end $$;
