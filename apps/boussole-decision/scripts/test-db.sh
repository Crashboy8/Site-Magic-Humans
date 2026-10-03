#!/usr/bin/env bash
# Applique les migrations sur une base Postgres jetable et lance les tests SQL.
# Prérequis : un Postgres local accessible (psql, createdb), par ex. via PGHOST/PGUSER.
set -eo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-boussole_test}"
dropdb --if-exists "$DB"
createdb "$DB"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f supabase/tests/supabase-stub.sql
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$f"; done
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f supabase/seed.sql
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f supabase/tests/rls.test.sql 2>&1 | grep -v "^ *$" | sed "s/^psql:[^ ]* //"
