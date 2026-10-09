-- « Où j'en suis ? » : la personne est freelance et cherche un poste (voie E, « entrepreneur » et « redevenir salarié » cochés ensemble).
-- Pour elle, le point d'attention « Ton contrat de travail » devient « Tes missions en cours ».
-- Sans cette colonne, l'outil marche comme avant (le contrat de travail reste), sans erreur visible.
-- À coller dans l'éditeur SQL du projet Supabase lpfivkrypbpcyczmgdds, après 20261015000000_parcours_positions.sql. Rejouable.

alter table public.parcours_positions add column if not exists freelance boolean not null default false;

alter table public.parcours_positions drop constraint if exists parcours_positions_freelance_check;
alter table public.parcours_positions add constraint parcours_positions_freelance_check check (not freelance or voie = 'E');

notify pgrst, 'reload schema';
