-- ============================================================================
-- EcoMate — COMPLETE consolidated schema (single source of truth)
-- ----------------------------------------------------------------------------
-- The original base tables lived only in the (now deleted) old Supabase project
-- and were never captured in a migration. This file rebuilds the ENTIRE schema
-- from the application's actual usage + the historical migrations, so a fresh
-- Supabase project can be provisioned in one shot.
--
-- Idempotent: safe to run repeatedly (CREATE ... IF NOT EXISTS, DROP POLICY IF
-- EXISTS before CREATE POLICY, ON CONFLICT upserts).
--
-- Security model:
--   * Merchant-private tables  -> RLS scoped to auth.uid().
--   * Public content tables    -> anon/authenticated SELECT only; writes are
--                                 done by the admin via the service-role key,
--                                 which bypasses RLS by design.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- CORE: profiles (one row per auth.users user — the "merchant")
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  plan            TEXT NOT NULL DEFAULT 'Starter',
  features        JSONB NOT NULL DEFAULT '{"crm":true,"orders":true,"support":true,"chatbot":false,"analytics":false}'::jsonb,
  locked_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_admin        BOOLEAN NOT NULL DEFAULT false,
  is_banned       BOOLEAN NOT NULL DEFAULT false,
  account_status  TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- products (merchant-owned)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  price          NUMERIC NOT NULL DEFAULT 0,
  compare_price  NUMERIC,
  stock          INTEGER NOT NULL DEFAULT 0,
  category       TEXT,
  sku            TEXT,
  image_url      TEXT,
  images         TEXT[] NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_fulfillment BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON public.products (merchant_id);

-- ============================================================================
-- orders (currently shared across authenticated merchants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id   UUID,
  order_ref     TEXT,
  customer_name TEXT,
  phone         TEXT,
  wilaya        TEXT,
  address       TEXT,
  commune       TEXT,
  products      JSONB NOT NULL DEFAULT '[]'::jsonb,
  total         NUMERIC NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'new',
  tracking_code TEXT,
  carrier       TEXT,
  is_cod        BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);

-- ============================================================================
-- customers (shared CRM directory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id  UUID,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  city         TEXT,
  wilaya       TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent  NUMERIC NOT NULL DEFAULT 0,
  ltv          NUMERIC NOT NULL DEFAULT 0,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  notes        TEXT,
  last_order_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- subscriptions (merchant billing records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  payment_ref   TEXT,
  payment_type  TEXT,
  payment_proof TEXT,
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant ON public.subscriptions (merchant_id);

-- ============================================================================
-- support_tickets (correlated by user_email)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email  TEXT NOT NULL,
  subject     TEXT,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- creative_briefs (Creative Studio submissions, correlated by user_email)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.creative_briefs (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email            TEXT NOT NULL,
  video_type            TEXT,
  duration              TEXT,
  description           TEXT,            -- the merchant's brief text
  reference_description TEXT,
  reference_url         TEXT,
  delivery_url          TEXT,
  admin_notes           TEXT,            -- shown back to the merchant
  status                TEXT NOT NULL DEFAULT 'Pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- activity_logs (audit trail) — SUPERSET of all columns various callers insert
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action      TEXT NOT NULL,
  details     TEXT,
  actor_name  TEXT,
  actor_role  TEXT,
  target      TEXT,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs (created_at DESC);

-- ============================================================================
-- reviews (public testimonials; admin approves)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id   UUID,
  name          TEXT NOT NULL,
  email         TEXT,
  business_name TEXT,
  wilaya        TEXT,
  rating        INTEGER NOT NULL DEFAULT 5,
  comment       TEXT,
  is_approved   BOOLEAN NOT NULL DEFAULT false,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews (is_approved, created_at DESC);

-- ============================================================================
-- services (landing-page Services CMS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  icon        TEXT,
  icon_type   TEXT,
  icon_value  TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- partnerships (Trusted Partners on the landing page)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partnerships (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  is_emoji      BOOLEAN NOT NULL DEFAULT true,   -- marquee uses {name, is_emoji, content}
  content       TEXT,                            -- emoji char OR logo image URL
  logo_url      TEXT,
  website_url   TEXT,
  category      TEXT,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- partner_links (Partner Ecosystem links) + partner_clicks (tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partner_links (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service       TEXT,
  partner_name  TEXT,             -- admin "Partner Ecosystem" stores partner_name
  name          TEXT,
  url           TEXT,
  type          TEXT,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_clicks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service    TEXT,
  user_email TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- platform_contacts (global contact directory shown on the site)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.platform_contacts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type       TEXT,
  label      TEXT,
  value      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- billing_settings + billing_redirect_settings (upgrade redirect & support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.billing_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform        TEXT,
  contact_value   TEXT,
  custom_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT false,
  support_email   TEXT,
  support_phone   TEXT,
  support_whatsapp TEXT,
  notes           TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_redirect_settings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform      TEXT,
  contact_value TEXT,
  custom_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- demo_videos (homepage / feature demo clips)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.demo_videos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name  TEXT,
  title         TEXT,
  video_url     TEXT,
  thumbnail_url TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CRM assets / files / imports (admin manages per client_id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crm_assets (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'file',
  title        TEXT,
  file_url     TEXT,
  external_url TEXT,
  file_name    TEXT,
  mime_type    TEXT,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_assets_client ON public.crm_assets (client_id);

CREATE TABLE IF NOT EXISTS public.crm_files (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url   TEXT,
  file_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_imports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name     TEXT,
  file_url      TEXT,
  file_type     TEXT,
  total_records INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- chatbot: responses (canned answers), requests (client asks), demo (video)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chatbot_responses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_phrase TEXT,
  response       TEXT,
  category       TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  success        BOOLEAN,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chatbot_requests (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chatbot_demo (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT,
  video_url  TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- pricing_plans (public pricing table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  price      NUMERIC NOT NULL DEFAULT 0,
  currency   TEXT NOT NULL DEFAULT 'DA',
  period     TEXT NOT NULL DEFAULT 'month',
  description TEXT,
  features   JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active_sort ON public.pricing_plans (is_active, sort_order);

-- ============================================================================
-- messages (admin <-> client) — includes deleted_at the code expects
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'client')),
  type        TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file', 'link', 'video')),
  content     TEXT NOT NULL,
  file_name   TEXT,
  file_size   BIGINT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON public.messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages (sender_id, created_at DESC);

-- ============================================================================
-- client_permissions (Module Locker — per-client module access)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_permissions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_locked   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, module_name)
);
CREATE INDEX IF NOT EXISTS idx_client_permissions_client ON public.client_permissions (client_id);

-- ============================================================================
-- handle_new_user trigger: auto-create a profile on signup (email + OAuth).
-- Hardened: never blocks signup; merges Google metadata on conflict.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar    TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, plan, features, locked_sections, created_at, updated_at)
    VALUES (
      NEW.id, NEW.email, v_full_name, v_avatar, 'Starter',
      '{"crm":true,"orders":true,"support":true,"chatbot":false,"analytics":false}'::jsonb,
      '[]'::jsonb, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET email      = EXCLUDED.email,
          full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
          updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: % (%)', NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_briefs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_links             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_clicks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_redirect_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_videos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_assets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_files                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_imports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_responses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_demo              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_permissions        ENABLE ROW LEVEL SECURITY;

-- Helper: (re)create a policy idempotently
-- profiles --------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- products (owner) ------------------------------------------------------------
DROP POLICY IF EXISTS "products_all_own" ON public.products;
CREATE POLICY "products_all_own" ON public.products FOR ALL
  USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);

-- orders / customers (shared among authenticated) -----------------------------
DROP POLICY IF EXISTS "orders_all_auth" ON public.orders;
CREATE POLICY "orders_all_auth" ON public.orders FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "customers_all_auth" ON public.customers;
CREATE POLICY "customers_all_auth" ON public.customers FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- subscriptions (owner reads) -------------------------------------------------
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = merchant_id);

-- support_tickets / creative_briefs (by user_email) ---------------------------
DROP POLICY IF EXISTS "tickets_select_own" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_insert_own" ON public.support_tickets;
CREATE POLICY "tickets_select_own" ON public.support_tickets FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "tickets_insert_own" ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "briefs_select_own" ON public.creative_briefs;
DROP POLICY IF EXISTS "briefs_insert_own" ON public.creative_briefs;
CREATE POLICY "briefs_select_own" ON public.creative_briefs FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "briefs_insert_own" ON public.creative_briefs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- activity_logs (insert-only for authenticated; reads are admin/service-role) --
DROP POLICY IF EXISTS "activity_insert_auth" ON public.activity_logs;
CREATE POLICY "activity_insert_auth" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- reviews (public reads approved; authenticated submit) -----------------------
DROP POLICY IF EXISTS "reviews_select_approved" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_select_approved" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- client_permissions (client reads own) ---------------------------------------
DROP POLICY IF EXISTS "client_perms_select_own" ON public.client_permissions;
CREATE POLICY "client_perms_select_own" ON public.client_permissions FOR SELECT USING (auth.uid() = client_id);

-- messages (participants) -----------------------------------------------------
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND sender_role = 'client');
CREATE POLICY "messages_update_receiver" ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- crm_assets / crm_files / crm_imports (client reads own; admin writes via svc)
DROP POLICY IF EXISTS "crm_assets_select_own" ON public.crm_assets;
CREATE POLICY "crm_assets_select_own" ON public.crm_assets FOR SELECT USING (auth.uid() = client_id);
DROP POLICY IF EXISTS "crm_files_select_own" ON public.crm_files;
CREATE POLICY "crm_files_select_own" ON public.crm_files FOR SELECT USING (auth.uid() = client_id);
DROP POLICY IF EXISTS "crm_imports_select_own" ON public.crm_imports;
CREATE POLICY "crm_imports_select_own" ON public.crm_imports FOR SELECT USING (auth.uid() = client_id);

-- chatbot_requests (client manages own) ---------------------------------------
DROP POLICY IF EXISTS "chatbot_requests_select_own" ON public.chatbot_requests;
DROP POLICY IF EXISTS "chatbot_requests_insert_own" ON public.chatbot_requests;
CREATE POLICY "chatbot_requests_select_own" ON public.chatbot_requests FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "chatbot_requests_insert_own" ON public.chatbot_requests FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Public content tables: anon + authenticated SELECT (writes via service-role)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'services','partnerships','partner_links','platform_contacts',
    'billing_settings','billing_redirect_settings','demo_videos',
    'pricing_plans','chatbot_responses','chatbot_demo'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_public_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)', t || '_public_read', t);
  END LOOP;
END $$;

-- partner_clicks: anyone may insert a click event ------------------------------
DROP POLICY IF EXISTS "partner_clicks_insert_any" ON public.partner_clicks;
CREATE POLICY "partner_clicks_insert_any" ON public.partner_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKETS (public read; uploads from authenticated or service-role)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images',      'product-images',      true, 104857600, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']),
  ('products',            'products',            true, 104857600, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']),
  ('creative-references', 'creative-references', true, 104857600, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']),
  ('creative-briefs',     'creative-briefs',     true, 104857600, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm','video/quicktime']),
  ('platform-assets',     'platform-assets',     true, 104857600, NULL),
  ('messages',            'messages',            true, 104857600, NULL),
  ('uploads',             'uploads',             true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE bucket_name TEXT;
BEGIN
  FOREACH bucket_name IN ARRAY ARRAY[
    'product-images','products','creative-references','creative-briefs',
    'platform-assets','messages','uploads'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Public read ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth insert ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth update ' || bucket_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Auth delete ' || bucket_name);

    EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT TO public USING (bucket_id = %L)',
      'Public read ' || bucket_name, bucket_name);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L)',
      'Auth insert ' || bucket_name, bucket_name);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L) WITH CHECK (bucket_id = %L)',
      'Auth update ' || bucket_name, bucket_name, bucket_name);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L)',
      'Auth delete ' || bucket_name, bucket_name);
  END LOOP;
END $$;

-- ============================================================================
-- SEED: pricing plans
-- ============================================================================
INSERT INTO public.pricing_plans (name, price, currency, period, description, features, is_popular, is_active, sort_order)
VALUES
  ('Starter', 2900, 'DA', 'month', 'Perfect for small businesses just getting started',
   '["AI Chatbot (Basic)", "Order Management", "Up to 100 Products", "Basic CRM", "Email Support", "1 User"]'::jsonb, false, true, 1),
  ('Growth', 7900, 'DA', 'month', 'Scale your business with advanced tools',
   '["AI Chatbot (Advanced)", "Full Order Management", "Unlimited Products", "Advanced CRM", "Priority Support", "5 Users", "Analytics Dashboard", "Creative Studio"]'::jsonb, true, true, 2),
  ('Enterprise', 19900, 'DA', 'month', 'Full platform access for large operations',
   '["Everything in Growth", "Dedicated Account Manager", "Custom Integrations", "Unlimited Users", "API Access", "White-label Options", "24/7 Phone Support", "Custom Reports"]'::jsonb, false, true, 3)
ON CONFLICT (name) DO UPDATE
  SET price = EXCLUDED.price, currency = EXCLUDED.currency, period = EXCLUDED.period,
      description = EXCLUDED.description, features = EXCLUDED.features,
      is_popular = EXCLUDED.is_popular, is_active = EXCLUDED.is_active,
      sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- ============================================================================
-- REALTIME publication (feature-gate live sync, messaging, module locker)
-- ============================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','messages','client_permissions'] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
