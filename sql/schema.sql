-- ═══════════════════════════════════════════════════════════
-- ECOMATE DATABASE SCHEMA
-- Run this in Supabase SQL Editor after restoring your project
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  business_name TEXT,
  phone        TEXT,
  plan         TEXT DEFAULT 'none',          -- 'none' | 'starter' | 'growth' | 'business'
  plan_status  TEXT DEFAULT 'inactive',       -- 'inactive' | 'active' | 'cancelled'
  plan_start   TIMESTAMPTZ,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ADMIN USERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin table" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid())
  );

-- ── SUBSCRIPTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan           TEXT NOT NULL,
  amount         NUMERIC(10,2),
  currency       TEXT DEFAULT 'DZD',
  payment_method TEXT DEFAULT 'card',
  status         TEXT DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ── ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number    TEXT UNIQUE,
  customer_name   TEXT,
  customer_phone  TEXT,
  customer_wilaya TEXT,
  product_name    TEXT,
  quantity        INT DEFAULT 1,
  unit_price      NUMERIC(10,2),
  total_amount    NUMERIC(10,2),
  status          TEXT DEFAULT 'pending',   -- pending|confirmed|in_delivery|delivered|cancelled
  payment_status  TEXT DEFAULT 'cod',
  source_channel  TEXT DEFAULT 'manual',    -- messenger|instagram|whatsapp|manual
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2),
  category    TEXT,
  stock       INT DEFAULT 0,
  sku         TEXT,
  image_url   TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

-- ── CUSTOMERS (CRM) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  wilaya      TEXT,
  platform    TEXT,            -- messenger|instagram|whatsapp
  total_orders INT DEFAULT 0,
  total_spent  NUMERIC(10,2) DEFAULT 0,
  last_order  TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON public.customers
  FOR ALL USING (auth.uid() = user_id);

-- ── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  business    TEXT,
  rating      INT CHECK (rating >= 1 AND rating <= 5),
  content     TEXT NOT NULL,
  approved    BOOLEAN DEFAULT false,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews" ON public.reviews
  FOR SELECT USING (approved = true);
CREATE POLICY "Users submit own review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own review" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ── PARTNERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  category   TEXT,
  logo       TEXT,
  website    TEXT,
  row_pos    INT DEFAULT 1,
  active     BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active partners" ON public.partners
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage partners" ON public.partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ── SAMPLE DATA ────────────────────────────────────────────
-- Insert placeholder partners
INSERT INTO public.partners (name, category, logo, row_pos, active) VALUES
  ('Delivery Partner',    'Logistics',      '🚚', 1, false),
  ('Banking Partner',     'Payments',       '🏦', 1, false),
  ('Telecom Partner',     'Connectivity',   '📱', 1, false),
  ('Commerce Partner',    'E-commerce',     '🏪', 1, false),
  ('Incubator Partner',   'Institutional',  '🏛️', 1, false),
  ('Cloud Partner',       'Infrastructure', '☁️', 1, false),
  ('Reseller Partner',    'Distribution',   '🤝', 1, false),
  ('Fulfillment Partner', 'COD & Shipping', '📦', 1, false),
  ('University Partner',  'Research',       '🎓', 2, false),
  ('Media Partner',       'Marketing',      '📡', 2, false),
  ('Security Partner',    'Compliance',     '🔐', 2, false),
  ('Analytics Partner',   'Data Intel',     '📊', 2, false),
  ('Marketplace Partner', 'Sales Channel',  '🛒', 2, false),
  ('Gov Partner',         'Public Sector',  '🌍', 2, false),
  ('Fintech Partner',     'Digital Pay',    '💳', 2, false),
  ('AI Tech Partner',     'Technology',     '🤖', 2, false)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ADMIN SEED: Run separately after creating the admin account
-- Replace 'ADMIN_USER_UUID' with the actual UUID from auth.users
-- after creating the account abdelbadie.kertimi1212@gmail.com
-- ═══════════════════════════════════════════════════════════
-- INSERT INTO public.admin_users (user_id, email, role)
-- VALUES ('ADMIN_USER_UUID', 'abdelbadie.kertimi1212@gmail.com', 'super_admin');
