/**
 * Client Supabase. La "publishable key" est conçue pour être exposée
 * côté client (comme l'ancienne clé "anon") : la sécurité réelle vient
 * des policies RLS définies dans supabase-schema.sql, pas du secret de
 * cette clé.
 */
const SUPABASE_URL = 'https://djytxgcrjgyxbtrgkqtm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4PbT6zD1jw430hJ3qjOsSg_kJSfSbYZ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
