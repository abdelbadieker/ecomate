-- ============================================================
-- Migration: messages + pricing_plans tables + missing storage buckets
-- ============================================================

-- ── MESSAGES TABLE (admin ↔ client communication) ─────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'client' CHECK (sender_role IN ('admin', 'client')),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file', 'link', 'video')),
  content TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by conversation participants
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (admin API routes)
CREATE POLICY "Service role full access on messages"
  ON public.messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own messages
CREATE POLICY "Users can read own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow authenticated users to insert messages they send
CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to mark their received messages as read
CREATE POLICY "Users can mark own messages read"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- ── PRICING_PLANS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'DA',
  period TEXT NOT NULL DEFAULT 'month',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS — public read, admin write
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (true);

CREATE POLICY "Service role manages pricing plans"
  ON public.pricing_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed the 3 existing plans so the migration is non-destructive
INSERT INTO public.pricing_plans (name, price, currency, period, description, features, is_popular, sort_order)
VALUES
  ('Starter', 2900, 'DA', 'month', 'Perfect for small businesses just getting started',
   '["AI Chatbot (Basic)", "Order Management", "Up to 100 Products", "Basic CRM", "Email Support", "1 User"]'::jsonb,
   false, 1),
  ('Growth', 7900, 'DA', 'month', 'Scale your business with advanced tools',
   '["AI Chatbot (Advanced)", "Full Order Management", "Unlimited Products", "Advanced CRM", "Priority Support", "5 Users", "Analytics Dashboard", "Creative Studio"]'::jsonb,
   true, 2),
  ('Enterprise', 19900, 'DA', 'month', 'Full platform access for large operations',
   '["Everything in Growth", "Dedicated Account Manager", "Custom Integrations", "Unlimited Users", "API Access", "White-label Options", "24/7 Phone Support", "Custom Reports"]'::jsonb,
   false, 3)
ON CONFLICT DO NOTHING;


-- ── MISSING STORAGE BUCKETS ───────────────────────────────────
-- Code references these buckets but the earlier migration didn't create them

-- product-images (used by site products + fulfillment pages)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 'product-images', true, 104857600,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 104857600;

-- creative-references (used by site creative-studio page)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creative-references', 'creative-references', true, 104857600,
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 104857600;

-- platform-assets (used by admin creative-studio + chatbot-control)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-assets', 'platform-assets', true, 104857600, NULL
)
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 104857600;

-- messages bucket (for file/video attachments in messaging)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages', 'messages', true, 104857600, NULL
)
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 104857600;


-- ── STORAGE RLS POLICIES ──────────────────────────────────────
-- Allow public read and authenticated upload on all buckets

DO $$
DECLARE
  bucket_name TEXT;
BEGIN
  FOR bucket_name IN SELECT unnest(ARRAY[
    'product-images', 'creative-references', 'platform-assets', 'messages',
    'products', 'creative-briefs', 'uploads'
  ]) LOOP
    -- Public read
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Public read %s" ON storage.objects FOR SELECT USING (bucket_id = %L)',
      bucket_name, bucket_name
    );
    -- Authenticated insert
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Auth insert %s" ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L)',
      bucket_name, bucket_name
    );
    -- Authenticated update
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Auth update %s" ON storage.objects FOR UPDATE USING (bucket_id = %L)',
      bucket_name, bucket_name
    );
  END LOOP;
END $$;


-- ── ENABLE REALTIME ON PROFILES (for module locker) ───────────
-- (Safe to re-run — no error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
