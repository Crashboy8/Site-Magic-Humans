-- Code d'invitation de test (10 utilisations, valable jusqu'à fin 2027).
-- Il n'a pas encore de coach : promote_to_coach() le rattachera au compte de Pierre.
insert into public.invitation_codes (code, label, max_uses, expires_at)
values ('BOUSSOLE-TEST-2026', 'Code de test', 10, '2027-12-31T23:59:59Z')
on conflict (code) do nothing;
