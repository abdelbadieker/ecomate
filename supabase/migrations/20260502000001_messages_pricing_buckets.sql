-- ============================================================
-- Migration: messages + pricing_plans tables + storage buckets
-- Purpose : Restore production data flow for pricing, messaging,
--           and uploads using Postgres/Supabase-compatible DDL.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- PRICING_PLANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'DA',
  period TEXT NOT NULL DEFAULT 'month',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_plans_active_sort
  ON public.pricing_plans (is_active, sort_order);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads active pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Authenticated reads pricing plans" ON public.pricing_plans;

CREATE POLICY "Public reads active pricing plans"
  ON public.pricing_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated reads pricing plans"
  ON public.pricing_plans
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.pricing_plans (
  name,
  price,
  currency,
  period,
  description,
  features,
  is_popular,
  is_active,
  sort_order
)
VALUES
  (
    'Starter',
    2900,
    'DA',
    'month',
    'Perfect for small businesses just getting started',
    '["AI Chatbot (Basic)", "Order Management", "Up to 100 Products", "Basic CRM", "Email Support", "1 User"]'::jsonb,
    false,
    true,
    1
  ),
  (
    'Growth',
    7900,
    'DA',
    'month',
    'Scale your business with advanced tools',
    '["AI Chatbot (Advanced)", "Full Order Management", "Unlimited Products", "Advanced CRM", "Priority Support", "5 Users", "Analytics Dashboard", "Creative Studio"]'::jsonb,
    true,
    true,
    2
  ),
  (
    'Enterprise',
    19900,
    'DA',
    'month',
    'Full platform access for large operations',
    '["Everything in Growth", "Dedicated Account Manager", "Custom Integrations", "Unlimited Users", "API Access", "White-label Options", "24/7 Phone Support", "Custom Reports"]'::jsonb,
    false,
    true,
    3
  )
ON CONFLICT (name) DO UPDATE
  SET price = EXCLUDED.price,
      currency = EXCLUDED.currency,
      period = EXCLUDED.period,
      description = EXCLUDED.description,
      features = EXCLUDED.features,
      is_popular = EXCLUDED.is_popular,
      is_active = EXCLUDED.is_active,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW();

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'client')),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file', 'link', 'video')),
  content TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_created
  ON public.messages (receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created
  ON public.messages (sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at DESC
  );

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark own messages read" ON public.messages;
DROP POLICY IF EXISTS "Service role full access on messages" ON public.messages;

CREATE POLICY "Users can read own messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_role = 'client'
  );

CREATE POLICY "Users can mark own messages read"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    NULL,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
  ),
  (
    'creative-references',
    'creative-references',
    true,
    NULL,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
  ),
  (
    'platform-assets',
    'platform-assets',
    true,
    NULL,
    NULL
  ),
  (
    'messages',
    'messages',
    true,
    NULL,
    NULL
  ),
  (
    'products',
    'products',
    true,
    NULL,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
  ),
  (
    'creative-briefs',
    'creative-briefs',
    true,
    NULL,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm','video/quicktime']
  ),
  (
    'uploads',
    'uploads',
    true,
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE
  bucket_name TEXT;
BEGIN
  FOREACH bucket_name IN ARRAY ARRAY[
    'product-images',
    'creative-references',
    'platform-assets',
    'messages',
    'products',
    'creative-briefs',
    'uploads'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Public read ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth insert ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth update ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth delete own ' || bucket_name);

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR SELECT TO public USING (bucket_id = %L)',
      'Public read ' || bucket_name,
      bucket_name
    );

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L)',
      'Auth insert ' || bucket_name,
      bucket_name
    );

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L) WITH CHECK (bucket_id = %L)',
      'Auth update ' || bucket_name,
      bucket_name,
      bucket_name
    );

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L AND owner = auth.uid())',
      'Auth delete own ' || bucket_name,
      bucket_name
    );
  END LOOP;
END $$;

-- ============================================================
-- REALTIME + POSTGREST SCHEMA CACHE
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
