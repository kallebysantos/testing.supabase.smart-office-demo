-- Move pgvector extension from public to extensions schema (idempotent)
-- Safe for production: no data changes, only extension schema location.

-- Ensure the extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Ensure pgvector is installed in the extensions schema
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- If pgvector exists in public, migrate it to extensions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;
