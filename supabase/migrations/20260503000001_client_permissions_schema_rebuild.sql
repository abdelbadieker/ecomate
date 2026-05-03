-- ============================================================
-- Migration: client_permissions module locker rebuild
-- Purpose : Replace profile JSON locking as the primary access
--           control source and repair customer schema drift.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keep the existing customers.city column as the canonical app column,
-- but add wilaya as a compatibility column for older imports and cached
-- clients that still send/select it.
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS wilaya TEXT;

UPDATE public.customers
  SET wilaya = COALESCE(wilaya, city)
  WHERE wilaya IS NULL AND city IS NOT NULL;

-- ============================================================
-- CLIENT_PERMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.client_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, module_name)
);

CREATE INDEX IF NOT EXISTS idx_client_permissions_client
  ON public.client_permissions (client_id);

CREATE INDEX IF NOT EXISTS idx_client_permissions_locked
  ON public.client_permissions (client_id, is_locked);

ALTER TABLE public.client_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own permissions" ON public.client_permissions;

CREATE POLICY "Clients read own permissions"
  ON public.client_permissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Backfill every known module for every profile. Existing legacy
-- profiles.locked_sections values are preserved as is_locked=true.
WITH modules(module_name) AS (
  VALUES
    ('overview'),
    ('orders'),
    ('products'),
    ('crm'),
    ('ecotrack'),
    ('fulfillment'),
    ('chatbot'),
    ('creative'),
    ('web'),
    ('estore'),
    ('analytics'),
    ('billing'),
    ('messages'),
    ('support')
),
profile_modules AS (
  SELECT
    p.id AS client_id,
    m.module_name,
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(COALESCE(p.locked_sections, '[]'::jsonb)) AS locked(module_name)
      WHERE locked.module_name = m.module_name
    ) AS is_locked
  FROM public.profiles p
  CROSS JOIN modules m
)
INSERT INTO public.client_permissions (client_id, module_name, is_locked)
SELECT client_id, module_name, is_locked
FROM profile_modules
ON CONFLICT (client_id, module_name) DO UPDATE
  SET is_locked = EXCLUDED.is_locked,
      updated_at = NOW();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.client_permissions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
