-- Phase 1: Ecomate Core Platform Schema (Production)
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)

-- ─────────────────────────────────────────────────────────────
-- 1. EXTENSIONS & ENUMS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE delivery_type AS ENUM ('Home', 'Stop Desk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. CLIENTS (Agency Owners / Tenants)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    email TEXT,
    meta_partner_id TEXT,
    telegram_token TEXT,
    registre_de_commerce_url TEXT,
    google_drive_folder_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS (Catalog)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_dzd DECIMAL(12, 2) NOT NULL,
    image_url TEXT,
    sku TEXT,
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. CUSTOMERS CRM (End-Shoppers)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers_crm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    wilaya_name TEXT NOT NULL, -- Algeria 58 Wilayas
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. ORDERS (EcoTrack Engine)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers_crm(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE DEFAULT ('EM-' || LPAD(ROUND(RANDOM() * 1000000)::TEXT, 6, '0')),
    quantity INTEGER DEFAULT 1,
    color TEXT,
    size TEXT,
    delivery_type delivery_type DEFAULT 'Home',
    status order_status DEFAULT 'Pending',
    total_price_dzd DECIMAL(12, 2) NOT NULL,
    tracking_code TEXT,
    tracking_provider_link TEXT DEFAULT 'https://yalidine.com/track/', -- Yalidine as requested
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (Tenant Isolation)

-- Clients Policies
CREATE POLICY "Clients can view own profile" ON public.clients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Clients can update own profile" ON public.clients FOR UPDATE USING (auth.uid() = id);

-- Products Policies
CREATE POLICY "Clients can manage own products" ON public.products FOR ALL USING (auth.uid() = client_id);

-- Customers CRM Policies
CREATE POLICY "Clients can manage own customers" ON public.customers_crm FOR ALL USING (auth.uid() = client_id);

-- Orders Policies
CREATE POLICY "Clients can manage own orders" ON public.orders FOR ALL USING (auth.uid() = client_id);

-- ─────────────────────────────────────────────────────────────
-- 8. TRIGGERS & FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Auto-Create Client on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.clients (id, email, agency_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'agency_name', 'Ecomate Partner')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Timestamp Update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_customers_crm_updated_at BEFORE UPDATE ON public.customers_crm FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
