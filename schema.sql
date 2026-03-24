-- ═══════════════════════════════════════════════════════════════
-- ECOMATE PLATFORM — COMPLETE SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  wilaya TEXT DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. ADMIN ROLES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, super_admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. SUBSCRIPTIONS / PLANS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'trial',
    -- trial | starter | growth | business
  status TEXT NOT NULL DEFAULT 'active',
    -- active | pending_payment | cancelled | expired
  amount_da INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_reference TEXT,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT DEFAULT ('EM-' || LPAD(NEXTVAL('order_seq')::TEXT, 6, '0')),
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  wilaya TEXT DEFAULT '',
  commune TEXT DEFAULT '',
  products JSONB DEFAULT '[]',
  subtotal INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
    -- pending | confirmed | processing | in_delivery | delivered | cancelled | returned
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  delivery_company TEXT DEFAULT '',
  tracking_code TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
    -- manual | facebook | instagram | whatsapp | telegram
  ai_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER DEFAULT 0,
  compare_price INTEGER,
  cost_price INTEGER,
  stock INTEGER DEFAULT 0,
  track_stock BOOLEAN DEFAULT TRUE,
  sku TEXT DEFAULT '',
  barcode TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. CUSTOMERS (CRM)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  wilaya TEXT DEFAULT '',
  address TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  average_order INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 7. REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_business TEXT DEFAULT '',
  author_wilaya TEXT DEFAULT '',
  author_avatar TEXT DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  admin_response TEXT DEFAULT '',
  helpful_count INTEGER DEFAULT 0,
  plan_at_review TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. PARTNERS (managed by admin)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.partners (
  id TEXT PRIMARY KEY,
  logo TEXT DEFAULT '🤝',
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  row_num INTEGER DEFAULT 1,
  soon BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  website_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 9. SERVICE CONFIG (what each plan unlocks)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.service_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_key TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  service_desc TEXT DEFAULT '',
  icon TEXT DEFAULT '⚙️',
  min_plan TEXT DEFAULT 'growth',
    -- trial | starter | growth | business
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- 10. ACTIVITY LOG (for dashboard feed)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Services
INSERT INTO public.service_config (service_key, service_name, service_desc, icon, min_plan, sort_order) VALUES
('chatbot',      'AI Sales Chatbot',       'Automated responses across social platforms 24/7', '🤖', 'starter', 1),
('orders',       'Order & COD Management', 'Track every order from placement to delivery',      '📦', 'starter', 2),
('products',     'Product Catalog',        'Manage products synced across all channels',         '🛍️', 'starter', 3),
('crm',          'CRM — Customers',        'Full customer history, behavior & lifetime value',   '👥', 'growth',  4),
('growth_agent', 'AI Growth Agent',        'Automated B2B lead discovery, scoring & outreach',  '🎯', 'growth',  5),
('analytics',    'Analytics Dashboard',    'Revenue, orders, conversion rates & trends',        '📊', 'growth',  6),
('delivery',     'Delivery Integration',   'Auto-sync with all Algerian delivery companies',    '🚚', 'growth',  7);

-- Default partners (16 slots)
INSERT INTO public.partners (id, logo, name, category, row_num, soon) VALUES
('p1',  '🚚', 'Delivery Partner',     'Logistics',      1, true),
('p2',  '🏦', 'Banking Partner',      'Payments',       1, true),
('p3',  '📱', 'Telecom Partner',      'Connectivity',   1, true),
('p4',  '🏪', 'Commerce Partner',     'E-commerce',     1, true),
('p5',  '🏛️', 'Incubator Partner',    'Institutional',  1, true),
('p6',  '☁️', 'Cloud Partner',        'Infrastructure', 1, true),
('p7',  '🤝', 'Reseller Partner',     'Distribution',   1, true),
('p8',  '📦', 'Fulfillment Partner',  'COD & Shipping', 1, true),
('p9',  '🎓', 'University Partner',   'Research',       2, true),
('p10', '📡', 'Media Partner',        'Marketing',      2, true),
('p11', '🔐', 'Security Partner',     'Compliance',     2, true),
('p12', '📊', 'Analytics Partner',    'Data Intel',     2, true),
('p13', '🛒', 'Marketplace Partner',  'Sales Channel',  2, true),
('p14', '🌍', 'Gov & Public Partner', 'Public Sector',  2, true),
('p15', '💳', 'Fintech Partner',      'Digital Pay',    2, true),
('p16', '🤖', 'AI Tech Partner',      'Technology',     2, true);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profile_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ADMIN ROLES (anyone can check if they're admin)
CREATE POLICY "admin_check_own" ON public.admin_roles FOR SELECT USING (auth.uid() = user_id);

-- SUBSCRIPTIONS
CREATE POLICY "sub_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sub_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sub_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- ORDERS
CREATE POLICY "orders_all_own" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- PRODUCTS
CREATE POLICY "products_all_own" ON public.products FOR ALL USING (auth.uid() = user_id);

-- CUSTOMERS
CREATE POLICY "customers_all_own" ON public.customers FOR ALL USING (auth.uid() = user_id);

-- REVIEWS: insert if logged in, read if approved or own
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (approved = true OR auth.uid() = user_id);

-- PARTNERS: public read
CREATE POLICY "partners_read" ON public.partners FOR SELECT USING (active = true);

-- SERVICE CONFIG: public read
CREATE POLICY "services_read" ON public.service_config FOR SELECT USING (true);

-- ACTIVITY LOG
CREATE POLICY "activity_all_own" ON public.activity_log FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, business_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  -- Create 14-day trial subscription
  INSERT INTO public.subscriptions (user_id, plan, status, expires_at, payment_confirmed)
  VALUES (NEW.id, 'trial', 'active', NOW() + INTERVAL '14 days', true);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- ADMIN SETUP
-- ─────────────────────────────────────────────────────────────
-- After creating your admin account through the app sign-up,
-- run this SQL to grant admin access:
--
-- INSERT INTO public.admin_roles (user_id, email)
-- SELECT id, email FROM auth.users
-- WHERE email = 'abdelbadie.kertimi1212@gmail.com';
--
-- ⚠️  SECURITY: Change your password from the default after first login!
-- ─────────────────────────────────────────────────────────────

-- PLAN HIERARCHY helper function
CREATE OR REPLACE FUNCTION public.plan_level(p TEXT)
RETURNS INTEGER
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p
    WHEN 'trial'    THEN 1
    WHEN 'starter'  THEN 2
    WHEN 'growth'   THEN 3
    WHEN 'business' THEN 4
    ELSE 0
  END;
$$;

-- Check if user has access to a service
CREATE OR REPLACE FUNCTION public.has_service_access(p_user_id UUID, p_service_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_min_plan TEXT;
  v_status TEXT;
BEGIN
  SELECT plan, status INTO v_plan, v_status
  FROM public.subscriptions WHERE user_id = p_user_id;

  SELECT min_plan INTO v_min_plan
  FROM public.service_config WHERE service_key = p_service_key;

  IF v_status != 'active' THEN RETURN FALSE; END IF;

  RETURN public.plan_level(v_plan) >= public.plan_level(v_min_plan);
END;
$$;
