-- 1. Create the Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect it with RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow anyone on the internet to read the services
CREATE POLICY "Allow public read-only access to services"
    ON public.services FOR SELECT
    USING (true);

-- Allow only admins to insert/update/delete
CREATE POLICY "Allow admin all operations on services"
    ON public.services FOR ALL
    USING (
      auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- 2. Create the Pricing Plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect it with RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone on the internet to read the plans
CREATE POLICY "Allow public read-only access to plans"
    ON public.plans FOR SELECT
    USING (true);

-- Allow only admins to insert/update/delete
CREATE POLICY "Allow admin all operations on plans"
    ON public.plans FOR ALL
    USING (
      auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- 3. Force the specific Abdelbadie account to be a full Admin!
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'abdelbadie.kertimi1212@gmail.com'
);
