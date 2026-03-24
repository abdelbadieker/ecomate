-- ═══════════════════════════════════════════════════════════
-- EcoMate — Complete Database Setup
-- Run this in: Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  wilaya TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PLANS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_da INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.plans (name, slug, price_da, features) VALUES
  ('Starter', 'starter', 0, '["AI Chatbot (basic)","Up to 50 orders/month","1 social channel","Product catalog (20 items)","Google Sheets export"]'),
  ('Growth', 'growth', 4900, '["Full AI Sales System","Unlimited orders & products","All social platforms","Delivery auto-tracking","CRM & customer database","AI Growth Agent","Analytics dashboard"]'),
  ('Business', 'business', 0, '["Everything in Growth","Advanced AI Growth Agent","Custom lead targeting","Priority deliverability","Dedicated account manager","Custom integrations"]')
ON CONFLICT (slug) DO NOTHING;

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','cancelled','expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_wilaya TEXT,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  price_da INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_delivery','delivered','cancelled')),
  channel TEXT DEFAULT 'facebook',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_da INTEGER NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CUSTOMERS / CRM ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  wilaya TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent_da INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  channel TEXT DEFAULT 'facebook',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  business_name TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PARTNERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner_key TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL DEFAULT '🤝',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  row_num INTEGER NOT NULL DEFAULT 1 CHECK (row_num IN (1,2)),
  is_active BOOLEAN NOT NULL DEFAULT false,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.partners (partner_key,logo,name,category,row_num,is_active,sort_order) VALUES
  ('p1','🚚','Delivery Partner','Logistics',1,false,1),
  ('p2','🏦','Banking Partner','Payments',1,false,2),
  ('p3','📱','Telecom Partner','Connectivity',1,false,3),
  ('p4','🏪','Commerce Partner','E-commerce',1,false,4),
  ('p5','🏛️','Incubator Partner','Institutional',1,false,5),
  ('p6','☁️','Cloud Partner','Infrastructure',1,false,6),
  ('p7','🤝','Reseller Partner','Distribution',1,false,7),
  ('p8','📦','Fulfillment Partner','COD & Shipping',1,false,8),
  ('p9','🎓','University Partner','Research',2,false,1),
  ('p10','📡','Media Partner','Marketing',2,false,2),
  ('p11','🔐','Security Partner','Compliance',2,false,3),
  ('p12','📊','Analytics Partner','Data Intel',2,false,4),
  ('p13','🛒','Marketplace Partner','Sales Channel',2,false,5),
  ('p14','🌍','Gov & Public Partner','Public Sector',2,false,6),
  ('p15','💳','Fintech Partner','Digital Pay',2,false,7),
  ('p16','🤖','AI Tech Partner','Technology',2,false,8)
ON CONFLICT (partner_key) DO NOTHING;

-- ── ADMIN LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
CREATE POLICY "profiles_self" ON public.profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
CREATE POLICY "profiles_admin" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Plans: public read
DROP POLICY IF EXISTS "plans_read" ON public.plans;
CREATE POLICY "plans_read" ON public.plans FOR SELECT USING (true);

-- Subscriptions
DROP POLICY IF EXISTS "subs_own" ON public.subscriptions;
CREATE POLICY "subs_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subs_admin" ON public.subscriptions;
CREATE POLICY "subs_admin" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Orders
DROP POLICY IF EXISTS "orders_own" ON public.orders;
CREATE POLICY "orders_own" ON public.orders FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_admin" ON public.orders;
CREATE POLICY "orders_admin" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Products
DROP POLICY IF EXISTS "products_own" ON public.products;
CREATE POLICY "products_own" ON public.products FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "products_admin" ON public.products;
CREATE POLICY "products_admin" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Customers
DROP POLICY IF EXISTS "customers_own" ON public.customers;
CREATE POLICY "customers_own" ON public.customers FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "customers_admin" ON public.customers;
CREATE POLICY "customers_admin" ON public.customers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Reviews
DROP POLICY IF EXISTS "reviews_approved_read" ON public.reviews;
CREATE POLICY "reviews_approved_read" ON public.reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "reviews_own_write" ON public.reviews;
CREATE POLICY "reviews_own_write" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_own_read" ON public.reviews;
CREATE POLICY "reviews_own_read" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_admin" ON public.reviews;
CREATE POLICY "reviews_admin" ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Partners: public read
DROP POLICY IF EXISTS "partners_read" ON public.partners;
CREATE POLICY "partners_read" ON public.partners FOR SELECT USING (true);
DROP POLICY IF EXISTS "partners_admin" ON public.partners;
CREATE POLICY "partners_admin" ON public.partners FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- ── TRIGGER: auto-create profile on signup ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    false
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── TRIGGER: updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_upd ON public.profiles;
CREATE TRIGGER profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_upd ON public.orders;
CREATE TRIGGER orders_upd BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS products_upd ON public.products;
CREATE TRIGGER products_upd BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- AFTER RUNNING THIS SQL:
-- 1. Sign up with abdelbadie.kertimi1212@gmail.com
-- 2. Then run this to make it admin:
--    UPDATE public.profiles SET is_admin = true
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'abdelbadie.kertimi1212@gmail.com');
-- 3. Go to Supabase → Auth → Email Templates → set your brand
-- 4. Go to Supabase → Auth → URL Configuration → set your domain
-- ═══════════════════════════════════════════════════════════
